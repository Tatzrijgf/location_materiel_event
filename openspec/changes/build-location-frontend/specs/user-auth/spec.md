# Spec Delta

## Purpose

Authentification entièrement côté navigateur pour la plateforme de location : création de compte, connexion, déconnexion et session persistée dans `localStorage`, avec gestion des rôles CLIENT, LOUEUR et ADMIN.

## ADDED Requirements

### Requirement: Inscription d'un utilisateur
L'application SHALL permettre à un visiteur de créer un compte en saisissant un nom, un email, un mot de passe et un rôle parmi CLIENT ou LOUEUR. L'email MUST être unique et les mots de passe MUST être stockés en clair dans `localStorage`.

#### Scenario: Inscription réussie
- **WHEN** un visiteur soumet un nom, un email non utilisé, un mot de passe et un rôle CLIENT ou LOUEUR
- **THEN** le compte est enregistré dans `localStorage` et la session de l'utilisateur est ouverte

#### Scenario: Email déjà utilisé
- **WHEN** un visiteur soumet un email déjà enregistré
- **THEN** l'inscription est refusée et un message d'erreur est affiché

#### Scenario: Champs obligatoires manquants
- **WHEN** un visiteur soumet le formulaire avec un champ requis vide
- **THEN** l'inscription est refusée et le formulaire signale les champs invalides

### Requirement: Connexion d'un utilisateur
L'application SHALL authentifier un utilisateur à partir d'un email et d'un mot de passe enregistrés, et ouvrir une session en cas de succès.

#### Scenario: Connexion réussie
- **WHEN** un utilisateur soumet un email et un mot de passe correspondant à un compte existant
- **THEN** la session est ouverte et l'utilisateur est redirigé selon son rôle

#### Scenario: Identifiants invalides
- **WHEN** un utilisateur soumet un email inconnu ou un mot de passe incorrect
- **THEN** la connexion est refusée et un message d'erreur est affiché sans divulguer lequel des deux champs est faux

### Requirement: Session persistée dans le navigateur
L'application SHALL conserver l'utilisateur connecté dans `localStorage` sous forme d'objet JSON, et SHALL restaurer cette session au rechargement de la page. Les données de session MUST NOT être persistées côté serveur.

#### Scenario: Restauration au rechargement
- **WHEN** un utilisateur connecté recharge l'application
- **THEN** il est reconnu comme connecté sans nouvelle saisie d'identifiants

#### Scenario: Session locale absente ou invalide
- **WHEN** l'application démarre sans session valide dans `localStorage`
- **THEN** elle considère l'utilisateur comme non connecté

### Requirement: Déconnexion
L'application SHALL permettre à un utilisateur connecté de se déconnecter, ce qui MUST supprimer la session de `localStorage`.

#### Scenario: Déconnexion
- **WHEN** un utilisateur connecté active l'action de déconnexion
- **THEN** la session est supprimée et l'utilisateur est considéré comme non connecté

### Requirement: Redirection selon le rôle après connexion
L'application SHALL rediriger l'utilisateur vers une page d'accueil adaptée à son rôle après une connexion ou une inscription réussie.

#### Scenario: Redirection ADMIN
- **WHEN** un utilisateur de rôle ADMIN se connecte
- **THEN** il est redirigé vers l'espace d'administration

#### Scenario: Redirection CLIENT
- **WHEN** un utilisateur de rôle CLIENT se connecte
- **THEN** il est redirigé vers le catalogue ou son tableau de bord

#### Scenario: Redirection LOUEUR
- **WHEN** un utilisateur de rôle LOUEUR se connecte
- **THEN** il est redirigé vers la gestion de ses articles ou son tableau de bord

### Requirement: Protection des routes privées
L'application SHALL empêcher l'accès aux routes privées lorsqu'aucun utilisateur n'est connecté, en redirigeant vers la page de connexion.

#### Scenario: Accès anonyme à une route privée
- **WHEN** un visiteur non connecté tente d'ouvrir une route privée
- **THEN** il est redirigé vers la page de connexion

#### Scenario: Accès autorisé pour un utilisateur connecté
- **WHEN** un utilisateur connecté ouvre une route privée autorisée à son rôle
- **THEN** la page demandée s'affiche

### Requirement: Contrôle d'accès par rôle
L'application SHALL restreindre certaines routes à des rôles déterminés et MUST refuser l'accès lorsque le rôle de l'utilisateur connecté ne correspond pas.

#### Scenario: Rôle autorisé
- **WHEN** un utilisateur connecté ouvre une route correspondant à son rôle
- **THEN** la page s'affiche

#### Scenario: Rôle non autorisé
- **WHEN** un utilisateur connecté ouvre une route réservée à un autre rôle
- **THEN** l'accès est refusé et l'utilisateur est redirigé vers une page autorisée

### Requirement: Navigation adaptative
L'application SHALL afficher un menu de navigation dont les entrées visibles dépendent du rôle de l'utilisateur connecté, et un lien de connexion lorsque personne n'est connecté.

#### Scenario: Menu pour un visiteur
- **WHEN** aucun utilisateur n'est connecté
- **THEN** le menu affiche les liens de connexion et d'inscription

#### Scenario: Menu pour un utilisateur connecté
- **WHEN** un utilisateur est connecté
- **THEN** le menu affiche uniquement les entrées autorisées par son rôle et un bouton de déconnexion

### Requirement: Jeton de session simulé
L'application SHALL représenter la session par un objet JSON stocké dans `localStorage`, sans signature cryptographique ni validation serveur.

#### Scenario: Nature du jeton
- **WHEN** une session est ouverte
- **THEN** les données de session stockées sont un objet JSON lisible, modifiable par le navigateur, et non un jeton signé
