# Frontend Module & Routing - Final Implementation

## Angular Module & Routing Configuration

### 1. Create Sponsorship Module

`src/app/sponsorship/sponsorship.module.ts`
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SponsorshipRoutingModule } from './sponsorship-routing.module';

// Components
import { SponsorshipDashboardComponent } from './sponsorship-dashboard/sponsorship-dashboard.component';
import { SponsorshipFormComponent } from './sponsorship-form/sponsorship-form.component';
import { SponsorshipDetailComponent } from './sponsorship-detail/sponsorship-detail.component';
import { ApprovalListComponent } from './approval-list/approval-list.component';
import { ApprovalReviewComponent } from './approval-review/approval-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { WorkflowHistoryComponent } from './workflow-history/workflow-history.component';

// Services
import { SponsorshipService } from '../services/sponsorship.service';
import { ApprovalService } from '../services/approval.service';
import { SponsorshipTypeService } from '../services/sponsorship-type.service';
import { WorkflowService } from '../services/workflow.service';

@NgModule({
  declarations: [
    SponsorshipDashboardComponent,
    SponsorshipFormComponent,
    SponsorshipDetailComponent,
    ApprovalListComponent,
    ApprovalReviewComponent,
    AdminDashboardComponent,
    WorkflowHistoryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SponsorshipRoutingModule
  ],
  providers: [
    SponsorshipService,
    ApprovalService,
    SponsorshipTypeService,
    WorkflowService
  ]
})
export class SponsorshipModule { }
```

### 2. Create Sponsorship Routing Module

`src/app/sponsorship/sponsorship-routing.module.ts`
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../api-authorization/auth.guard';

// Components
import { SponsorshipDashboardComponent } from './sponsorship-dashboard/sponsorship-dashboard.component';
import { SponsorshipFormComponent } from './sponsorship-form/sponsorship-form.component';
import { SponsorshipDetailComponent } from './sponsorship-detail/sponsorship-detail.component';
import { ApprovalListComponent } from './approval-list/approval-list.component';
import { ApprovalReviewComponent } from './approval-review/approval-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { WorkflowHistoryComponent } from './workflow-history/workflow-history.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SponsorshipDashboardComponent
  },
  {
    path: 'list',
    canActivate: [AuthGuard],
    component: SponsorshipDashboardComponent
  },
  {
    path: 'create',
    canActivate: [AuthGuard],
    component: SponsorshipFormComponent
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard],
    component: SponsorshipFormComponent
  },
  {
    path: ':id',
    canActivate: [AuthGuard],
    component: SponsorshipDetailComponent
  },
  {
    path: 'approvals/manager',
    canActivate: [AuthGuard],
    component: ApprovalListComponent,
    data: { roles: ['Manager'] }
  },
  {
    path: 'approvals/manager/:id',
    canActivate: [AuthGuard],
    component: ApprovalReviewComponent,
    data: { roles: ['Manager'] }
  },
  {
    path: 'approvals/finance',
    canActivate: [AuthGuard],
    component: ApprovalListComponent,
    data: { roles: ['FinanceAdmin'] }
  },
  {
    path: 'approvals/finance/:id',
    canActivate: [AuthGuard],
    component: ApprovalReviewComponent,
    data: { roles: ['FinanceAdmin'] }
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminDashboardComponent,
    data: { roles: ['SystemAdmin'] }
  },
  {
    path: 'admin/history/:id',
    canActivate: [AuthGuard],
    component: WorkflowHistoryComponent,
    data: { roles: ['SystemAdmin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SponsorshipRoutingModule { }
```

### 3. Create Role-Based Auth Guard (Enhanced)

`src/app/api-authorization/role.guard.ts`
```typescript
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
  ) {}

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
```

### 4. Update AuthService to Get User Role

Update `src/app/api-authorization/auth.service.ts`:
```typescript
// Add these methods to existing AuthService

public getUserRole(): string | null {
  // Extract role from JWT claims or stored in localStorage
  const user = this.currentUserSubject.value;
  if (user && user.role) {
    return user.role;
  }

  // Alternative: Extract from token
  const token = localStorage.getItem('access_token');
  if (token) {
    const decodedToken = this.decodeToken(token);
    return decodedToken?.role || null;
  }

  return null;
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

public hasRole(role: string): boolean {
  const userRole = this.getUserRole();
  return userRole === role;
}

public hasAnyRole(roles: string[]): boolean {
  const userRole = this.getUserRole();
  return roles.includes(userRole || '');
}
```

### 5. Update App Routing Module

