# Design

## Context

Voir `proposal.md` - Why. État actuel : projet Angular 22 (satisfait « 17+ »), standalone, actuellement configuré en **SSR Angular sur un hôte Express** (`src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`) avec une authentification serveur (`src/server/auth/*`, API `/api/auth`) en cours d'implémentation via le changement `add-user-authentication`. Aucune librairie UI n'est installée. Aucun spec principal n'existe (`openspec/specs/` vide).

Contraintes du changement : aucun backend, aucune dépendance backend, tout en `localStorage`, mots de passe en clair, jeton = objet JSON, UI Angular Material, **aucun test**, **aucune doc supplémentaire**, **≤ 30 fichiers**.

Références de comportement : `specs/user-auth`, `specs/catalogue`, `specs/availability`, `specs/reservations`, `specs/dashboard`, `specs/demo-data`.

## Goals / Non-Goals

**Goals:**
- Application 100 % client, sans serveur ni API, persistée dans `localStorage`.
- Couvrir les 7 fonctionnalités obligatoires et les 3 rôles.
- Tenir dans un budget de 30 fichiers (nouveaux + modifiés).

**Non-Goals:**
- Sécurité réelle (hachage, jeton signé, contrôle serveur).
- Tests automatisés et documentation additionnelle.
- Synchronisation multi-appareils ou persistance serveur.
- Internationalisation, accessibilité avancée, thème sombre.

## Decisions

### D1 - SPA client pur, suppression du SSR
Supprimer toute l'infrastructure SSR/Express et passer en rendu client.
- Suppressions : `src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`, `src/server/auth/*`.
- Dépendances retirées : `express`, `cookie-parser`, `@types/express`, `@types/cookie-parser`, `@angular/ssr`, `@angular/platform-server`.
- Config : retirer l'option `ssr`/`prerender` et les scripts `serve:ssr:*` de `angular.json`/`package.json`.
- *Pourquoi* : la contrainte interdit tout serveur Node/Express ; le SSR n'apporte rien à une démo mockée.
- *Alternatives* : garder le SSR (rejeté : viole la contrainte) ; SSR pour pages publiques seulement (complexité inutile).

### D2 - Angular Material + CDK
Installer `@angular/material` et `@angular/cdk`, thème dans `src/styles.css`, polices/icônes via `src/index.html`.
- *Pourquoi* : aucune UI installée ; Material est le choix par défaut demandé et fournit tableau, formulaire, cartes, dialogues.
- *Alternatives* : Tailwind (non installé, plus de config) ; CSS pur (moins de composants prêts).

### D3 - Couche de stockage unique
`StorageService` encapsule les accès `localStorage` : clés préfixées (`lme.users`, `lme.session`, `lme.articles`, `lme.availabilities`, `lme.reservations`, `lme.seeded`) et sérialisation JSON.
- *Pourquoi* : une seule frontière pour la persistance, facile à réinitialiser et à tester manuellement.
- *Alternatives* : appels `localStorage` dispersés (rejeté : duplication, incohérences).

### D4 - Modèles dans un fichier unique
`src/app/core/models.ts` regroupe `Role`, `User`, `Article`, `Categorie`, `Disponibilite`, `Reservation`, `ReservationStatut`.
- *Pourquoi* : réduire le nombre de fichiers pour respecter le budget.
- *Alternatives* : un modèle par domaine (rejeté : dépasse le budget).

### D5 - Templates et styles en ligne
Chaque composant de `features/` est un fichier `.ts` unique avec `template` et `styles` en ligne (pas de `.html`/`.css` séparés).
- *Pourquoi* : chaque composant séparé coûterait 3 fichiers ; l'inline tient le budget.
- *Alternatives* : fichiers séparés (rejeté : > 30 fichiers).

### D6 - Authentification et jeton mockés
`AuthService` (signal `currentUser`) lit/écrit la session dans `localStorage`. Mots de passe en clair, jeton = objet JSON de session. Aucun appel HTTP.
- *Pourquoi* : exigé par la demande (démo).
- *Alternatives* : hachage/`jsonwebtoken` (interdit).

