# Spec Delta

## Purpose

Permet aux utilisateurs de créer un compte, de se connecter et de se déconnecter en toute sécurité, et fournit au reste de l'application une identité authentifiée fiable grâce au stockage protégé des mots de passe et à une session persistante.

## ADDED Requirements

### Requirement: Inscription d'un utilisateur

Le système SHALL permettre à un visiteur de créer un compte avec un nom, une adresse email unique et un mot de passe. L'email MUST être unique et le mot de passe MUST respecter une longueur minimale de 8 caractères.

#### Scenario: Inscription réussie

- **WHEN** un visiteur soumet un nom, une adresse email non encore utilisée et un mot de passe d'au moins 8 caractères
- **THEN** le compte est créé et une session authentifiée est ouverte pour cet utilisateur

#### Scenario: Adresse email déjà enregistrée

- **WHEN** un visiteur soumet une adresse email déjà associée à un compte
- **THEN** la création est refusée avec une erreur explicite et aucun nouveau compte n'est créé

#### Scenario: Données d'inscription invalides

- **WHEN** un visiteur soumet une adresse email mal formée, un nom vide ou un mot de passe de moins de 8 caractères
- **THEN** la création est refusée avec un message d'erreur indiquant le champ invalide

### Requirement: Stockage sécurisé des mots de passe

Le système SHALL conserver les mots de passe uniquement sous forme de condensat à sens unique avec un sel propre à chaque compte. Le mot de passe en clair MUST NOT être stocké, journalisé ni renvoyé par une réponse.

#### Scenario: Aucun mot de passe en clair persisté

- **WHEN** un compte est créé
- **THEN** seule la valeur dérivée du mot de passe est enregistrée et le mot de passe original n'apparaît dans aucun stockage ni réponse

#### Scenario: Vérification d'un mot de passe correct

- **WHEN** un condensat enregistré est comparé au mot de passe qui lui correspond
- **THEN** la comparaison réussit, même si deux comptes partagent le même mot de passe

### Requirement: Connexion d'un utilisateur

Le système SHALL authentifier un utilisateur à partir de son email et de son mot de passe, et MUST renvoyer la même erreur générique que l'email soit inconnu ou le mot de passe incorrect.

#### Scenario: Connexion réussie

- **WHEN** un visiteur soumet un email existant et le mot de passe correspondant
- **THEN** une session authentifiée est ouverte et l'identité de l'utilisateur est mise à disposition de l'application

#### Scenario: Identifiants invalides

- **WHEN** un visiteur soumet un email inconnu ou un mot de passe incorrect
- **THEN** la connexion est refusée avec un message générique qui ne distingue pas les deux cas

### Requirement: Persistance de la session

Le système SHALL maintenir l'état authentifié entre les requêtes au moyen d'un identifiant de session transmis dans un cookie inaccessible au JavaScript côté navigateur, et SHALL ignorer tout identifiant de session invalide ou falsifié.

#### Scenario: Session retrouvée après rechargement

- **WHEN** un utilisateur authentifié recharge une page ou revient plus tard avec le même navigateur
- **THEN** l'application le reconnaît comme connecté sans nouvel envoi d'identifiants

#### Scenario: Session invalide rejetée

- **WHEN** une requête présente un identifiant de session absent, expiré ou falsifié
- **THEN** la requête est traitée comme provenant d'un visiteur non authentifié

### Requirement: Déconnexion d'un utilisateur

Le système SHALL permettre à un utilisateur authentifié de terminer sa session, et MUST rendre l'identifiant de session inutilisable après la déconnexion.

#### Scenario: Déconnexion réussie

- **WHEN** un utilisateur authentifié demande la déconnexion
- **THEN** sa session est invalidée et l'application le traite désormais comme anonyme

#### Scenario: Réutilisation d'une session terminée

- **WHEN** une requête réutilise l'identifiant de session d'un utilisateur déconnecté
- **THEN** la requête est traitée comme provenant d'un visiteur non authentifié

### Requirement: Protection des routes nécessitant une session

Le système SHALL restreindre l'accès aux pages et ressources réservées aux utilisateurs authentifiés et MUST rediriger vers la page de connexion tout visiteur non authentifié qui tente d'y accéder.

#### Scenario: Accès refusé sans session

- **WHEN** un visiteur non authentifié demande une route protégée
- **THEN** l'accès est refusé et il est redirigé vers la page de connexion

#### Scenario: Accès autorisé avec session

- **WHEN** un utilisateur authentifié demande une route protégée
- **THEN** la route lui est présentée normalement