Update `src/app/app-routing.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './api-authorization/auth.guard';
import { RoleGuard } from './api-authorization/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { 
    path: 'api-authorization',
    loadChildren: () => import('./api-authorization/api-authorization.module').then(m => m.ApiAuthorizationModule)
  },
  {
    path: 'sponsorship',
    loadChildren: () => import('./sponsorship/sponsorship.module').then(m => m.SponsorshipModule),
    canActivate: [AuthGuard]
  },
  // Keep existing routes
  { path: 'counter', component: CounterComponent },
  { path: 'fetch-data', component: FetchDataComponent },
  // Add 404
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 6. Update Navigation Menu

Update `src/app/nav-menu/nav-menu.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../api-authorization/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  isExpanded = false;
  isAuthenticated!: Observable<boolean>;
  userName!: Observable<string>;
  userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.userName = this.authService.userName;
    this.updateUserRole();

    // Update role when authentication changes
    this.isAuthenticated.subscribe(() => {
      this.updateUserRole();
    });
  }

  private updateUserRole(): void {
    this.userRole = this.authService.getUserRole();
  }

  collapse(): void {
    this.isExpanded = false;
  }

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  logout(): void {
    this.authService.logout();
  }

  isManager(): boolean {
    return this.userRole === 'Manager';
  }

  isFinance(): boolean {
    return this.userRole === 'FinanceAdmin';
  }

  isAdmin(): boolean {
    return this.userRole === 'SystemAdmin';
  }

  isRequestor(): boolean {
    return this.userRole === 'Requestor';
  }
}
```

Update `src/app/nav-menu/nav-menu.component.html`:
```html
<header>
  <nav class="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
    <div class="container">
      <a class="navbar-brand" [routerLink]="['/']">TechAssessment</a>
      <button class="navbar-toggler" type="button" (click)="toggle()">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="navbar-collapse d-sm-inline-flex flex-sm-row-reverse" [ngClass]="{ show: isExpanded }">
        <ul class="navbar-nav flex-grow">
          <li class="nav-item" [routerLinkActive]="['link-active']" [routerLinkActiveOptions]="{ exact: true }">
            <a class="nav-link text-dark" [routerLink]="['/']" (click)="collapse()">Home</a>
          </li>

          <!-- Sponsorship Menu - Visible to Authenticated Users -->
          <li class="nav-item" *ngIf="(isAuthenticated | async)" 
              [routerLinkActive]="['link-active']">
            <a class="nav-link text-dark" [routerLink]="['/sponsorship']" (click)="collapse()">Sponsorship</a>
          </li>

          <!-- Manager Approvals -->
          <li class="nav-item" *ngIf="isManager()" 
              [routerLinkActive]="['link-active']">
            <a class="nav-link text-dark" [routerLink]="['/sponsorship/approvals/manager']" (click)="collapse()">
              Manager Approvals
            </a>
          </li>

          <!-- Finance Approvals -->
          <li class="nav-item" *ngIf="isFinance()" 
              [routerLinkActive]="['link-active']">
            <a class="nav-link text-dark" [routerLink]="['/sponsorship/approvals/finance']" (click)="collapse()">
              Finance Approvals
            </a>
          </li>

          <!-- Admin Dashboard -->
          <li class="nav-item" *ngIf="isAdmin()" 
              [routerLinkActive]="['link-active']">
            <a class="nav-link text-dark" [routerLink]="['/sponsorship/admin']" (click)="collapse()">
              Admin Dashboard
            </a>
          </li>

          <li class="nav-item" [routerLinkActive]="['link-active']" [routerLinkActiveOptions]="{ exact: true }">
            <a class="nav-link text-dark" [routerLink]="['/counter']" (click)="collapse()">Counter</a>
          </li>
          <li class="nav-item" [routerLinkActive]="['link-active']" [routerLinkActiveOptions]="{ exact: true }">
            <a class="nav-link text-dark" [routerLink]="['/fetch-data']" (click)="collapse()">Fetch data</a>
          </li>
        </ul>

        <!-- User Authentication Section -->
        <div class="ms-auto" *ngIf="(isAuthenticated | async); else anonymousUser">
          <div class="d-flex align-items-center gap-2">
            <span class="text-muted">{{ userName | async }}</span>
            <span class="badge bg-info">{{ userRole }}</span>
            <a class="btn btn-link text-dark text-decoration-none" (click)="logout()">Logout</a>
          </div>
        </div>

        <ng-template #anonymousUser>
          <a class="nav-link text-dark" [routerLink]="['/login']" (click)="collapse()">Login</a>
        </ng-template>
      </div>
    </div>
  </nav>
