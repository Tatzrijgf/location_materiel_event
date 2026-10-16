# Tasks

## 1. Nettoyage du backend et du SSR

- [x] 1.1 Supprimer `src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts` et tout `src/server/auth/*` (implémentation + specs) ; vérifier qu'aucun de ces fichiers ne subsiste via une recherche du répertoire `src/server`.
- [x] 1.2 Retirer les dépendances `express`, `cookie-parser`, `@types/express`, `@types/cookie-parser`, `@angular/ssr`, `@angular/platform-server` de `package.json` et réinstaller ; vérifier qu'aucune de ces entrées n'apparaît dans `package.json`.
- [x] 1.3 Retirer la configuration SSR/prerender de `angular.json` (options `ssr`, `prerender`, entrée serveur) et les scripts `serve:ssr:*` de `package.json` ; vérifier que `ng build` produit uniquement `dist/.../browser`.
- [x] 1.4 Supprimer tous les fichiers `*.spec.ts` restants et l'ancienne feature `src/app/features/account/*` ; vérifier qu'aucun `*.spec.ts` ne reste dans `src/`.

## 2. Angular Material

- [x] 2.1 Installer `@angular/material` et `@angular/cdk` et vérifier l'installation dans `package.json`.
- [x] 2.2 Configurer le thème Material dans `src/styles.css` et les polices/icônes dans `src/index.html` ; vérifier au démarrage qu'un composant Material (ex. `mat-toolbar`) s'affiche correctement.

## 3. Couche de stockage et modèles

