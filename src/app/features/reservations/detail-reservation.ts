import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/catalogue/article.service';
import { AuthService } from '../../core/auth/auth.service';
import { ReservationService } from '../../core/reservations/reservation.service';
import { RESERVATION_STATUT_LABELS } from '../../core/models';

@Component({
  selector: 'app-detail-reservation',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    @if (reservation(); as item) {
      @if (accesRefuse()) {
        <h1>Accès refusé</h1>
        <p>Cette réservation ne vous concerne pas.</p>
        <a mat-button routerLink="/reservations">Retour</a>
      } @else {
        <a mat-button routerLink="/reservations">&larr; Retour</a>
        <mat-card class="detail">
          <mat-card-content>
            <h1>Réservation</h1>
            <p><strong>Article :</strong> {{ nomArticle() }}</p>
            <p><strong>Période :</strong> {{ item.dateDebut }} → {{ item.dateFin }}</p>
            <p><strong>Quantité :</strong> {{ item.quantite }}</p>
            <p><strong>Prix total :</strong> {{ item.prixTotal }} €</p>
            <p><strong>Caution (simulée) :</strong> {{ item.caution }} €</p>
            <p>
              <strong>Statut :</strong>
              <span class="statut">{{ labels[item.statut] }}</span>
            </p>

            <div class="actions">
              @if (peutConfirmer()) {
                <button mat-flat-button color="primary" type="button" (click)="confirmer()">
                  Confirmer
                </button>
              }
              @if (peutAnnuler()) {
                <button mat-flat-button color="warn" type="button" (click)="annuler()">Annuler</button>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    } @else {
      <h1>Réservation introuvable</h1>
      <a mat-button routerLink="/reservations">Retour</a>
    }
  `,
  styles: [
    `
      .detail {
        max-width: 560px;
        padding: 1rem;
      }
      .statut {
        font-weight: 600;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
    `,
  ],
})
export class DetailReservation {
  private readonly reservationService = inject(ReservationService);
  private readonly articleService = inject(ArticleService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly labels = RESERVATION_STATUT_LABELS;

  private readonly reservationId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly reservation = computed(() =>
    this.reservationService.reservations().find((candidate) => candidate.id === this.reservationId),
  );

  readonly nomArticle = computed(() => {
    const item = this.reservation();
    return item ? (this.articleService.getById(item.articleId)?.nom ?? 'Article supprimé') : '';
  });

  protected accesRefuse(): boolean {
    const user = this.auth.currentUser();
    const item = this.reservation();
    if (!user || !item) {
      return true;
    }
    return (
      user.role !== 'ADMIN' && user.id !== item.clientId && user.id !== item.loueurId
    );
  }

  protected peutConfirmer(): boolean {
    const user = this.auth.currentUser();
    const item = this.reservation();
    return !!user && !!item && item.statut === 'EN_ATTENTE' && user.id === item.loueurId;
  }

  protected peutAnnuler(): boolean {
    const user = this.auth.currentUser();
    const item = this.reservation();
    return (
      !!user &&
      !!item &&
      user.id === item.clientId &&
      item.statut !== 'TERMINEE' &&
      item.statut !== 'ANNULEE'
    );
  }

  protected confirmer(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.reservationService.confirm(this.reservationId, user.id);
    }
  }

  protected annuler(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.reservationService.cancel(this.reservationId, user.id);
    }
  }
}