</header>
```

### 7. Create Sponsorship Detail Component (Missing)

`src/app/sponsorship/sponsorship-detail/sponsorship-detail.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SponsorshipService } from '../../services/sponsorship.service';
import { SponsorshipRequestDetail } from '../../models/sponsorship-request.model';
import { AuthService } from '../../api-authorization/auth.service';

@Component({
  selector: 'app-sponsorship-detail',
  templateUrl: './sponsorship-detail.component.html',
  styleUrls: ['./sponsorship-detail.component.scss']
})
export class SponsorshipDetailComponent implements OnInit {
  request?: SponsorshipRequestDetail;
  isLoading = true;
  errorMessage = '';
  userRole: string | null = null;
  isRequestor = false;

  constructor(
    private sponsorshipService: SponsorshipService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.route.params.subscribe(params => {
      this.loadRequestDetail(params['id']);
    });
  }

  private loadRequestDetail(id: number): void {
    this.sponsorshipService.getRequestDetail(id).subscribe({
      next: (request) => {
        this.request = request;
        this.isRequestor = request.requestorId === this.authService.getCurrentUserId();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load request details';
        this.isLoading = false;
      }
    });
  }

  canEdit(): boolean {
    return this.isRequestor && this.request?.status === 'Draft';
  }

  canSubmit(): boolean {
    return this.isRequestor && this.request?.status === 'Draft';
  }

  canCancel(): boolean {
    return this.isRequestor && 
           this.request?.status !== 'Approved' && 
           this.request?.status !== 'Rejected' &&
           this.request?.status !== 'Cancelled';
  }

  editRequest(): void {
    if (this.request) {
      this.router.navigate(['/sponsorship/edit', this.request.id]);
    }
  }

