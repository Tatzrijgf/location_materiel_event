export type Role = 'ADMIN' | 'CLIENT' | 'LOUEUR';

export type Categorie = 'CHAISES' | 'BACHES' | 'SONO' | 'AUTRE';

export type ArticleStatut = 'DISPONIBLE' | 'SUSPENDU';

export type ReservationStatut =
  | 'EN_ATTENTE'
  | 'CONFIRMEE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'ANNULEE';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  actif: boolean;
}

export interface Article {
  id: string;
  nom: string;
  description: string;
  categorie: Categorie;
  prixJour: number;
  caution: number;
  quantiteTotale: number;
  quantiteDisponible: number;
  photo: string;
  loueurId: string;
  statut: ArticleStatut;
}

export interface Disponibilite {
  id: string;
  articleId: string;
  dateDebut: string;
  dateFin: string;
  quantiteDisponible: number;
}

export interface Reservation {
  id: string;
  articleId: string;
  clientId: string;
  loueurId: string;
  dateDebut: string;
  dateFin: string;
  quantite: number;
  prixTotal: number;
  caution: number;
  statut: ReservationStatut;
  createdAt: string;
}

export const ROLES: readonly Role[] = ['ADMIN', 'CLIENT', 'LOUEUR'];

export const ROLES_INSCRIPTION: readonly Role[] = ['CLIENT', 'LOUEUR'];

export const CATEGORIES: readonly Categorie[] = ['CHAISES', 'BACHES', 'SONO', 'AUTRE'];

export const RESERVATION_STATUTS: readonly ReservationStatut[] = [
  'EN_ATTENTE',
  'CONFIRMEE',
  'EN_COURS',
  'TERMINEE',
  'ANNULEE',
];

export function newId(prefix: string): string {
  const cryptoRef = globalThis.crypto as Crypto | undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return `${prefix}_${cryptoRef.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Number of days between two ISO (YYYY-MM-DD) dates, inclusive, minimum 1. */
export function daysInclusive(dateDebut: string, dateFin: string): number {
  if (!dateDebut || !dateFin) {
    return 0;
  }
  const debut = Date.parse(`${dateDebut}T00:00:00Z`);
  const fin = Date.parse(`${dateFin}T00:00:00Z`);
  if (Number.isNaN(debut) || Number.isNaN(fin) || fin < debut) {
    return 0;
  }
  return Math.round((fin - debut) / 86_400_000) + 1;
}

/** True when two inclusive ISO date ranges overlap. */
export function rangesOverlap(
  aDebut: string,
  aFin: string,
  bDebut: string,
  bFin: string,
): boolean {
  return aDebut <= bFin && bDebut <= aFin;
}

export const CATEGORIE_LABELS: Record<Categorie, string> = {
  CHAISES: 'Chaises',
  BACHES: 'Bâches',
  SONO: 'Sono',
  AUTRE: 'Autre',
};

export const RESERVATION_STATUT_LABELS: Record<ReservationStatut, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};
