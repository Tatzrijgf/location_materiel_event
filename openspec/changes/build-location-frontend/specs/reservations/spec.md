# Spec Delta

## Purpose

Module métier central de réservation de matériel : sélection des dates et quantités, calcul du prix total et de la caution, suivi du cycle de vie des réservations et vues dédiées aux clients et aux loueurs.

## ADDED Requirements

### Requirement: Modèle de réservation
L'application SHALL représenter une réservation par un identifiant, un identifiant d'article, un identifiant de client, un identifiant de loueur, une date de début, une date de fin, une quantité, un prix total, une caution et un statut.

#### Scenario: Réservation enregistrée
- **WHEN** une réservation est créée
- **THEN** elle contient les identifiants d'article, de client et de loueur, les dates, la quantité, le prix total, la caution et un statut

### Requirement: Création d'une réservation
L'application SHALL permettre à un utilisateur de rôle CLIENT de réserver un article en sélectionnant une date de début, une date de fin et une quantité.

#### Scenario: Réservation valide
- **WHEN** un CLIENT soumet des dates valides et une quantité disponible
- **THEN** la réservation est créée avec le statut EN_ATTENTE

#### Scenario: Réservation à une date indisponible
- **WHEN** un CLIENT soumet une période pour laquelle la quantité disponible est insuffisante
- **THEN** la réservation est refusée et un message d'indisponibilité est affiché

#### Scenario: Période invalide
- **WHEN** un CLIENT soumet une date de fin antérieure à la date de début
- **THEN** la réservation est refusée et une erreur est signalée

### Requirement: Calcul du prix total et de la caution
L'application SHALL calculer automatiquement le prix total comme le produit du nombre de jours, du prix par jour et de la quantité, et SHALL afficher la caution correspondante.

#### Scenario: Calcul automatique
- **WHEN** un CLIENT choisit des dates et une quantité pour un article
- **THEN** le prix total et la caution sont affichés et se mettent à jour avant validation

### Requirement: Caution simulée
L'application SHALL afficher la caution d'une réservation sans effectuer de prélèvement réel.

#### Scenario: Caution informative
- **WHEN** une réservation est affichée
- **THEN** le montant de la caution est visible mais aucun paiement ou prélèvement n'est déclenché

### Requirement: Cycle de vie de la réservation
L'application SHALL faire évoluer le statut d'une réservation parmi EN_ATTENTE, CONFIRMEE, EN_COURS, TERMINEE et ANNULEE.

#### Scenario: Confirmation par le loueur
- **WHEN** le loueur d'une réservation en statut EN_ATTENTE la confirme
- **THEN** le statut passe à CONFIRMEE

#### Scenario: Annulation par le client
- **WHEN** le client propriétaire annule une réservation non terminée
- **THEN** le statut passe à ANNULEE

#### Scenario: Confirmation refusée à un tiers
- **WHEN** un utilisateur autre que le loueur concerné tente de confirmer une réservation
- **THEN** l'action est refusée

### Requirement: Vues des réservations par rôle
L'application SHALL afficher aux clients leurs propres réservations et aux loueurs les réservations reçues sur leurs articles.

#### Scenario: Vue client
- **WHEN** un CLIENT ouvre la liste de ses réservations
- **THEN** seules les réservations dont il est le client sont affichées

#### Scenario: Vue loueur
- **WHEN** un LOUEUR ouvre les réservations reçues
- **THEN** seules les réservations portant sur ses articles sont affichées

### Requirement: Détail d'une réservation
L'application SHALL afficher le détail d'une réservation, incluant l'article, les dates, la quantité, le prix total, la caution et le statut, ainsi que les actions disponibles selon le rôle.

#### Scenario: Détail avec actions
- **WHEN** l'utilisateur concerné ouvre le détail d'une réservation
- **THEN** le détail s'affiche et les actions autorisées (confirmer pour le loueur, annuler pour le client) sont proposées

#### Scenario: Détail inaccessible
- **WHEN** un utilisateur ouvre le détail d'une réservation qui ne le concerne pas
- **THEN** l'accès est refusé

### Requirement: Filtres sur les réservations
L'application SHALL permettre de filtrer la liste des réservations par statut et par date.

#### Scenario: Filtre par statut
- **WHEN** l'utilisateur sélectionne un statut
- **THEN** seules les réservations ayant ce statut sont affichées

#### Scenario: Filtre par date
- **WHEN** l'utilisateur indique une date
- **THEN** seules les réservations concernant cette date sont affichées
