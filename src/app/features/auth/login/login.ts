import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, homeUrlForRole } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="page narrow">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Connexion</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Mot de passe requis</mat-error>
              }
            </mat-form-field>

            @if (errorMessage(); as message) {
              <p class="error-text">{{ message }}</p>
            }

            <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
              Se connecter
            </button>
          </form>

          <p class="hint">Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
          <p class="hint">
            Comptes de démo : admin&#64;demo.com, client&#64;demo.com, loueur&#64;demo.com —
            mot de passe <strong>demo1234</strong>
          </p>
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
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.auth.login(this.form.getRawValue());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl ?? homeUrlForRole(user.role));
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      this.submitting.set(false);
    }
  }
}
