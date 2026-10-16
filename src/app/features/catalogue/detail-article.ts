import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/catalogue/article.service';
import { AvailabilityService } from '../../core/availability/availability.service';
import { AuthService } from '../../core/auth/auth.service';
import { CATEGORIE_LABELS } from '../../core/models';

@Component({
  selector: 'app-detail-article',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    @if (article(); as item) {
      <a mat-button routerLink="/catalogue">&larr; Retour au catalogue</a>

      <mat-card class="detail">
        <img class="photo" [src]="item.photo" [alt]="item.nom" />
        <mat-card-content>
          <h1>{{ item.nom }}</h1>
          <p class="muted">{{ labels[item.categorie] }}</p>
          <p>{{ item.description }}</p>
          <p><strong>Prix / jour :</strong> {{ item.prixJour }} €</p>
          <p><strong>Caution :</strong> {{ item.caution }} €</p>
          <p><strong>Quantité totale :</strong> {{ item.quantiteTotale }}</p>

          <h2>Vérifier la disponibilité</h2>
          <div class="filters">
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
              <input matInput type="number" min="1" [ngModel]="quantite()" (ngModelChange)="quantite.set(+$event)" name="quantite" />
            </mat-form-field>
          </div>

          @if (datesChoisies()) {
            <p>
              Disponible sur la période :
              <strong>{{ availableQuantity() }}</strong> / {{ item.quantiteTotale }}
            </p>
          }

          @if (canBook()) {
            @if (datesChoisies() && availableQuantity() >= quantite()) {
              <a
                mat-flat-button
                color="primary"
                [routerLink]="['/reservations/nouvelle']"
                [queryParams]="{ articleId: item.id, dateDebut: dateDebut(), dateFin: dateFin(), quantite: quantite() }"
              >
                Réserver
              </a>
            } @else if (datesChoisies()) {
              <p class="error-text">Quantité indisponible pour cette période.</p>
            }
          } @else if (!auth.currentUser()) {
            <a mat-button routerLink="/login">Connectez-vous pour réserver</a>
          }
        </mat-card-content>
      </mat-card>
    } @else {
      <h1>Article introuvable</h1>
      <a mat-button routerLink="/catalogue">Retour au catalogue</a>
    }
  `,
  styles: [
    `
      .detail {
        max-width: 640px;
        padding: 1rem;
      }
      .photo {
        width: 100%;
        height: 260px;
        object-fit: cover;
        border-radius: 8px;
        background: #eef;
      }
      .muted {
        color: #5f6368;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
    `,
  ],
})
export class DetailArticle {
  private readonly articleService = inject(ArticleService);
  private readonly availability = inject(AvailabilityService);
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly labels = CATEGORIE_LABELS;

  private readonly articleId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly dateDebut = signal('');
  readonly dateFin = signal('');
  readonly quantite = signal(1);

  readonly article = computed(() =>
    this.articleService.articles().find((candidate) => candidate.id === this.articleId),
  );

  readonly datesChoisies = computed(() => !!this.dateDebut() && !!this.dateFin());

  readonly availableQuantity = computed(() =>
    this.availability.availableQuantity(this.articleId, this.dateDebut(), this.dateFin()),
  );

  protected canBook(): boolean {
    const role = this.auth.role();
    return role === 'CLIENT' || role === 'ADMIN';
  }
}
