# Proposal

## Why

La plateforme de location de matériel événementiel n'existe aujourd'hui que sous forme de squelette technique : un shell Angular SSR et une authentification côté serveur en cours d'implémentation. Il manque le produit lui-même (catalogue, réservations, tableaux de bord). Pour une démo rapide et autoportante, on remplace l'approche serveur par une application frontend complète, standalone, entièrement mockée dans `localStorage`, sans aucun backend.

## What Changes

- **BREAKING** : suppression de l'infrastructure serveur et SSR. Retrait de `src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`, du montage API `/api/auth`, et des dépendances `express`, `cookie-parser`, `@types/*` associées, `@angular/ssr`, `@angular/platform-server`. Le projet devient une **SPA client pur**.
- **BREAKING** : suppression de l'authentification serveur existante (`src/server/auth/*` et ses specs) et réécriture de `AuthService` en version mockée `localStorage`.
- Ajout d'Angular Material + CDK pour l'UI (aucune librairie UI n'étant installée).
- Authentification mockée client : inscription (nom, email, mot de passe, rôle), connexion, déconnexion, session persistée, mots de passe stockés en clair.
- Gestion des 3 rôles (ADMIN, CLIENT, LOUEUR) avec `AuthGuard` et `RoleGuard`, et navigation adaptative.
- CRUD complet du catalogue d'articles (modèle Article, catégories, liste/détail/formulaire) via un `ArticleService` mocké.
- Disponibilité par date (modèle Disponibilite, plages, contrôle de chevauchement).
- Module de réservation + caution : calcul du prix total et de la caution, statuts, vues client/loueur, actions confirmer/annuler.
- Recherche globale et filtres (articles : catégorie, prix min/max, date ; réservations : statut, date).
- Tableau de bord par rôle (cartes d'indicateurs) avec un graphique simple en CSS pur.
- Données de démo préchargées au premier lancement (3 utilisateurs, 12 articles, 6 réservations).
- Contraintes de livraison : **aucun test unitaire**, **aucune documentation supplémentaire**, **maximum 30 fichiers au total** (consolidation imposée).

## Capabilities

### New Capabilities
- `user-auth` : authentification mockée côté navigateur (inscription, connexion, déconnexion, session `localStorage`, rôles et contrôle d'accès par gardes).
- `catalogue` : gestion et consultation des articles (CRUD, catégories, liste/détail/formulaire, recherche et filtres articles).
- `availability` : définition et évaluation de la disponibilité d'un article par plages de dates, avec détection de chevauchement.
- `reservations` : création et cycle de vie d'une réservation (dates, quantité, calcul prix total et caution, statuts, actions client/loueur, filtres réservations).
- `dashboard` : indicateurs agrégés par rôle (CLIENT, LOUEUR, ADMIN) et graphique simple.
- `demo-data` : jeu de données de démonstration préchargé au premier lancement et réinitialisable.

### Modified Capabilities
- Aucune.

## Impact

- **Code supprimé** : `src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`, `src/server/auth/*` (implémentation + specs), ainsi que l'ancienne `AuthService`/gardes rattachés au backend.
- **Code ajouté/modifié** : `src/app/core/*` (auth mockée, stockage `localStorage`, gardes, services catalogue/availability/réservations/dashboard, données de démo), `src/app/features/*` (login, register, catalogue, réservations, dashboard, admin), `src/app/app.routes.ts`, `app.config.ts`, `app.ts`/`app.html` (navigation adaptative).
- **Dépendances** : ajout de `@angular/material` et `@angular/cdk` ; retrait de `express`, `cookie-parser`, `@types/express`, `@types/cookie-parser`, `@angular/ssr`, `@angular/platform-server`.
- **Configuration** : `angular.json` (build SSR retiré), `package.json` (scripts SSR retirés), `tsconfig` éventuellement allégé.
- **Contraintes** : budget de 30 fichiers maximum, pas de tests, pas de documentation additionnelle.
- **Hors périmètre / à traiter séparément** : le changement `add-user-authentication` (18/21) est remplacé par celui-ci ; son abandon ou archivage est traité à part.
