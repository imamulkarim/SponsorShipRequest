import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { CurrentUserResponse, LoginRequest, RegisterRequest, UsersClient } from '../app/web-api-client';

type CurrentUser = CurrentUserResponse & {
  role?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private usersClient: UsersClient) {}

  initialize(): Observable<boolean> {
    return this.loadCurrentUser().pipe(
      map(user => !!user),
      catchError(() => {
        this.clearAuthState();
        return of(false);
      }),
      tap(isAuth => this._isAuthenticated.next(isAuth))
    );
  }

  login(email: string, password: string): Observable<void> {
    return this.usersClient.login(true, undefined, new LoginRequest({ email, password })).pipe(
      tap(response => {
        if (response?.accessToken) {
          localStorage.setItem('access_token', response.accessToken);
        }
      }),
      switchMap(() => this.loadCurrentUser()),
      tap(() => this._isAuthenticated.next(true)),
      map(() => void 0)
    );
  }

  register(email: string, password: string): Observable<void> {
    return this.usersClient.register(new RegisterRequest({ email, password }));
  }

  logout(): Observable<void> {
    return this.usersClient.logout({}).pipe(
      tap(() => this.clearAuthState())
    );
  }

  public getUserRole(): string | null {
    return this.getUserRoles()[0] ?? null;
  }

  public getUserRoles(): string[] {
    const user = this.currentUserSubject.value;
    if (user?.roles?.length) {
      return user.roles;
    }

    if (user?.role) {
      return [user.role];
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      return this.getRolesFromClaims(decodedToken);
    }

    return [];
  }

  private loadCurrentUser(): Observable<CurrentUser> {
    return this.usersClient.getCurrentUser().pipe(
      map(user => this.withRole(user)),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  private withRole(user: CurrentUserResponse): CurrentUser {
    const token = localStorage.getItem('access_token');
    const roles = user.roles?.length ? user.roles : (token ? this.getRolesFromClaims(this.decodeToken(token)) : []);
    const role = roles[0] ?? null;
    user.roles = roles;
    return Object.assign(user, { role });
  }

  private clearAuthState(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this._isAuthenticated.next(false);
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  private getRoleFromClaims(claims: any): string | null {
    return this.getRolesFromClaims(claims)[0] ?? null;
  }

  private getRolesFromClaims(claims: any): string[] {
    if (!claims) {
      return [];
    }

    const role =
      claims.role ??
      claims.roles ??
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return Array.isArray(role) ? role : role ? [role] : [];
  }

  public hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  public hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

}
