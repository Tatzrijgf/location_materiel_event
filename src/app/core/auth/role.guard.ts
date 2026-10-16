import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import type { Role } from '../models';

/**
 * Restricts a route to the given roles. Anonymous users are sent to the login
 * page; authenticated users with a different role are sent to the catalogue.
 */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }
    if (roles.length === 0 || roles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/catalogue']);
  };
}
