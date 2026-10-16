import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { AuthService, homeUrlForRole } from '../../../core/auth/auth.service';
import { ROLES_INSCRIPTION, type Role } from '../../../core/models';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="page narrow">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Inscription</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="name" autocomplete="name" />
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <mat-error>Nom requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Mot de passe de 8 caractères minimum</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rôle</mat-label>
              <mat-select formControlName="role">
                @for (role of roles; track role) {
                  <mat-option [value]="role">{{ role }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (errorMessage(); as message) {
              <p class="error-text">{{ message }}</p>
            }

            <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
              Créer mon compte
            </button>
          </form>

          <p class="hint">Déjà inscrit ? <a routerLink="/login">Se connecter</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 420px;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .hint {
        color: #5f6368;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly roles = ROLES_INSCRIPTION;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['CLIENT' as Role, [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.auth.register(this.form.getRawValue());
      await this.router.navigateByUrl(homeUrlForRole(user.role));
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      this.submitting.set(false);
    }
  }
}
