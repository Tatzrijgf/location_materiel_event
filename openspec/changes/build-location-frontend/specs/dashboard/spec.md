# Spec Delta

## Purpose

Tableau de bord présentant à chaque rôle les indicateurs d'activité qui le concernent, avec une visualisation graphique simple calculée à partir des données de `localStorage`.

## ADDED Requirements

### Requirement: Tableau de bord CLIENT
L'application SHALL afficher au CLIENT le nombre de ses réservations, le montant total qu'il a dépensé et le nombre de ses réservations en cours.

#### Scenario: Indicateurs client
- **WHEN** un CLIENT ouvre son tableau de bord
- **THEN** le nombre de réservations, le montant total dépensé et le nombre de réservations en cours sont affichés et correspondent à ses propres réservations

### Requirement: Tableau de bord LOUEUR
L'application SHALL afficher au LOUEUR le nombre de ses articles, le nombre de réservations reçues, les revenus estimés et un taux d'occupation.

#### Scenario: Indicateurs loueur
- **WHEN** un LOUEUR ouvre son tableau de bord
- **THEN** le nombre d'articles, le nombre de réservations reçues, les revenus estimés et le taux d'occupation sont affichés et correspondent à ses propres articles

### Requirement: Tableau de bord ADMIN
L'application SHALL afficher à l'ADMIN le nombre d'utilisateurs, le nombre d'articles, le nombre de réservations et le chiffre d'affaires global.

#### Scenario: Indicateurs admin
- **WHEN** un ADMIN ouvre son tableau de bord
- **THEN** le nombre d'utilisateurs, le nombre d'articles, le nombre de réservations et le chiffre d'affaires global sont affichés pour l'ensemble de la plateforme

### Requirement: Visualisation graphique
L'application SHALL présenter au moins un graphique simple (barres ou camembert) construit sans bibliothèque externe, en CSS pur, représentant une répartition issue des données du tableau de bord.

#### Scenario: Graphique affiché
- **WHEN** un utilisateur ouvre un tableau de bord comportant des données
- **THEN** au moins un graphique s'affiche et reflète les données calculées pour son rôle

#### Scenario: Aucune donnée
- **WHEN** les données nécessaires au graphique sont absentes
- **THEN** un état vide est affiché à la place du graphique
