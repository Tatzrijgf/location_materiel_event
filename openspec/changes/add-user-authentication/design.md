# Design

## Context

Voir `proposal.md` — Why. Le projet est une application Angular 22 en rendu serveur (SSR) servie par Express 5 (`src/server.ts`). Il n'existe aujourd'hui aucun endpoint API : Express sert uniquement les fichiers statiques puis délègue le rendu à Angular. `src/app/app.routes.ts` est vide et aucune donnée n'est persistée. Les tests utilisent Vitest (`ng test`).

Contraintes structurantes :

- Les endpoints API doivent être déclarés avant le handler de rendu Angular, sinon ils seraient capturés par le fallback SSR.
- Le SSR rend les pages côté serveur, sans accès aux cookies du navigateur : l'état d'authentification ne peut donc pas être résolu de façon fiable pendant le rendu serveur.
- Aucun framework de hachage n'est présent ; `node:crypto` fournit `scrypt` et `timingSafeEqual`.
- Le périmètre (voir proposal) s'arrête à l'authentification de base : pas de rôles, pas de profil, pas de « mot de passe oublié ».

## Goals / Non-Goals

**Goals:**

- Une API `/api/auth` complète et testable (inscription, connexion, déconnexion, session courante) montée dans le serveur Express existant.
- Un stockage des mots de passe résistant (scrypt + sel unique + comparaison à temps constant).
- Une session serveur opaque transmise par cookie `httpOnly`, révocable à la déconnexion.
- Un service Angular, une garde de route fonctionnelle et des pages inscription/connexion cohérentes avec le style standalone actuel.

**Non-Goals:**

