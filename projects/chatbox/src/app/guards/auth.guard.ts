import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login']);
  return false;
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!authService.isLoggedIn) {
    return router.parseUrl('/login');
  }

  const userRole = (authService.userRole || '').toLowerCase();
  const roles = (allowedRoles || []).map(role => role.toLowerCase());

  if (!allowedRoles || roles.includes(userRole)) {
    return true;
  }

  return router.parseUrl(authService.getDashboardRoute());
};

export const dashboardRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return router.parseUrl(authService.getDashboardRoute());
};
