import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from '../storage.service';
import { newId, rangesOverlap, type Disponibilite } from '../models';
import { ArticleService } from '../catalogue/article.service';
import { ReservationService } from '../reservations/reservation.service';

const AVAILABILITIES_KEY = 'availabilities';

export interface PlageInput {
  dateDebut: string;
  dateFin: string;
  quantiteDisponible: number;
}

/**
 * Owns the availability ranges ("plages") of articles and evaluates how many
 * units of an article are bookable over a period.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly storage = inject(StorageService);
  private readonly articles = inject(ArticleService);
  private readonly reservations = inject(ReservationService);
  private readonly _plages = signal<Disponibilite[]>(
    this.storage.get<Disponibilite[]>(AVAILABILITIES_KEY, []),
  );

  readonly plages = this._plages.asReadonly();

  reload(): void {
    this._plages.set(this.storage.get<Disponibilite[]>(AVAILABILITIES_KEY, []));
  }

  forArticle(articleId: string): Disponibilite[] {
    return this._plages().filter((plage) => plage.articleId === articleId);
  }

  /** Replaces every availability range of an article with the given ranges. */
  setForArticle(articleId: string, inputs: PlageInput[]): void {
    const others = this._plages().filter((plage) => plage.articleId !== articleId);
    const created = inputs
      .filter((input) => rangeValid(input))
      .map<Disponibilite>((input) => ({
        id: newId('d'),
        articleId,
        dateDebut: input.dateDebut,
        dateFin: input.dateFin,
        quantiteDisponible: input.quantiteDisponible,
      }));
    this._plages.set([...others, ...created]);
    this.persist();
  }

  availableQuantity(articleId: string, dateDebut: string, dateFin: string): number {
    const article = this.articles.getById(articleId);
    if (!article || article.statut !== 'DISPONIBLE') {
      return 0;
    }
    if (!dateDebut || !dateFin || dateFin < dateDebut) {
      return 0;
    }

    const plages = this.forArticle(articleId);
    let base = article.quantiteDisponible;
    if (plages.length > 0) {
      const covering = plages.filter(
        (plage) => plage.dateDebut <= dateDebut && dateFin <= plage.dateFin,
      );
      if (covering.length === 0) {
        return 0;
      }
      base = Math.min(article.quantiteDisponible, ...covering.map((plage) => plage.quantiteDisponible));
    }

    const reserved = this.reservations.reservedQuantity(articleId, dateDebut, dateFin);
    return Math.max(0, base - reserved);
  }

  isAvailable(articleId: string, dateDebut: string, dateFin: string, quantite: number): boolean {
    return this.availableQuantity(articleId, dateDebut, dateFin) >= quantite;
  }

  private persist(): void {
    this.storage.set(AVAILABILITIES_KEY, this._plages());
  }
}

function rangeValid(input: PlageInput): boolean {
  return (
    !!input.dateDebut &&
    !!input.dateFin &&
    input.dateFin >= input.dateDebut &&
    input.quantiteDisponible >= 0 &&
    rangesOverlap(input.dateDebut, input.dateFin, input.dateDebut, input.dateFin)
  );
}
