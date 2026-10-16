import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/catalogue/article.service';
import { AvailabilityService } from '../../core/availability/availability.service';
import { AuthService } from '../../core/auth/auth.service';
import { CATEGORIES, CATEGORIE_LABELS, type Article, type Categorie } from '../../core/models';

@Component({
  selector: 'app-liste-articles',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <h1>Catalogue</h1>

    <mat-card class="filters-card">
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Recherche</mat-label>
          <input matInput [ngModel]="term()" (ngModelChange)="term.set($event)" name="terme" placeholder="Nom ou description" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Catégorie</mat-label>
          <mat-select [ngModel]="categorie()" (ngModelChange)="categorie.set($event)" name="categorie">
            <mat-option [value]="''">Toutes</mat-option>
            @for (cat of categories; track cat) {
              <mat-option [value]="cat">{{ labels[cat] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Prix min</mat-label>
          <input matInput type="number" min="0" [ngModel]="prixMin()" (ngModelChange)="prixMin.set($event)" name="prixMin" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Prix max</mat-label>
          <input matInput type="number" min="0" [ngModel]="prixMax()" (ngModelChange)="prixMax.set($event)" name="prixMax" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Disponible le</mat-label>
          <input matInput type="date" [ngModel]="dateDispo()" (ngModelChange)="dateDispo.set($event)" name="dateDispo" />
        </mat-form-field>
      </div>
    </mat-card>

    @if (filtered().length === 0) {
      <p>Aucun article ne correspond aux critères.</p>
    } @else {
      <table mat-table [dataSource]="filtered()" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="nom">
          <th mat-header-cell *matHeaderCellDef>Article</th>
          <td mat-cell *matCellDef="let article">{{ article.nom }}</td>
        </ng-container>

        <ng-container matColumnDef="categorie">
          <th mat-header-cell *matHeaderCellDef>Catégorie</th>
          <td mat-cell *matCellDef="let article">{{ catLabel(article) }}</td>
        </ng-container>

        <ng-container matColumnDef="prixJour">
          <th mat-header-cell *matHeaderCellDef>Prix / jour</th>
          <td mat-cell *matCellDef="let article">{{ article.prixJour }} €</td>
        </ng-container>

        <ng-container matColumnDef="caution">
          <th mat-header-cell *matHeaderCellDef>Caution</th>
          <td mat-cell *matCellDef="let article">{{ article.caution }} €</td>
        </ng-container>

        <ng-container matColumnDef="quantiteDisponible">
          <th mat-header-cell *matHeaderCellDef>Disponible</th>
          <td mat-cell *matCellDef="let article">{{ article.quantiteDisponible }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let article">
            <a mat-button [routerLink]="['/articles', article.id]">Détail</a>
            @if (canBook()) {
              <a mat-button [routerLink]="['/reservations/nouvelle']" [queryParams]="{ articleId: article.id }">
                Réserver
              </a>
            }
            @if (canEdit(article)) {
              <a mat-button [routerLink]="['/articles', article.id, 'modifier']">Modifier</a>
              <button mat-button color="warn" type="button" (click)="remove(article)">Supprimer</button>
            }
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
export class ListeArticles {
  private readonly articleService = inject(ArticleService);
  private readonly availability = inject(AvailabilityService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;
  readonly labels = CATEGORIE_LABELS;
  readonly columns = ['nom', 'categorie', 'prixJour', 'caution', 'quantiteDisponible', 'actions'];

  readonly term = signal('');
  readonly categorie = signal<Categorie | ''>('');
  readonly prixMin = signal<number | null>(null);
  readonly prixMax = signal<number | null>(null);
  readonly dateDispo = signal('');

  readonly filtered = computed(() => {
    const term = this.term().trim().toLowerCase();
    const categorie = this.categorie();
    const min = this.prixMin();
    const max = this.prixMax();
    const date = this.dateDispo();

    return this.articleService.articles().filter((article) => {
      if (
        term &&
        !article.nom.toLowerCase().includes(term) &&
        !article.description.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (categorie && article.categorie !== categorie) {
        return false;
      }
      if (min !== null && article.prixJour < min) {
        return false;
      }
      if (max !== null && article.prixJour > max) {
        return false;
      }
      if (date && !this.availability.isAvailable(article.id, date, date, 1)) {
        return false;
      }
      return true;
    });
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.term.set(params.get('q') ?? '');
    });
  }

  protected canBook(): boolean {
    const role = this.auth.role();
    return role === 'CLIENT' || role === 'ADMIN';
  }

  protected catLabel(article: Article): string {
    return CATEGORIE_LABELS[article.categorie];
  }

  protected canEdit(article: Article): boolean {
    const user = this.auth.currentUser();
    if (!user) {
      return false;
    }
    return user.role === 'ADMIN' || (user.role === 'LOUEUR' && article.loueurId === user.id);
  }

  protected remove(article: Article): void {
    if (confirm(`Supprimer « ${article.nom} » ?`)) {
      this.articleService.remove(article.id);
    }
  }
}
