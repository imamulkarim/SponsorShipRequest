import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/api-authorization/auth.service';

@Component({
  standalone: false,
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  isAuthenticated = this.authService.isAuthenticated$;

  isExpanded = false;
  userName!: Observable<string>;
  userRole: string | null = null;
  private destroy$ = new Subject<void>();


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.userName = this.authService.currentUser$.pipe(
      map(user => user?.email ?? '')
    );

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userRole = user?.role ?? this.authService.getUserRole();
      });

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.userRole = isAuthenticated ? this.authService.getUserRole() : null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  collapse(): void {
    this.isExpanded = false;
  }

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  isManager(): boolean {
    return this.authService.hasRole('Manager');
  }

  isFinance(): boolean {
    return this.authService.hasRole('FinanceAdmin');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('SystemAdmin');
  }

  isRequestor(): boolean {
    return this.authService.hasRole('Requestor');
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    });
  }
}