- [x] 3.1 Créer `src/app/core/storage.service.ts` (accès `localStorage` préfixé `lme.` et sérialisation JSON, tolérant à l'absence de stockage) ; vérifier par un appel lecture/écriture en console que les données persistent après rechargement.
- [x] 3.2 Créer `src/app/core/models.ts` avec `Role`, `User`, `Article`, `Categorie`, `Disponibilite`, `Reservation`, `ReservationStatut` ; vérifier que `ng build` compile ces types.

## 4. Authentification mockée, gardes et routes

- [x] 4.1 Réécrire `src/app/core/auth/auth.service.ts` en version `localStorage` (signal `currentUser`, inscription, connexion, déconnexion, restauration de session, mots de passe en clair) ; vérifier manuellement inscription puis rechargement de page (session restaurée).
- [x] 4.2 Créer `src/app/core/auth/role.guard.ts` et adapter `src/app/core/auth/auth.guard.ts` ; vérifier qu'un accès anonyme à une route privée redirige vers `/login`.
- [x] 4.3 Déclarer dans `src/app/app.routes.ts` les routes `login`, `register`, `catalogue`, `articles/:id`, `articles/nouveau`, `articles/:id/modifier`, `reservations`, `reservations/nouvelle`, `reservations/:id`, `dashboard`, `admin`, avec `authGuard`/`roleGuard` et redirections par rôle ; vérifier que chaque route s'ouvre ou redirige selon le rôle.

## 5. Services métier

- [x] 5.1 Créer `src/app/core/catalogue/article.service.ts` (CRUD articles) ; vérifier manuellement création, modification et suppression d'un article persistées après rechargement.
- [x] 5.2 Créer `src/app/core/availability/availability.service.ts` (plages de disponibilité, calcul de quantité disponible et détection de chevauchement) ; vérifier qu'une période en conflit est signalée indisponible.
- [x] 5.3 Créer `src/app/core/reservations/reservation.service.ts` (création, calcul prix total et caution, changements de statut, vues par rôle, filtres statut/date) ; vérifier qu'une réservation confirmée puis annulée change bien de statut.
- [x] 5.4 Créer `src/app/core/dashboard/dashboard.service.ts` (indicateurs CLIENT, LOUEUR, ADMIN) ; vérifier que chaque rôle obtient des chiffres cohérents avec ses données.

## 6. Données de démonstration

- [x] 6.1 Créer `src/app/core/demo/mock-data.service.ts` (3 utilisateurs demo1234, 12 articles sur ≥ 2 catégories, 6 réservations à statuts variés, marqueur `lme.seeded`, réinitialisation) et le brancher à l'initialisation dans `src/app/app.config.ts` ; vérifier qu'au premier lancement les données apparaissent et qu'un rechargement ne les écrase pas.

## 7. Navigation adaptative

- [x] 7.1 Mettre à jour `src/app/app.ts`, `src/app/app.html` et `src/app/app.css` (barre de navigation Material, recherche globale, entrées conditionnées par le rôle, bouton de déconnexion) ; vérifier manuellement que le menu change entre visiteur, CLIENT, LOUEUR et ADMIN.

## 8. Composants catalogue et disponibilité

- [x] 8.1 Créer `src/app/features/catalogue/liste-articles.ts` (tableau Material + filtres catégorie, prix min/max, date de disponibilité + recherche) ; vérifier que les filtres réduisent correctement la liste.
- [x] 8.2 Créer `src/app/features/catalogue/detail-article.ts` (détail + disponibilité + accès réservation) ; vérifier l'affichage d'un article et l'état « introuvable » pour un identifiant inexistant.
- [x] 8.3 Créer `src/app/features/catalogue/formulaire-article.ts` (création et édition réservées LOUEUR/ADMIN, définition des plages de disponibilité) ; vérifier qu'un CLIENT ne peut pas y accéder et qu'un LOUEUR enregistre un article avec ses plages.

## 9. Composants réservation

- [x] 9.1 Créer `src/app/features/reservations/formulaire-reservation.ts` (dates + quantité, calcul automatique du prix total et de la caution, refus si indisponible) ; vérifier que le prix et la caution se mettent à jour en direct et qu'une période indisponible est bloquée.
- [x] 9.2 Créer `src/app/features/reservations/liste-reservations.ts` (vue client et vue loueur, filtres statut et date) ; vérifier que chaque rôle ne voit que ses réservations.
- [x] 9.3 Créer `src/app/features/reservations/detail-reservation.ts` (détail, statut, bouton Confirmer pour le loueur et Annuler pour le client) ; vérifier qu'un tiers ne peut pas accéder à la réservation et que les actions autorisées fonctionnent.

## 10. Dashboard et administration

- [x] 10.1 Créer `src/app/features/dashboard/dashboard.ts` (cartes d'indicateurs par rôle et graphique CSS pur) ; vérifier que chaque rôle affiche ses indicateurs et qu'un état vide remplace le graphique sans données.
- [x] 10.2 Créer `src/app/features/admin/admin.ts` (gestion des utilisateurs, modération des articles, réinitialisation des données de démo) réservé à l'ADMIN ; vérifier qu'un non-ADMIN est redirigé et que la réinitialisation restaure le jeu de démonstration.

## 11. Vérification d'intégration

- [x] 11.1 Vérifier que le projet ne dépasse pas 30 fichiers créés/modifiés en comptant les fichiers livrés ; si nécessaire, consolider avant de conclure.
- [x] 11.2 Exécuter `ng build` puis `ng serve` et vérifier l'absence d'erreur de compilation ; confirmer qu'aucun code serveur ni appel HTTP n'est présent (`Search` sur `http`/`/api`).
- [ ] 11.3 Parcourir manuellement le flux complet : connexion `client@demo.com` / `demo1234` → catalogue → réservation → dashboard → déconnexion ; puis connexion `loueur@demo.com` → mes articles → réservations reçues → confirmer ; puis `admin@demo.com` → admin ; vérifier que la navigation et les gardes se comportent comme attendu.

## Workflow follow-up

- Archiver le changement une fois les tâches terminées et la revue effectuée.
- Traiter séparément l'abandon ou l'archivage du changement `add-user-authentication`, désormais remplacé.
