# Spec Delta

## Purpose

Définition et évaluation de la disponibilité du matériel par plages de dates, afin de savoir si un article peut être réservé sur une période et en quelle quantité.

## ADDED Requirements

### Requirement: Modèle de disponibilité
L'application SHALL représenter une disponibilité par un identifiant d'article, une date de début, une date de fin et une quantité disponible.

#### Scenario: Disponibilité enregistrée
- **WHEN** une plage de disponibilité est enregistrée
- **THEN** elle contient un identifiant d'article, une date de début, une date de fin et une quantité disponible, la date de fin n'étant pas antérieure à la date de début

### Requirement: Définition des plages de disponibilité
L'application SHALL permettre au LOUEUR propriétaire d'un article, ainsi qu'à un ADMIN, de définir une ou plusieurs plages de disponibilité pour cet article depuis le formulaire d'article.

#### Scenario: Ajout d'une plage
- **WHEN** un LOUEUR enregistre une plage de dates pour l'un de ses articles
- **THEN** la plage est associée à l'article et persistée dans `localStorage`

#### Scenario: Plage incohérente
- **WHEN** un LOUEUR saisit une date de fin antérieure à la date de début
- **THEN** la plage est refusée et une erreur est signalée

### Requirement: Évaluation de la disponibilité sur une période
L'application SHALL déterminer, pour un article et une période demandée, la quantité disponible et indiquer si l'article peut être réservé.

#### Scenario: Article disponible
- **WHEN** un article possède une quantité suffisante au regard des réservations et plages couvrant la période demandée
- **THEN** l'article est indiqué comme disponible pour la quantité demandée

#### Scenario: Article indisponible
- **WHEN** la quantité disponible sur la période est insuffisante
- **THEN** l'article est indiqué comme indisponible pour la quantité demandée

### Requirement: Détection de chevauchement
L'application SHALL détecter le chevauchement entre une période demandée et les périodes déjà réservées pour un article, et MUST refuser une réservation qui rendrait la quantité disponible négative.

#### Scenario: Chevauchement sans dépassement
- **WHEN** une nouvelle réservation chevauche une réservation existante sans dépasser la quantité disponible de l'article
- **THEN** la réservation est acceptée

#### Scenario: Chevauchement avec dépassement
- **WHEN** une nouvelle réservation chevauche des réservations existantes et dépasserait la quantité disponible sur au moins un jour
- **THEN** la réservation est refusée et un message explique l'indisponibilité
