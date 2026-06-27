import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific role required
    }

    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // User doesn't have required role
    this.router.navigate(['/access-denied']);
    return false;
  }
}