  submitRequest(): void {
    if (!this.request) return;

    this.sponsorshipService.submitRequest(this.request.id).subscribe({
      next: () => {
        this.router.navigate(['/sponsorship']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit request';
      }
    });
  }

  cancelRequest(): void {
    if (!this.request) return;

    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;

    this.sponsorshipService.cancelRequest(this.request.id, reason).subscribe({
      next: () => {
        this.router.navigate(['/sponsorship']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to cancel request';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sponsorship']);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Draft': 'badge-secondary',
      'PendingManagerApproval': 'badge-warning',
      'PendingFinanceReview': 'badge-info',
      'Approved': 'badge-success',
      'Rejected': 'badge-danger',
      'Cancelled': 'badge-dark'
    };
    return statusMap[status] || 'badge-secondary';
  }
}
```

`src/app/sponsorship/sponsorship-detail/sponsorship-detail.component.html`
```html
<div class="container mt-4" *ngIf="!isLoading && request">
  <div class="row">
    <div class="col-md-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ request.title }}</h2>
        <button class="btn btn-outline-secondary" (click)="goBack()">Back</button>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-content-between">
            <h5 class="mb-0">Request Details</h5>
            <span class="badge" [ngClass]="getStatusBadgeClass(request.status)">{{ request.status }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <p><strong>Requestor:</strong> {{ request.requestorName }}</p>
              <p><strong>Department:</strong> {{ request.department }}</p>
              <p><strong>Type:</strong> {{ request.sponsorshipType }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Event Name:</strong> {{ request.eventName }}</p>
              <p><strong>Event Date:</strong> {{ request.eventDate | date:'medium' }}</p>
              <p><strong>Requested Amount:</strong> {{ request.requestedAmount | currency }}</p>
            </div>
          </div>

          <hr>

          <div class="mb-3">
            <h6>Purpose</h6>
            <p>{{ request.purpose }}</p>
          </div>

          <div *ngIf="request.businessBenefit" class="mb-3">
            <h6>Expected Business Benefit</h6>
            <p>{{ request.businessBenefit }}</p>
          </div>

          <div *ngIf="request.managerApprovalRemarks" class="alert alert-info">
            <strong>Manager Remarks:</strong> {{ request.managerApprovalRemarks }}
          </div>

          <div *ngIf="request.financeApprovalRemarks" class="alert alert-info">
            <strong>Finance Remarks:</strong> {{ request.financeApprovalRemarks }}
          </div>
        </div>
      </div>

      <!-- Approval History -->
      <div class="card mb-4" *ngIf="request.approvalHistory && request.approvalHistory.length > 0">
        <div class="card-header">
          <h5 class="mb-0">Approval History</h5>
        </div>
        <div class="card-body">
          <ul class="list-group">
            <li class="list-group-item" *ngFor="let history of request.approvalHistory">
              <div class="d-flex justify-content-between">
                <strong>{{ history.approverRole }}: {{ history.action }}</strong>
                <small class="text-muted">{{ history.approvedAt | date:'medium' }}</small>
              </div>
              <p class="mb-0">{{ history.comments }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card">
        <div class="card-body">
          <button *ngIf="canEdit()" class="btn btn-primary me-2" (click)="editRequest()">Edit</button>
          <button *ngIf="canSubmit()" class="btn btn-success me-2" (click)="submitRequest()">Submit</button>
          <button *ngIf="canCancel()" class="btn btn-warning" (click)="cancelRequest()">Cancel</button>
          <p *ngIf="!canEdit() && !canSubmit() && !canCancel()" class="text-muted mb-0">No actions available</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container mt-4" *ngIf="isLoading">
  <div class="text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</div>

<div class="container mt-4" *ngIf="!isLoading && errorMessage">
  <div class="alert alert-danger">{{ errorMessage }}</div>
</div>
```

### 8. Create Workflow History Component

`src/app/sponsorship/workflow-history/workflow-history.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../../services/workflow.service';
import { ApprovalHistory } from '../../models/sponsorship-request.model';

@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.component.html',
  styleUrls: ['./workflow-history.component.scss']
})
export class WorkflowHistoryComponent implements OnInit {
  requestId?: number;
  approvalHistory: ApprovalHistory[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.requestId = params['id'];
      this.loadWorkflowHistory(params['id']);
    });
  }

  private loadWorkflowHistory(id: number): void {
    this.workflowService.getWorkflowHistory(id).subscribe({
      next: (detail) => {
        this.approvalHistory = detail.approvalHistory || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load workflow history';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sponsorship/admin']);
  }

  getActionBadgeClass(action: string): string {
    return action === 'Approve' ? 'badge-success' : 'badge-danger';
  }
}
```

`src/app/sponsorship/workflow-history/workflow-history.component.html`
```html
<div class="container mt-4">
  <div class="row">
    <div class="col-md-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Workflow History - Request #{{ requestId }}</h2>
        <button class="btn btn-outline-secondary" (click)="goBack()">Back to Admin</button>
      </div>

      <div *ngIf="isLoading" class="text-center">
        <div class="spinner-border"></div>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div class="card" *ngIf="!isLoading && approvalHistory.length > 0">
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li class="list-group-item" *ngFor="let event of approvalHistory; let i = index">
              <div class="d-flex align-items-start gap-3">
                <div class="badge" [ngClass]="getActionBadgeClass(event.action)">
                  {{ i + 1 }}
                </div>
                <div style="flex: 1">
                  <div class="d-flex justify-content-between">
                    <strong>{{ event.approverRole }}: {{ event.action }}</strong>
                    <small class="text-muted">{{ event.approvedAt | date:'medium' }}</small>
                  </div>
                  <p class="mb-0 mt-2">{{ event.comments }}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="alert alert-info" *ngIf="!isLoading && approvalHistory.length === 0">
        No approval history available yet
      </div>
    </div>
  </div>
</div>
```

---

## Program.cs Endpoint Registration

Add to `src/Web/Program.cs`:
```csharp
// Map sponsorship endpoints
app.MapGroup("/api/sponsorship-requests")
    .WithName("Sponsorship Requests")
    .WithOpenApi()
    .MapEndpoint<SponsorshipRequests>();

app.MapGroup("/api/manager-approvals")
    .WithName("Manager Approvals")
    .WithOpenApi()
    .MapEndpoint<ManagerApprovals>();

app.MapGroup("/api/finance-approvals")
    .WithName("Finance Approvals")
    .WithOpenApi()
    .MapEndpoint<FinanceApprovals>();

app.MapGroup("/api/admin/requests")
    .WithName("Admin Requests")
    .WithOpenApi()
    .MapEndpoint<AdminRequests>();

app.MapGroup("/api/sponsorship-types")
    .WithName("Sponsorship Types")
    .WithOpenApi()
    .MapEndpoint<SponsorshipTypes>();
```

---

## Environment Configuration

### src/environments/environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7100/api', // Adjust to your backend URL
  identityUrl: 'http://localhost:7100'
};
```

### src/environments/environment.prod.ts
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api.azurewebsites.net/api',
  identityUrl: 'https://your-api.azurewebsites.net'
};
```

---

## Summary

✅ **Sponsorship Module**: Encapsulates all sponsorship-related components
✅ **Role-Based Routing**: Protects routes based on user roles
✅ **Navigation Menu**: Shows role-specific links
✅ **Auth Guard**: Prevents unauthorized access
✅ **Role Guard**: Enforces role-based access control
✅ **All Components**: Detail, Form, List, Approvals, Admin, History

**Implementation is now complete!** 🎉

