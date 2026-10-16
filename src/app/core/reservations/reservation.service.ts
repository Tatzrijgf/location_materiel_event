import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from '../storage.service';
import {
  daysInclusive,
  newId,
  rangesOverlap,
  type Reservation,
  type ReservationStatut,
} from '../models';
import { ArticleService } from '../catalogue/article.service';

const RESERVATIONS_KEY = 'reservations';

const ACTIVE_STATUTS: readonly ReservationStatut[] = ['EN_ATTENTE', 'CONFIRMEE', 'EN_COURS'];

export interface ReservationInput {
  articleId: string;
  clientId: string;
  dateDebut: string;
  dateFin: string;
  quantite: number;
}

export class AvailabilityError extends Error {
  constructor(message = "L'article n'est pas disponible pour cette période.") {
    super(message);
    this.name = 'AvailabilityError';
  }
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly storage = inject(StorageService);
  private readonly articles = inject(ArticleService);
  private readonly _reservations = signal<Reservation[]>(
    this.storage.get<Reservation[]>(RESERVATIONS_KEY, []),
  );

  readonly reservations = this._reservations.asReadonly();

  reload(): void {
    this._reservations.set(this.storage.get<Reservation[]>(RESERVATIONS_KEY, []));
  }

  getById(id: string): Reservation | undefined {
    return this._reservations().find((reservation) => reservation.id === id);
  }

  forClient(clientId: string): Reservation[] {
    return this._reservations().filter((reservation) => reservation.clientId === clientId);
  }

  forLoueur(loueurId: string): Reservation[] {
    return this._reservations().filter((reservation) => reservation.loueurId === loueurId);
  }

  /** Quantity already committed by active reservations overlapping a period. */
  reservedQuantity(articleId: string, dateDebut: string, dateFin: string, excludeId?: string): number {
    return this._reservations()
      .filter(
        (reservation) =>
          reservation.id !== excludeId &&
          reservation.articleId === articleId &&
          ACTIVE_STATUTS.includes(reservation.statut) &&
          rangesOverlap(dateDebut, dateFin, reservation.dateDebut, reservation.dateFin),
      )
      .reduce((total, reservation) => total + reservation.quantite, 0);
  }

  create(input: ReservationInput): Reservation {
    const article = this.articles.getById(input.articleId);
    if (!article) {
      throw new Error('Article introuvable.');
    }
    const days = daysInclusive(input.dateDebut, input.dateFin);
    if (days <= 0) {
      throw new Error('La période sélectionnée est invalide.');
    }
    if (input.quantite < 1 || input.quantite > article.quantiteDisponible) {
      throw new AvailabilityError();
    }
    const reserved = this.reservedQuantity(input.articleId, input.dateDebut, input.dateFin);
    if (reserved + input.quantite > article.quantiteDisponible) {
      throw new AvailabilityError();
    }

    const reservation: Reservation = {
      id: newId('r'),
      articleId: input.articleId,
      clientId: input.clientId,
      loueurId: article.loueurId,
      dateDebut: input.dateDebut,
      dateFin: input.dateFin,
      quantite: input.quantite,
      prixTotal: article.prixJour * days * input.quantite,
      caution: article.caution * input.quantite,
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
    };
    this._reservations.update((list) => [...list, reservation]);
    this.persist();
    return reservation;
  }

  setStatut(id: string, statut: ReservationStatut): void {
    this._reservations.update((list) =>
      list.map((reservation) => (reservation.id === id ? { ...reservation, statut } : reservation)),
    );
    this.persist();
  }

  confirm(id: string, loueurId: string): boolean {
    const reservation = this.getById(id);
    if (!reservation || reservation.loueurId !== loueurId || reservation.statut !== 'EN_ATTENTE') {
      return false;
    }
    this.setStatut(id, 'CONFIRMEE');
    return true;
  }

  cancel(id: string, clientId: string): boolean {
    const reservation = this.getById(id);
    if (!reservation || reservation.clientId !== clientId || reservation.statut === 'TERMINEE') {
      return false;
    }
    this.setStatut(id, 'ANNULEE');
    return true;
  }

  private persist(): void {
    this.storage.set(RESERVATIONS_KEY, this._reservations());
  }
}
