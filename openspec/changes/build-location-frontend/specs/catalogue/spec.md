# Spec Delta

## Purpose

Gestion et consultation du catalogue de matériel événementiel : création, consultation, modification et suppression d'articles, avec catégories, recherche et filtres, le tout persisté dans `localStorage`.

## ADDED Requirements

### Requirement: Modèle d'article
L'application SHALL représenter chaque article par un identifiant, un nom, une description, une catégorie (CHAISES, BACHES, SONO ou AUTRE), un prix par jour, une caution, une quantité totale, une quantité disponible, une photo, un identifiant de loueur et un statut.

#### Scenario: Article complet
- **WHEN** un article est enregistré
- **THEN** toutes les propriétés du modèle sont présentes, la quantité disponible étant au plus égale à la quantité totale

### Requirement: Consultation de la liste des articles
L'application SHALL afficher la liste des articles disponibles à tous les visiteurs, sous forme de tableau.

#### Scenario: Liste affichée
- **WHEN** un visiteur ouvre la page du catalogue
- **THEN** la liste des articles s'affiche dans un tableau avec au minimum le nom, la catégorie, le prix par jour et la quantité disponible

#### Scenario: Catalogue vide
- **WHEN** aucun article n'existe
- **THEN** un message indique que le catalogue est vide

### Requirement: Consultation du détail d'un article
L'application SHALL afficher le détail complet d'un article, y compris sa photo, son prix, sa caution et sa disponibilité.

#### Scenario: Détail d'un article existant
- **WHEN** un visiteur ouvre la page d'un article existant
- **THEN** toutes les informations de l'article s'affichent

#### Scenario: Article inexistant
- **WHEN** un visiteur demande un article dont l'identifiant n'existe pas
- **THEN** l'application affiche un message d'article introuvable

### Requirement: Création d'un article
L'application SHALL permettre aux utilisateurs de rôle LOUEUR et ADMIN de créer un article via un formulaire.

#### Scenario: Création par un LOUEUR
- **WHEN** un LOUEUR soumet un formulaire d'article valide
- **THEN** l'article est enregistré avec le loueur courant comme identifiant de loueur

#### Scenario: Création refusée à un CLIENT
- **WHEN** un CLIENT tente d'accéder au formulaire de création
- **THEN** l'accès est refusé

### Requirement: Modification d'un article
L'application SHALL permettre au LOUEUR propriétaire d'un article, ainsi qu'à un ADMIN, de modifier cet article.

#### Scenario: Modification par le propriétaire
- **WHEN** le LOUEUR propriétaire modifie un article
- **THEN** les changements sont enregistrés dans `localStorage`

#### Scenario: Modification refusée à un autre loueur
- **WHEN** un LOUEUR tente de modifier un article dont il n'est pas le propriétaire
- **THEN** l'accès est refusé

### Requirement: Suppression d'un article
L'application SHALL permettre au LOUEUR propriétaire d'un article, ainsi qu'à un ADMIN, de supprimer cet article.

#### Scenario: Suppression confirmée
- **WHEN** le propriétaire ou un ADMIN confirme la suppression d'un article
- **THEN** l'article est retiré de `localStorage` et n'apparaît plus dans la liste

### Requirement: Catégories d'articles
L'application SHALL classer chaque article dans une catégorie parmi CHAISES, BACHES, SONO et AUTRE.

#### Scenario: Filtre par catégorie
- **WHEN** un visiteur sélectionne une catégorie
- **THEN** seuls les articles de cette catégorie sont affichés

### Requirement: Recherche d'articles
L'application SHALL proposer une barre de recherche globale accessible depuis l'en-tête qui filtre les articles par nom ou description.

#### Scenario: Recherche par terme
- **WHEN** un visiteur saisit un terme dans la barre de recherche globale
- **THEN** les articles dont le nom ou la description contient ce terme sont proposés

### Requirement: Filtres sur les articles
L'application SHALL permettre de filtrer la liste des articles par catégorie, par prix minimum et maximum, et par date de disponibilité.

#### Scenario: Filtre par prix
- **WHEN** un visiteur indique un prix minimum et un prix maximum
- **THEN** seuls les articles dont le prix par jour est compris dans cet intervalle sont affichés

#### Scenario: Filtre par date de disponibilité
- **WHEN** un visiteur indique une date souhaitée
- **THEN** seuls les articles disponibles à cette date sont affichés

#### Scenario: Combinaison de filtres
- **WHEN** un visiteur combine plusieurs filtres
- **THEN** seuls les articles satisfaisant tous les filtres actifs sont affichés
