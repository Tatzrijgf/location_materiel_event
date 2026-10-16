# Proposal

## Why

L'application de location de matériel événementiel ne dispose aujourd'hui d'aucun mécanisme d'identification : chaque visiteur est anonyme et aucune donnée ne peut être rattachée à un utilisateur. Pour permettre à terme la gestion des comptes, des réservations et des accès personnalisés, il faut une base d'authentification fiable dès maintenant, avec un stockage des mots de passe réellement sécurisé.

## What Changes

- Nouvelle API d'authentification côté serveur (Express, montée dans `src/server.ts`) exposant des endpoints sous `/api/auth`.
- Inscription d'un utilisateur : création de compte avec nom, email unique et mot de passe.
- Connexion : vérification des identifiants et ouverture d'une session persistante via cookie `httpOnly`.
- Déconnexion : invalidation de la session et suppression du cookie.
- Stockage sécurisé des mots de passe : hachage avec sel, jamais de mot de passe en clair, comparaison à temps constant.
- Endpoint de session courante permettant au frontend de connaître l'utilisateur connecté.
- Côté Angular : service d'authentification, pages inscription/connexion, affichage de l'état connecté et garde de route protégeant les pages nécessitant une session.
- Persistance des utilisateurs dans un stockage serveur (fichier JSON local pour cette première étape).

## Capabilities

### New Capabilities

- `user-auth`: inscription, connexion, déconnexion d'un utilisateur, gestion de session par cookie sécurisé, stockage et vérification sécurisés des mots de passe, et protection des routes nécessitant une session.

### Modified Capabilities

<!-- Aucune : ce changement introduit une capacité nouvelle, aucune capacité existante n'est modifiée. -->

## Impact

- **Serveur** : `src/server.ts` — ajout des routes `/api/auth/*`, de la gestion des cookies et du chargement de la configuration.
- **Nouveau code serveur** : services d'authentification, de hachage de mot de passe, de session et de stockage utilisateur.
- **Angular** : `src/app/app.routes.ts` — ajout des routes `login`, `register` et d'une route protégée ; nouveau service d'auth, nouvelle garde de route, nouveaux composants.
- **Dépendances** : aucune dépendance externe requise pour le hachage (`node:crypto`, scrypt) ; cookie de session signé géré côté serveur.
- **Configuration** : ajout d'un secret de session et d'un chemin de stockage via variables d'environnement.
- **Tests** : tests unitaires Vitest pour le hachage, la validation et les handlers d'authentification.
