# Tasks

## 1. Fondations serveur

- [x] 1.1 Créer `src/server/auth/` (dossiers et fichiers vides `password.ts`, `users.ts`, `sessions.ts`, `router.ts`, `config.ts`) et vérifier que `npx tsc --noEmit -p tsconfig.app.json` ne remonte aucune erreur
- [x] 1.2 Ajouter la dépendance `cookie-parser` et son type `@types/cookie-parser` (`npm install cookie-parser @types/cookie-parser`) puis vérifier que l'installation réussit et que `package.json` les référence
- [x] 1.3 Implémenter `config.ts` (nom du cookie de session, chemin `DATA_FILE` par défaut `./data/users.json`, `secure` selon `NODE_ENV`, durée de session) et vérifier par un test Vitest que les valeurs par défaut et la lecture d'environnement sont correctes

## 2. Hachage sécurisé des mots de passe

- [x] 2.1 Implémenter `password.ts` (`hashPassword`, `verifyPassword`) avec `node:crypto` scrypt, sel aléatoire et comparaison `timingSafeEqual`, et vérifier par `password.spec.ts` qu'un mot de passe valide est accepté
- [x] 2.2 Vérifier par `password.spec.ts` qu'un mauvais mot de passe est refusé, que le condensat ne contient pas le mot de passe en clair et que deux hachages du même mot de passe diffèrent (sel unique)

## 3. Stockage des utilisateurs

- [x] 3.1 Implémenter `users.ts` (`UserStore` : chargement du fichier JSON, `findByEmail`, `create`) avec email normalisé en minuscules et écriture atomique sérialisée, et vérifier par `users.spec.ts` qu'un utilisateur créé est relu après rechargement du store
- [x] 3.2 Vérifier par `users.spec.ts` qu'un email déjà enregistré est rejeté et que les données persistées contiennent `passwordHash` mais jamais le mot de passe en clair

## 4. Gestion de session

- [x] 4.1 Implémenter `sessions.ts` (création d'un jeton `randomBytes(32)` base64url, `get`, `destroy`, expiration) et vérifier par `sessions.spec.ts` qu'un jeton créé renvoie l'utilisateur associé
- [x] 4.2 Vérifier par `sessions.spec.ts` qu'un jeton inconnu, expiré ou détruit est rejeté

## 5. API d'authentification

- [x] 5.1 Implémenter `router.ts` : `POST /register`, `POST /login`, `POST /logout`, `GET /me` avec validation des entrées et format d'erreur `{ error: { code, message, field? } }`, puis vérifier par `router.spec.ts` (serveur sur port éphémère) que l'inscription renvoie `201`, le cookie de session, et un utilisateur sans `passwordHash`
- [x] 5.2 Vérifier par `router.spec.ts` que connexion + `/me` retournent le bon utilisateur, que des identifiants invalides renvoient `401` avec un message générique, que la déconnexion invalide le jeton (rejeu `/me` → `401`) et que l'inscription avec un email déjà pris renvoie `409`
- [x] 5.3 Brancher `cookie-parser` et le routeur sur `/api/auth` dans `src/server.ts`, avant les fichiers statiques et le handler Angular, et vérifier par un `curl`/`fetch` local que `/api/auth/me` répond `401` sans cookie

## 6. Auth côté Angular

- [x] 6.1 Ajouter `provideHttpClient()` dans `src/app/app.config.ts` et créer les modèles `auth.models.ts`, puis vérifier que `npm run build` réussit
- [x] 6.2 Implémenter `auth.service.ts` (signal `currentUser`, `register`, `login`, `logout`, `loadSession`) et vérifier par `auth.service.spec.ts` (HttpClient de test) que l'état `currentUser` est mis à jour après connexion et vidé après déconnexion
- [x] 6.3 Ajouter un `provideAppInitializer` client-only (via `isPlatformBrowser`) appelant `loadSession`, et vérifier que l'application démarre sans tentative d'appel API côté SSR (`npm run build` puis démarrage du serveur rendu)

## 7. Pages, garde et navigation

- [x] 7.1 Créer les composants standalone `features/auth/login` et `features/auth/register` (Formulaires réactifs, gestion des erreurs API, redirection après succès) et vérifier par leurs `.spec.ts` que la soumission appelle `AuthService` et affiche l'erreur en cas d'échec
- [x] 7.2 Créer la page protégée `features/account/account.ts` (affiche l'utilisateur courant et un bouton de déconnexion) et vérifier qu'elle compile (`npm run build`)
- [x] 7.3 Implémenter `auth.guard.ts` et déclarer les routes `login`, `register`, `account` (protégée) dans `src/app/app.routes.ts`, puis vérifier par `auth.guard.spec.ts` qu'un visiteur anonyme est redirigé vers `/login` et qu'un utilisateur authentifié passe
- [ ] 7.4 Ajouter les liens de navigation (connexion/inscription ou utilisateur connecté + déconnexion) dans `src/app/app.html` et vérifier dans le navigateur (`npm start`) que l'affichage suit l'état de connexion

## 8. Vérification d'intégration

- [ ] 8.1 Exécuter `npm test` et vérifier que l'ensemble des tests passe
- [ ] 8.2 Vérifier manuellement le parcours complet dans le navigateur : inscription → accès à `/account` → déconnexion → `/account` redirige vers `/login` → reconnexion, et vérifier que le cookie de session est `httpOnly`

## Workflow follow-up

- Archiver le changement une fois les exigences de revue du projet satisfaites.
- Vérifier le résultat archivé (`openspec validate` puis `openspec archive`).