- rôles, permissions fines, espace profil, réinitialisation de mot de passe, vérification d'email, limitation de débit (rate limiting) avancée, fournisseur d'identité externe.
- Base de données externe et sessions distribuées : la première étape reste mono-instance.
- Résolution de l'état d'authentification pendant le rendu SSR (l'authentification est un état client).

## Decisions

### 1. API REST sous `/api/auth`, montée dans `src/server.ts`

Un `express.Router` dédié est monté sur `/api/auth` avant `express.static` et avant le handler Angular :

| Méthode | Chemin             | Succès                          | Erreurs principales              |
| ------- | ------------------ | ------------------------------- | -------------------------------- |
| POST    | `/api/auth/register` | `201 { user }` + cookie session | `400` validation, `409` email pris |
| POST    | `/api/auth/login`    | `200 { user }` + cookie session | `400` validation, `401` identifiants |
| POST    | `/api/auth/logout`   | `204` + cookie effacé           | —                                |
| GET     | `/api/auth/me`       | `200 { user }`                  | `401` si non authentifié         |

`user` expose uniquement `id`, `name`, `email` — jamais `passwordHash`. Les erreurs suivent un format unique `{ error: { code, message, field? } }`.

*Alternative écartée* : endpoints gérés par les routes Angular/SSR — mélange rendu et API, difficile à tester et à séparer.

*Alternative écartée* : session côté client (JWT en `localStorage`) — vulnérable au vol via XSS et non révocable simplement, ce qui contrevient à l'exigence de déconnexion invalide.

### 2. Hachage des mots de passe avec `node:crypto` scrypt

`hashPassword(plain)` génère un sel aléatoire de 16 octets et dérive la clé avec `scrypt` (paramètres par défaut de Node, longueur 64). Le condensat est encodé et auto-descriptif : `scrypt$N$r$p$<salt-base64>$<hash-base64>`. `verifyPassword(plain, stored)` relit les paramètres et le sel depuis la chaîne stockée puis compare avec `crypto.timingSafeEqual`.

*Alternatives écartées* : `bcrypt`/`argon2` (nouvelles dépendances natives, problèmes de build multiplateforme) ; `createHash('sha256')` (pas de dérivation lente, inadapté aux mots de passe).

### 3. Sessions serveur opaques + cookie `httpOnly`

À chaque connexion/inscription, le serveur génère `crypto.randomBytes(32).toString('base64url')` comme identifiant de session, stocké dans une `Map<token, { userId, createdAt, expiresAt }>` en mémoire. Le cookie de session est posé via `res.cookie(name, token, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge })`. La déconnexion supprime l'entrée de la `Map` et efface le cookie, ce qui rend tout rejeu impossible — un JWT signé ne le permettrait pas sans liste de révocation.

Un jeton opaque de 256 bits étant non devinable, **aucun secret de signature n'est nécessaire** : cette décision affine la mention de « secret de session » du proposal (finalement non requis). Les sessions vivent en mémoire : elles sont perdues au redémarrage du serveur (voir Risques).

*Alternative écartée* : cookie signé sans état — impossible à révoquer à la déconnexion, contredit le scénario « Réutilisation d'une session terminée ».

*Alternative écartée* : `express-session` — apporte un magasin et une signature superflus pour quatre routes.

### 4. Lecture des cookies

Ajout de la dépendance `cookie-parser` (petite, standard) pour exposer `req.cookies`. `res.cookie`/`res.clearCookie` sont fournis nativement par Express 5. C'est la seule dépendance ajoutée.

*Alternative écartée* : parser l'en-tête `Cookie` à la main — code fragile pour un gain marginal.

### 5. Stockage des utilisateurs dans un fichier JSON

`UserStore` charge `<DATA_FILE>` (variable d'environnement, valeur par défaut `./data/users.json`) au premier accès et réécrit le fichier à chaque création, sérialisée par une simple file d'attente pour éviter les écritures concurrentes. Modèle : `{ id, name, email, passwordHash, createdAt }`, email normalisé en minuscules et utilisé comme clé d'unicité.

*Alternative écartée* : base SQLite (dépendance native, hors périmètre de la première étape).

### 6. Service Angular, garde fonctionnelle et résolution de session côté client

- `provideHttpClient()` est ajouté dans `app.config.ts`.
- `AuthService` (root) expose un signal `currentUser` et les méthodes `register`, `login`, `logout`, `loadSession`. Les requêtes utilisent `withCredentials` (même origine ici, mais explicite).
- La session est résolue **côté client** via `/api/auth/me` dans un `provideAppInitializer` qui ne s'exécute que sur le navigateur (`isPlatformBrowser`), afin de ne pas tenter de lire des cookies pendant le SSR. Le rendu SSR présente donc un état non authentifié avant hydratation, corrigé dès l'initialisation client.
- `authGuard` (`CanActivateFn`) redirige vers `/login` si `currentUser` est nul après résolution, en conservant l'URL demandée en `queryParam` pour y revenir après connexion.

*Alternative écartée* : rendre l'état d'auth pendant le SSR — nécessite de propager les cookies de la requête dans le moteur SSR Angular et complique inutilement cette première étape.

### 7. Arborescence retenue

- Serveur : `src/server/auth/password.ts`, `users.ts`, `sessions.ts`, `router.ts`, `config.ts`; branchement dans `src/server.ts`.
- Angular : `src/app/core/auth/auth.service.ts`, `auth.guard.ts`, `auth.models.ts` ; pages `src/app/features/auth/login/*` et `.../register/*` (standalone, suffixe sans `.component`, conformément au style existant) ; page protégée `src/app/features/account/account.ts` comme démonstration ; mise à jour de `src/app/app.routes.ts`, `app.config.ts` et de la barre de navigation dans `app.html`.
- Tests Vitest : `password.spec.ts`, `users.spec.ts`, `sessions.spec.ts`, et un test du routeur qui démarre l'app sur un port éphémère et l'appelle en `fetch`.

## Risks / Trade-offs

- [Sessions perdues au redémarrage du serveur (stockage en mémoire)] → Inhérent à la première étape mono-instance ; centraliser l'accès dans `sessions.ts` pour pouvoir brancher un magasin persistant plus tard sans changer l'API.
- [Fichier JSON corrompu par deux écritures simultanées] → Écritures sérialisées dans `UserStore` ; écriture atomique (fichier temporaire puis renommage).
- [Fuite d'information via les messages d'erreur] → Message générique à la connexion ; à l'inscription, `409` sur email pris est nécessaire pour l'UX et reste le compromis usuel.
- [Bootstrap d'auth côté client uniquement (flash d'état anonyme en SSR)] → Accepté ; la garde s'exécute après la résolution client, aucune page protégée n'est rendue au serveur avec des données sensibles.
- [Absence de limitation de débit sur login/register] → Hors périmètre ; à traiter dans un changement dédié.
- [Cookies `secure` désactivés en développement] → Piloté par `NODE_ENV` ; documenter que la production doit définir `NODE_ENV=production`.

## Open Questions

- Format de persistance définitif (fichier JSON vs SQLite vs base externe) : à trancher lors d'un changement ultérieur, sans impact sur les specs ni sur les tâches de celui-ci.
