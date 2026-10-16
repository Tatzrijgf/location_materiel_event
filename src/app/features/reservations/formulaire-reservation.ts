import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../core/catalogue/article.service';
import { AvailabilityService } from '../../core/availability/availability.service';
import { AuthService } from '../../core/auth/auth.service';
import { ReservationService } from '../../core/reservations/reservation.service';
import { daysInclusive } from '../../core/models';

@Component({
  selector: 'app-formulaire-reservation',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    @if (article(); as item) {
      <h1>Réserver : {{ item.nom }}</h1>

      <mat-card class="form-card">
        <form (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Article</mat-label>
            <mat-select [ngModel]="articleId()" (ngModelChange)="articleId.set($event)" name="article">
              @for (a of articles(); track a.id) {
                <mat-option [value]="a.id">{{ a.nom }} ({{ a.prixJour }} €/j)</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Du</mat-label>
              <input matInput type="date" [ngModel]="dateDebut()" (ngModelChange)="dateDebut.set($event)" name="dateDebut" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Au</mat-label>
              <input matInput type="date" [ngModel]="dateFin()" (ngModelChange)="dateFin.set($event)" name="dateFin" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Quantité</mat-label>
              <input
                matInput
                type="number"
                min="1"
                [ngModel]="quantite()"
                (ngModelChange)="quantite.set(+$event)"
                name="quantite"
              />
            </mat-form-field>
          </div>

          <div class="recap">
            <p><strong>Durée :</strong> {{ jours() }} jour(s)</p>
            <p><strong>Prix total :</strong> {{ prixTotal() }} €</p>
            <p><strong>Caution (simulée) :</strong> {{ caution() }} €</p>
            @if (datesChoisies()) {
              <p><strong>Disponible sur la période :</strong> {{ disponible() }}</p>
            }
          </div>

          @if (datesChoisies() && !assezDisponible()) {
            <p class="error-text">Quantité indisponible pour cette période.</p>
          }
          @if (errorMessage(); as message) {
            <p class="error-text">{{ message }}</p>
          }

          <button mat-flat-button color="primary" type="submit" [disabled]="!peutValider()">
            Confirmer la réservation
          </button>
        </form>
      </mat-card>
    } @else {
      <h1>Article introuvable</h1>
    }
  `,
  styles: [
    `
      .form-card {
        padding: 1rem;
        max-width: 640px;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .recap {
        background: #f1f3f4;
        border-radius: 8px;
        padding: 0.5rem 1rem;
      }
    `,
  ],
})
export class FormulaireReservation {
  private readonly reservationService = inject(ReservationService);
  private readonly availability = inject(AvailabilityService);
  private readonly articleService = inject(ArticleService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly articles = this.articleService.articles;

  readonly articleId = signal(this.route.snapshot.queryParamMap.get('articleId') ?? '');
  readonly dateDebut = signal(this.route.snapshot.queryParamMap.get('dateDebut') ?? '');
  readonly dateFin = signal(this.route.snapshot.queryParamMap.get('dateFin') ?? '');
  readonly quantite = signal(Number(this.route.snapshot.queryParamMap.get('quantite') ?? 1));

  readonly errorMessage = signal<string | null>(null);

  readonly article = computed(() =>
    this.articleService.articles().find((candidate) => candidate.id === this.articleId()),
  );

  readonly datesChoisies = computed(() => !!this.dateDebut() && !!this.dateFin());

  readonly jours = computed(() => daysInclusive(this.dateDebut(), this.dateFin()));

  readonly prixTotal = computed(() => {
    const item = this.article();
    return item ? item.prixJour * this.jours() * this.quantite() : 0;
  });

  readonly caution = computed(() => {
    const item = this.article();
    return item ? item.caution * this.quantite() : 0;
  });

  readonly disponible = computed(() =>
    this.availability.availableQuantity(this.articleId(), this.dateDebut(), this.dateFin()),
  );

  readonly assezDisponible = computed(() => this.disponible() >= this.quantite());

  readonly peutValider = computed(
    () =>
      !!this.article() &&
      this.datesChoisies() &&
      this.jours() > 0 &&
      this.quantite() >= 1 &&
      this.assezDisponible(),
  );

  protected submit(): void {
    const user = this.auth.currentUser();
    if (!user || !this.peutValider()) {
      return;
    }
    this.errorMessage.set(null);
    try {
      const reservation = this.reservationService.create({
        articleId: this.articleId(),
        clientId: user.id,
        dateDebut: this.dateDebut(),
        dateFin: this.dateFin(),
        quantite: this.quantite(),
      });
      void this.router.navigate(['/reservations', reservation.id]);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Réservation impossible.');
    }
  }
}
