# Spec Delta

## Purpose

Jeu de données de démonstration chargé dans `localStorage` au premier lancement, afin que la plateforme soit immédiatement explorable sans saisie manuelle.

## ADDED Requirements

### Requirement: Initialisation des données de démonstration
L'application SHALL charger un jeu de données de démonstration dans `localStorage` au premier lancement, lorsque les données attendues sont absentes.

#### Scenario: Premier lancement
- **WHEN** l'application démarre alors qu'aucune donnée de démonstration n'existe
- **THEN** le jeu de démonstration est créé dans `localStorage`

#### Scenario: Lancements suivants
- **WHEN** l'application démarre alors que des données existent déjà
- **THEN** les données existantes sont conservées et ne sont pas écrasées

### Requirement: Contenu du jeu de démonstration
Le jeu de démonstration SHALL contenir au moins trois utilisateurs (admin@demo.com, client@demo.com, loueur@demo.com), douze articles répartis dans au moins deux catégories, et six réservations couvrant différents statuts.

#### Scenario: Comptes de démonstration
- **WHEN** le jeu de démonstration est chargé
- **THEN** les comptes admin@demo.com, client@demo.com et loueur@demo.com existent avec le rôle ADMIN, CLIENT et LOUEUR respectivement et le mot de passe demo1234

#### Scenario: Catalogue de démonstration
- **WHEN** le jeu de démonstration est chargé
- **THEN** douze articles variés couvrant au moins deux catégories sont disponibles

#### Scenario: Réservations de démonstration
- **WHEN** le jeu de démonstration est chargé
- **THEN** six réservations existent et présentent plusieurs statuts différents

### Requirement: Réinitialisation des données de démonstration
L'application SHALL permettre de rétablir le jeu de démonstration, ce qui MUST remplacer les données courantes par le jeu initial.

#### Scenario: Réinitialisation demandée
- **WHEN** un utilisateur déclenche la réinitialisation des données de démonstration
- **THEN** les données courantes sont remplacées par le jeu de démonstration initial
