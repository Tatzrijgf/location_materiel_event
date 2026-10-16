import { Injectable, inject } from '@angular/core';
import { RESERVATION_STATUT_LABELS, type ReservationStatut, type Role } from '../models';
import { AuthService } from '../auth/auth.service';
import { ArticleService } from '../catalogue/article.service';
import { ReservationService } from '../reservations/reservation.service';

export interface DashboardIndicator {
  label: string;
  value: string;
}

export interface DashboardChartSlice {
  label: string;
  value: number;
}

export interface DashboardData {
  role: Role;
  indicators: DashboardIndicator[];
  chartTitle: string;
  chart: DashboardChartSlice[];
}

const ACTIVE_STATUTS: readonly ReservationStatut[] = ['EN_ATTENTE', 'CONFIRMEE', 'EN_COURS'];

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly auth = inject(AuthService);
  private readonly articles = inject(ArticleService);
  private readonly reservations = inject(ReservationService);

  build(): DashboardData {
    const user = this.auth.currentUser();
    const role: Role = user?.role ?? 'CLIENT';
    const indicators = this.indicators(role, user?.id ?? '');
    return {
      role,
      indicators,
      chartTitle: 'Réservations par statut',
      chart: this.chartByStatut(),
    };
  }

  private indicators(role: Role, userId: string): DashboardIndicator[] {
    const reservations = this.reservations.reservations();

    if (role === 'CLIENT') {
      const mine = reservations.filter((reservation) => reservation.clientId === userId);
      const spent = mine
        .filter((reservation) => reservation.statut !== 'ANNULEE')
        .reduce((total, reservation) => total + reservation.prixTotal, 0);
      const enCours = mine.filter((reservation) => reservation.statut === 'EN_COURS').length;
      return [
        { label: 'Mes réservations', value: String(mine.length) },
        { label: 'Montant dépensé', value: euros.format(spent) },
        { label: 'Réservations en cours', value: String(enCours) },
      ];
    }

    if (role === 'LOUEUR') {
      const myArticles = this.articles.byLoueur(userId);
      const received = reservations.filter((reservation) => reservation.loueurId === userId);
      const revenus = received
        .filter((reservation) => reservation.statut !== 'ANNULEE')
        .reduce((total, reservation) => total + reservation.prixTotal, 0);
      const totalQty = myArticles.reduce((total, article) => total + article.quantiteTotale, 0);
      const reservedQty = received
        .filter((reservation) => ACTIVE_STATUTS.includes(reservation.statut))
        .reduce((total, reservation) => total + reservation.quantite, 0);
      const taux = totalQty === 0 ? 0 : Math.min(100, Math.round((reservedQty / totalQty) * 100));
      return [
        { label: 'Mes articles', value: String(myArticles.length) },
        { label: 'Réservations reçues', value: String(received.length) },
        { label: 'Revenus estimés', value: euros.format(revenus) },
        { label: "Taux d'occupation", value: `${taux} %` },
      ];
    }

    const utilisateurs = this.auth.users().length;
    const chiffreAffaires = reservations
      .filter((reservation) => reservation.statut !== 'ANNULEE')
      .reduce((total, reservation) => total + reservation.prixTotal, 0);
    return [
      { label: 'Utilisateurs', value: String(utilisateurs) },
      { label: 'Articles', value: String(this.articles.articles().length) },
      { label: 'Réservations', value: String(reservations.length) },
      { label: "Chiffre d'affaires", value: euros.format(chiffreAffaires) },
    ];
  }

  private chartByStatut(): DashboardChartSlice[] {
    const reservations = this.reservations.reservations();
    return (Object.keys(RESERVATION_STATUT_LABELS) as ReservationStatut[])
      .map((statut) => ({
        label: RESERVATION_STATUT_LABELS[statut],
        value: reservations.filter((reservation) => reservation.statut === statut).length,
      }))
      .filter((slice) => slice.value > 0);
  }
}
