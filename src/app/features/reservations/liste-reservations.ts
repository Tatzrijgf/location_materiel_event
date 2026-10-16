import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/catalogue/article.service';
import { AuthService } from '../../core/auth/auth.service';
import { ReservationService } from '../../core/reservations/reservation.service';
import {
  RESERVATION_STATUTS,
  RESERVATION_STATUT_LABELS,
  type Reservation,
  type ReservationStatut,
} from '../../core/models';

@Component({
  selector: 'app-liste-reservations',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <h1>{{ titre() }}</h1>

    <mat-card class="filters-card">
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select [ngModel]="statutFiltre()" (ngModelChange)="statutFiltre.set($event)" name="statut">
            <mat-option value="">Tous</mat-option>
            @for (statut of statuts; track statut) {
              <mat-option [value]="statut">{{ labels[statut] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Date concernée</mat-label>
          <input matInput type="date" [ngModel]="dateFiltre()" (ngModelChange)="dateFiltre.set($event)" name="dateFiltre" />
        </mat-form-field>
      </div>
    </mat-card>

    @if (filtered().length === 0) {
      <p>Aucune réservation.</p>
    } @else {
      <table mat-table [dataSource]="filtered()" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="article">
          <th mat-header-cell *matHeaderCellDef>Article</th>
          <td mat-cell *matCellDef="let r">{{ nomArticle(r) }}</td>
        </ng-container>
        <ng-container matColumnDef="dates">
          <th mat-header-cell *matHeaderCellDef>Dates</th>
          <td mat-cell *matCellDef="let r">{{ r.dateDebut }} → {{ r.dateFin }}</td>
        </ng-container>
        <ng-container matColumnDef="quantite">
          <th mat-header-cell *matHeaderCellDef>Qté</th>
          <td mat-cell *matCellDef="let r">{{ r.quantite }}</td>
        </ng-container>
        <ng-container matColumnDef="prixTotal">
          <th mat-header-cell *matHeaderCellDef>Prix</th>
          <td mat-cell *matCellDef="let r">{{ r.prixTotal }} €</td>
        </ng-container>
        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef>Statut</th>
          <td mat-cell *matCellDef="let r">{{ statutLabel(r) }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let r">
            <a mat-button [routerLink]="['/reservations', r.id]">Détail</a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
    }
  `,
  styles: [
    `
      .filters-card {
        margin-bottom: 1rem;
        padding: 1rem;
      }
      table {
        width: 100%;
      }
    `,
  ],
})
export class ListeReservations {
  private readonly reservationService = inject(ReservationService);
  private readonly articleService = inject(ArticleService);
  private readonly auth = inject(AuthService);

  readonly statuts = RESERVATION_STATUTS;
  readonly labels = RESERVATION_STATUT_LABELS;
  readonly columns = ['article', 'dates', 'quantite', 'prixTotal', 'statut', 'actions'];

  statutFiltre = signal<ReservationStatut | ''>('');
  dateFiltre = signal('');

  private readonly base = computed<Reservation[]>(() => {
    const user = this.auth.currentUser();
    const all = this.reservationService.reservations();
    if (!user) {
      return [];
    }
    if (user.role === 'CLIENT') {
      return all.filter((reservation) => reservation.clientId === user.id);
    }
    if (user.role === 'LOUEUR') {
      return all.filter((reservation) => reservation.loueurId === user.id);
    }
    return all;
  });

  readonly filtered = computed<Reservation[]>(() => {
    const statut = this.statutFiltre();
    const date = this.dateFiltre();
    return this.base().filter((reservation) => {
      if (statut && reservation.statut !== statut) {
        return false;
      }
      if (date && !(reservation.dateDebut <= date && date <= reservation.dateFin)) {
        return false;
      }
      return true;
    });
  });

  readonly titre = computed(() => {
    const role = this.auth.role();
    if (role === 'LOUEUR') {
      return 'Réservations reçues';
    }
    if (role === 'ADMIN') {
      return 'Toutes les réservations';
    }
    return 'Mes réservations';
  });

  protected nomArticle(reservation: Reservation): string {
    return this.articleService.getById(reservation.articleId)?.nom ?? 'Article supprimé';
  }

  protected statutLabel(reservation: Reservation): string {
    return RESERVATION_STATUT_LABELS[reservation.statut];
  }
}
