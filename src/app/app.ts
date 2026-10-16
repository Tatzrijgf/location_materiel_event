import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import type { Role } from './core/models';

interface NavItem {
  label: string;
  link: string;
  roles?: Role[];
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
  ],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected searchTerm = '';

  private readonly navItems: readonly NavItem[] = [
    { label: 'Catalogue', link: '/catalogue' },
    { label: 'Mes réservations', link: '/reservations', roles: ['CLIENT'] },
    { label: 'Réservations reçues', link: '/reservations', roles: ['LOUEUR'] },
    { label: 'Toutes les réservations', link: '/reservations', roles: ['ADMIN'] },
    { label: 'Nouvel article', link: '/articles/nouveau', roles: ['LOUEUR', 'ADMIN'] },
    { label: 'Tableau de bord', link: '/dashboard', roles: ['CLIENT', 'LOUEUR', 'ADMIN'] },
    { label: 'Administration', link: '/admin', roles: ['ADMIN'] },
  ];

  protected visibleItems(): readonly NavItem[] {
    const role = this.auth.role();
    return this.navItems.filter((item) => !item.roles || (role !== null && item.roles.includes(role)));
  }

  protected onSearch(): void {
    const q = this.searchTerm.trim();
    void this.router.navigate(['/catalogue'], { queryParams: q ? { q } : {} });
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
