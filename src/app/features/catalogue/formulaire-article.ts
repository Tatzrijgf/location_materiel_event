import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/catalogue/article.service';
import { AvailabilityService, type PlageInput } from '../../core/availability/availability.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  CATEGORIES,
  CATEGORIE_LABELS,
  type ArticleStatut,
  type Categorie,
} from '../../core/models';

@Component({
  selector: 'app-formulaire-article',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    @if (accesRefuse()) {
      <h1>Accès refusé</h1>
      <p>Vous ne pouvez modifier que vos propres articles.</p>
      <a mat-button routerLink="/catalogue">Retour au catalogue</a>
    } @else {
      <h1>{{ isEdit() ? 'Modifier un article' : 'Nouvel article' }}</h1>

      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" formControlName="description"></textarea>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Catégorie</mat-label>
              <mat-select formControlName="categorie">
                @for (cat of categories; track cat) {
                  <mat-option [value]="cat">{{ labels[cat] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut">
                <mat-option value="DISPONIBLE">Disponible</mat-option>
                <mat-option value="SUSPENDU">Suspendu</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Prix / jour (€)</mat-label>
              <input matInput type="number" min="0" formControlName="prixJour" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Caution (€)</mat-label>
              <input matInput type="number" min="0" formControlName="caution" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quantité totale</mat-label>
              <input matInput type="number" min="0" formControlName="quantiteTotale" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quantité disponible</mat-label>
              <input matInput type="number" min="0" formControlName="quantiteDisponible" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Photo (URL)</mat-label>
            <input matInput formControlName="photo" />
          </mat-form-field>

          <h2>Plages de disponibilité</h2>
          @for (plage of plages; track $index) {
            <div class="plage-row">
              <mat-form-field appearance="outline">
                <mat-label>Du</mat-label>
                <input matInput type="date" [(ngModel)]="plage.dateDebut" [ngModelOptions]="{ standalone: true }" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Au</mat-label>
                <input matInput type="date" [(ngModel)]="plage.dateFin" [ngModelOptions]="{ standalone: true }" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Quantité</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="plage.quantiteDisponible" [ngModelOptions]="{ standalone: true }" />
              </mat-form-field>
              <button mat-icon-button type="button" aria-label="Retirer" (click)="removePlage($index)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
          <button mat-stroked-button type="button" (click)="addPlage()">Ajouter une plage</button>

          @if (errorMessage(); as message) {
            <p class="error-text">{{ message }}</p>
          }

          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
              Enregistrer
            </button>
            <a mat-button routerLink="/catalogue">Annuler</a>
          </div>
        </form>
      </mat-card>
    }
  `,
  styles: [
    `
      .form-card {
        padding: 1rem;
        max-width: 760px;
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
      .plage-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
    `,
  ],
})
export class FormulaireArticle {
  private readonly articleService = inject(ArticleService);
  private readonly availability = inject(AvailabilityService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly categories = CATEGORIES;
  readonly labels = CATEGORIE_LABELS;

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly editId = this.route.snapshot.paramMap.get('id');

  readonly isEdit = signal(this.editId !== null);

  plages: PlageInput[] = [];

  readonly form = this.formBuilder.nonNullable.group({
    nom: ['', [Validators.required]],
    description: ['', [Validators.required]],
    categorie: ['CHAISES' as Categorie, [Validators.required]],
    statut: ['DISPONIBLE' as ArticleStatut, [Validators.required]],
    prixJour: [0, [Validators.required, Validators.min(0)]],
    caution: [0, [Validators.required, Validators.min(0)]],
    quantiteTotale: [1, [Validators.required, Validators.min(0)]],
    quantiteDisponible: [1, [Validators.required, Validators.min(0)]],
    photo: [''],
  });

  constructor() {
    if (this.editId) {
      const article = this.articleService.getById(this.editId);
      if (article) {
        this.form.setValue({
          nom: article.nom,
          description: article.description,
          categorie: article.categorie,
          statut: article.statut,
          prixJour: article.prixJour,
          caution: article.caution,
          quantiteTotale: article.quantiteTotale,
          quantiteDisponible: article.quantiteDisponible,
          photo: article.photo,
        });
      }
      this.plages = this.availability
        .forArticle(this.editId)
        .map((plage) => ({
          dateDebut: plage.dateDebut,
          dateFin: plage.dateFin,
          quantiteDisponible: plage.quantiteDisponible,
        }));
    }
  }

  protected accesRefuse(): boolean {
    if (!this.editId) {
      return false;
    }
    const article = this.articleService.getById(this.editId);
    const user = this.auth.currentUser();
    if (!article || !user) {
      return true;
    }
    return user.role !== 'ADMIN' && article.loueurId !== user.id;
  }

  protected addPlage(): void {
    this.plages = [...this.plages, { dateDebut: '', dateFin: '', quantiteDisponible: 1 }];
  }

  protected removePlage(index: number): void {
    this.plages = this.plages.filter((_, i) => i !== index);
  }

  protected submit(): void {
    const user = this.auth.currentUser();
    if (!user || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.plages.some((plage) => plage.dateDebut && plage.dateFin && plage.dateFin < plage.dateDebut)) {
      this.errorMessage.set('Une plage a une date de fin antérieure à sa date de début.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const input = this.form.getRawValue();
      const articleId = this.editId
        ? (this.articleService.update(this.editId, input), this.editId)
        : this.articleService.create(input, user.id).id;
      const plagesValides = this.plages.filter(
        (plage) => plage.dateDebut && plage.dateFin && plage.dateFin >= plage.dateDebut,
      );
      this.availability.setForArticle(articleId, plagesValides);
      void this.router.navigateByUrl('/catalogue');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      this.submitting.set(false);
    }
  }
}
