import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ArticleService } from '../../core/catalogue/article.service';
import { AvailabilityService } from '../../core/availability/availability.service';
import { AuthService } from '../../core/auth/auth.service';
import { MockDataService } from '../../core/demo/mock-data.service';
import { ReservationService } from '../../core/reservations/reservation.service';
import { CATEGORIE_LABELS, type Article, type User } from '../../core/models';

@Component({
  selector: 'app-admin',
  imports: [MatButtonModule, MatCardModule, MatTableModule],
  template: `
    <h1>Administration</h1>

    @if (message(); as text) {
      <p class="info">{{ text }}</p>
    }

    <h2>Utilisateurs</h2>
    <table mat-table [dataSource]="users()" class="mat-elevation-z2 full-width">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nom</th>
        <td mat-cell *matCellDef="let user">{{ user.name }}</td>
      </ng-container>
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let user">{{ user.email }}</td>
      </ng-container>
      <ng-container matColumnDef="role">
        <th mat-header-cell *matHeaderCellDef>Rôle</th>
        <td mat-cell *matCellDef="let user">{{ user.role }}</td>
      </ng-container>
      <ng-container matColumnDef="actif">
        <th mat-header-cell *matHeaderCellDef>Actif</th>
        <td mat-cell *matCellDef="let user">{{ user.actif ? 'Oui' : 'Non' }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let user">
          <button mat-button type="button" (click)="basculerActif(user)">
            {{ user.actif ? 'Désactiver' : 'Activer' }}
          </button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: userColumns"></tr>
    </table>

    <h2>Modération des articles</h2>
    <table mat-table [dataSource]="articles()" class="mat-elevation-z2 full-width">
      <ng-container matColumnDef="nom">
        <th mat-header-cell *matHeaderCellDef>Article</th>
        <td mat-cell *matCellDef="let article">{{ article.nom }}</td>
      </ng-container>
      <ng-container matColumnDef="categorie">
        <th mat-header-cell *matHeaderCellDef>Catégorie</th>
        <td mat-cell *matCellDef="let article">{{ catLabel(article) }}</td>
      </ng-container>
      <ng-container matColumnDef="statut">
        <th mat-header-cell *matHeaderCellDef>Statut</th>
        <td mat-cell *matCellDef="let article">{{ article.statut }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let article">
          <button mat-button type="button" (click)="basculerArticle(article)">
            {{ article.statut === 'DISPONIBLE' ? 'Suspendre' : 'Réactiver' }}
          </button>
          <button mat-button color="warn" type="button" (click)="supprimer(article)">Supprimer</button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="articleColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: articleColumns"></tr>
    </table>

    <h2>Données de démonstration</h2>
    <mat-card class="demo-card">
      <mat-card-content>
        <p>Rétablit les utilisateurs, articles et réservations de démonstration.</p>
        <button mat-flat-button color="primary" type="button" (click)="resetDemo()">
          Réinitialiser les données
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      table {
        width: 100%;
        margin-bottom: 1.5rem;
      }
      .demo-card {
        max-width: 520px;
        padding: 0.5rem;
      }
      .info {
        color: #1b5e20;
      }
    `,
  ],
})
export class Admin {
  private readonly auth = inject(AuthService);
  private readonly articleService = inject(ArticleService);
  private readonly reservationService = inject(ReservationService);
  private readonly availability = inject(AvailabilityService);
  private readonly mockData = inject(MockDataService);

  readonly labels = CATEGORIE_LABELS;
  readonly userColumns = ['name', 'email', 'role', 'actif', 'actions'];
  readonly articleColumns = ['nom', 'categorie', 'statut', 'actions'];

  readonly message = signal<string | null>(null);
  readonly users = signal<User[]>(this.auth.users());
  readonly articles = this.articleService.articles;

  protected basculerActif(user: User): void {
    const updated = this.auth
      .users()
      .map((candidate) => (candidate.id === user.id ? { ...candidate, actif: !candidate.actif } : candidate));
    this.auth.saveUsers(updated);
    this.users.set(updated);
  }

  protected catLabel(article: Article): string {
    return CATEGORIE_LABELS[article.categorie];
  }

  protected basculerArticle(article: Article): void {
    this.articleService.setStatut(article.id, article.statut === 'DISPONIBLE' ? 'SUSPENDU' : 'DISPONIBLE');
  }

  protected supprimer(article: Article): void {
    if (confirm(`Supprimer « ${article.nom} » ?`)) {
      this.articleService.remove(article.id);
    }
  }

  protected resetDemo(): void {
    this.mockData.reset();
    this.articleService.reload();
    this.reservationService.reload();
    this.availability.reload();
    this.users.set(this.auth.users());
    this.auth.loadSession();
    this.message.set('Données de démonstration réinitialisées.');
  }
}