### D7 - Gardes `authGuard` et `roleGuard`
`authGuard` bloque les routes privées et redirige vers `/login` ; `roleGuard` (fonction configurée via `data.roles`) restreint par rôle.
- *Pourquoi* : contrôle d'accès entièrement client, cohérent avec les specs.

### D8 - Données de démonstration semées une seule fois
`MockDataService` insère 3 utilisateurs, 12 articles, 6 réservations (`lme.seeded` comme marqueur) et sait réinitialiser.
- *Pourquoi* : éviter d'écraser les modifications de l'utilisateur ; permettre une remise à zéro.

### D9 - Graphique en CSS pur
Barres/camembert faits avec des `div` et styles, sans `ngx-charts`.
- *Pourquoi* : zéro dépendance supplémentaire, budget maîtrisé.

### D10 - Pas de tests, fichiers `*.spec.ts` supprimés
Supprimer les specs existantes et ne pas en créer.
- *Pourquoi* : contrainte explicite (« ne pas écrire de tests pour l'instant »).

### Manifeste cible (≤ 30 fichiers)
- Racine/config (9) : `package.json`, `angular.json`, `src/styles.css`, `src/index.html`, `src/main.ts`, `src/app/app.config.ts`, `src/app/app.ts`, `src/app/app.html`, `src/app/app.routes.ts`.
- Core (10) : `core/storage.service.ts`, `core/models.ts`, `core/auth/auth.service.ts`, `core/auth/auth.guard.ts`, `core/auth/role.guard.ts`, `core/catalogue/article.service.ts`, `core/availability/availability.service.ts`, `core/reservations/reservation.service.ts`, `core/dashboard/dashboard.service.ts`, `core/demo/mock-data.service.ts`.
- Features (10) : `features/auth/login.ts`, `features/auth/register.ts`, `features/catalogue/liste-articles.ts`, `features/catalogue/detail-article.ts`, `features/catalogue/formulaire-article.ts`, `features/reservations/formulaire-reservation.ts`, `features/reservations/liste-reservations.ts`, `features/reservations/detail-reservation.ts`, `features/dashboard/dashboard.ts`, `features/admin/admin.ts`.
- Suppressions : SSR/serveur, `src/app/features/account/*`, specs.

## Risks / Trade-offs

- [Budget 30 fichiers très serré] → templates/styles en ligne, modèles consolidés, un seul formulaire d'article réutilisé création/édition.
- [Suppression du SSR casse la configuration de build] → mettre à jour `angular.json` et `package.json`, vérifier `ng build` et `ng serve` après retrait.
- [Accès `localStorage` indisponible hors navigateur] → SPA client pur, pas d'exécution serveur ; `StorageService` tolère l'absence de `localStorage`.
- [Material alourdit le bundle] → acceptable pour une démo ; n'importer que les modules nécessaires.
- [Suppression des fichiers de `add-user-authentication`] → changement remplacé ; son abandon/archivage est traité à part.
- [Collision de clés `localStorage`] → préfixe `lme.` et versionnement des données.

## Migration Plan

1. Retirer l'infrastructure SSR/serveur et les dépendances backend ; mettre à jour `angular.json`/`package.json`.
2. Installer Angular Material + CDK ; configurer le thème et les polices.
3. Ajouter `StorageService`, `models.ts` et les services core (articles, disponibilité, réservations, dashboard, démo).
4. Remplacer `AuthService` et les gardes par les versions mockées ; mettre à jour `app.routes.ts`.
5. Construire les composants `features/` (inline) et la navigation adaptative dans `app.ts`/`app.html`.
6. Brancher le semis de données de démonstration à l'initialisation.
7. Vérifier manuellement : `ng build` puis `ng serve`, parcours inscription → catalogue → réservation → dashboard → déconnexion.

Rollback : revenir au commit précédent (le changement `add-user-authentication` reste disponible séparément).

## Open Questions

- Type exact du graphique (barres ou camembert) : à trancher à l'implémentation ; les specs n'exigent qu'« au moins un graphique simple ».
