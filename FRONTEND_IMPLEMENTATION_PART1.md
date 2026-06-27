# Quick Reference: Frontend Implementation Checklist

## ANGULAR FRONTEND IMPLEMENTATION

### STEP 1: CREATE MODELS & INTERFACES

**1. Create sponsorship-request.model.ts**

`src/app/models/sponsorship-request.model.ts`
```typescript
export interface SponsorshipRequest {
  id: number;
  title: string;
  requestorName: string;
  department: string;
  sponsorshipType: string;
  eventName: string;
  eventDate: Date;
  requestedAmount: number;
  purpose: string;
  businessBenefit?: string;
  supportingDocumentUrl?: string;
  status: SponsorshipRequestStatus;
  createdAt: Date;
  lastModifiedAt?: Date;
}

export interface SponsorshipRequestDetail extends SponsorshipRequest {
  managerApprovalRemarks?: string;
  financeApprovalRemarks?: string;
  approvalHistory: ApprovalHistory[];
}

export enum SponsorshipRequestStatus {
  Draft = 'Draft',
  PendingManagerApproval = 'PendingManagerApproval',
  PendingFinanceReview = 'PendingFinanceReview',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

export interface CreateSponsorshipRequestDto {
  title: string;
  department: string;
  sponsorshipTypeId: number;
  eventName: string;
  eventDate: Date;
  requestedAmount: number;
  purpose: string;
  businessBenefit?: string;
  supportingDocumentUrl?: string;
}

export interface UpdateSponsorshipRequestDto extends CreateSponsorshipRequestDto {
  id: number;
}

export interface ApproveRequestDto {
  id: number;
  remarks: string;
  approverRole: string;
}

export interface RejectRequestDto {
  id: number;
  remarks: string;
  approverRole: string;
}

export interface CancelRequestDto {
  id: number;
  reason: string;
}

export interface ApprovalHistory {
  id: number;
  approverId: string;
  approverRole: string;
  action: string;
  comments: string;
  approvedAt: Date;
}
```

**2. Create sponsorship-type.model.ts**

`src/app/models/sponsorship-type.model.ts`
```typescript
export interface SponsorshipType {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}
```

**3. Create workflow-status.model.ts**

`src/app/models/workflow-status.model.ts`
```typescript
export enum UserRole {
  Requestor = 'Requestor',
  Manager = 'Manager',
  FinanceAdmin = 'FinanceAdmin',
  SystemAdmin = 'SystemAdmin'
}

export enum ApprovalAction {
  Approve = 'Approve',
  Reject = 'Reject'
}

export interface WorkflowState {
  currentStatus: string;
  canEdit: boolean;
  canSubmit: boolean;
  canCancel: boolean;
  canApprove: boolean;
  nextApprover?: string;
}
```

---

### STEP 2: CREATE SERVICES

**4. Create sponsorship.service.ts**

`src/app/services/sponsorship.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SponsorshipRequest,
  SponsorshipRequestDetail,
  CreateSponsorshipRequestDto,
  UpdateSponsorshipRequestDto
} from '../models/sponsorship-request.model';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {
  private apiUrl = '/api/sponsorship-requests';

  constructor(private http: HttpClient) {}

  createRequest(request: CreateSponsorshipRequestDto): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  getMyRequests(): Observable<{ requests: SponsorshipRequest[] }> {
    return this.http.get<{ requests: SponsorshipRequest[] }>(this.apiUrl);
  }

  getRequestDetail(id: number): Observable<SponsorshipRequestDetail> {
    return this.http.get<SponsorshipRequestDetail>(`${this.apiUrl}/${id}`);
  }

  updateDraftRequest(id: number, request: UpdateSponsorshipRequestDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  submitRequest(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/submit`, {});
  }

  cancelRequest(id: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, { id, reason });
  }
}
```

**5. Create approval.service.ts**

`src/app/services/approval.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorshipRequest } from '../models/sponsorship-request.model';

export interface PendingApprovalDto {
  id: number;
  title: string;
  requestorName: string;
  department: string;
  eventName: string;
  eventDate: Date;
  requestedAmount: number;
  purpose: string;
  submittedAt: Date;
}

export interface PendingApprovalsVm {
  pendingApprovals: PendingApprovalDto[];
}

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private managerApiUrl = '/api/manager-approvals';
  private financeApiUrl = '/api/finance-approvals';

  constructor(private http: HttpClient) {}

  // Manager Approvals
  getPendingManagerApprovals(): Observable<PendingApprovalsVm> {
    return this.http.get<PendingApprovalsVm>(this.managerApiUrl);
  }

  approveRequestAsManager(id: number, remarks: string): Observable<void> {
    return this.http.post<void>(`${this.managerApiUrl}/${id}/approve`, { remarks });
  }

  rejectRequestAsManager(id: number, remarks: string): Observable<void> {
    return this.http.post<void>(`${this.managerApiUrl}/${id}/reject`, { remarks });
  }

  // Finance Admin Approvals
  getPendingFinanceApprovals(): Observable<PendingApprovalsVm> {
    return this.http.get<PendingApprovalsVm>(this.financeApiUrl);
  }

  approveRequestAsFinance(id: number, remarks: string): Observable<void> {
    return this.http.post<void>(`${this.financeApiUrl}/${id}/approve`, { remarks });
  }

  rejectRequestAsFinance(id: number, remarks: string): Observable<void> {
    return this.http.post<void>(`${this.financeApiUrl}/${id}/reject`, { remarks });
  }
}
```

**6. Create sponsorship-type.service.ts**

`src/app/services/sponsorship-type.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SponsorshipType } from '../models/sponsorship-type.model';

export interface SponsorshipTypesVm {
  sponsorshipTypes: SponsorshipType[];
}

@Injectable({
  providedIn: 'root'
})
export class SponsorshipTypeService {
  private apiUrl = '/api/sponsorship-types';
  private typesSubject = new BehaviorSubject<SponsorshipType[]>([]);
  public types$ = this.typesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTypes();
  }

  private loadTypes(): void {
    this.getSponsorshipTypes().subscribe(vm => {
      this.typesSubject.next(vm.sponsorshipTypes);
    });
  }

  getSponsorshipTypes(): Observable<SponsorshipTypesVm> {
    return this.http.get<SponsorshipTypesVm>(this.apiUrl)
      .pipe(
        tap(vm => this.typesSubject.next(vm.sponsorshipTypes))
      );
  }
}
```

**7. Create workflow.service.ts**

`src/app/services/workflow.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorshipRequest, SponsorshipRequestDetail } from '../models/sponsorship-request.model';

export interface AllRequestsVm {
  requests: SponsorshipRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private adminApiUrl = '/api/admin/requests';

  constructor(private http: HttpClient) {}

  getAllRequests(): Observable<AllRequestsVm> {
    return this.http.get<AllRequestsVm>(this.adminApiUrl);
  }

  getWorkflowHistory(requestId: number): Observable<SponsorshipRequestDetail> {
    return this.http.get<SponsorshipRequestDetail>(`${this.adminApiUrl}/${requestId}/history`);
  }
}
```

---

### STEP 3: CREATE COMPONENTS

**8. Create sponsorship-dashboard.component.ts**

`src/app/sponsorship/sponsorship-dashboard/sponsorship-dashboard.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SponsorshipService } from '../../services/sponsorship.service';
import { SponsorshipRequest, SponsorshipRequestStatus } from '../../models/sponsorship-request.model';

@Component({
  selector: 'app-sponsorship-dashboard',
  templateUrl: './sponsorship-dashboard.component.html',
  styleUrls: ['./sponsorship-dashboard.component.scss']
})
export class SponsorshipDashboardComponent implements OnInit {
  requests: SponsorshipRequest[] = [];
  draftCount = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  isLoading = true;
  errorMessage = '';

  constructor(
    private sponsorshipService: SponsorshipService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.sponsorshipService.getMyRequests().subscribe({
      next: (response) => {
        this.requests = response.requests;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load requests';
        this.isLoading = false;
      }
    });
  }

  private calculateStats(): void {
    this.draftCount = this.requests.filter(r => r.status === SponsorshipRequestStatus.Draft).length;
    this.pendingCount = this.requests.filter(r =>
      r.status === SponsorshipRequestStatus.PendingManagerApproval ||
      r.status === SponsorshipRequestStatus.PendingFinanceReview
    ).length;
    this.approvedCount = this.requests.filter(r => r.status === SponsorshipRequestStatus.Approved).length;
    this.rejectedCount = this.requests.filter(r => r.status === SponsorshipRequestStatus.Rejected).length;
  }

  createNewRequest(): void {
    this.router.navigate(['/sponsorship/create']);
  }

  viewRequest(id: number): void {
    this.router.navigate(['/sponsorship', id]);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      [SponsorshipRequestStatus.Draft]: 'badge-secondary',
      [SponsorshipRequestStatus.PendingManagerApproval]: 'badge-warning',
      [SponsorshipRequestStatus.PendingFinanceReview]: 'badge-info',
      [SponsorshipRequestStatus.Approved]: 'badge-success',
      [SponsorshipRequestStatus.Rejected]: 'badge-danger',
      [SponsorshipRequestStatus.Cancelled]: 'badge-dark'
    };
    return statusMap[status] || 'badge-secondary';
  }
}
```

`src/app/sponsorship/sponsorship-dashboard/sponsorship-dashboard.component.html`
```html
<div class="container mt-4">
  <div class="row mb-4">
    <div class="col-md-12">
      <div class="d-flex justify-content-between align-items-center">
        <h2>Sponsorship Dashboard</h2>
        <button class="btn btn-primary" (click)="createNewRequest()">
          <i class="bi bi-plus-circle"></i> Create New Request
        </button>
      </div>
    </div>
  </div>

  <div class="row mb-4">
    <div class="col-md-3">
      <div class="card text-center">
        <div class="card-body">
          <h5 class="card-title">Draft</h5>
          <p class="card-text display-4 text-secondary">{{ draftCount }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card text-center">
        <div class="card-body">
          <h5 class="card-title">Pending</h5>
          <p class="card-text display-4 text-warning">{{ pendingCount }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card text-center">
        <div class="card-body">
          <h5 class="card-title">Approved</h5>
          <p class="card-text display-4 text-success">{{ approvedCount }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card text-center">
        <div class="card-body">
          <h5 class="card-title">Rejected</h5>
          <p class="card-text display-4 text-danger">{{ rejectedCount }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Recent Requests</h5>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
          <table class="table table-hover" *ngIf="!isLoading && requests.length > 0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let request of requests | slice:0:5">
                <td>{{ request.title }}</td>
                <td>{{ request.eventName }}</td>
                <td>{{ request.requestedAmount | currency }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(request.status)">
                    {{ request.status }}
                  </span>
                </td>
                <td>{{ request.createdAt | date:'short' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" (click)="viewRequest(request.id)">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!isLoading && requests.length === 0" class="text-muted">No requests found</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**9. Create sponsorship-form.component.ts**

`src/app/sponsorship/sponsorship-form/sponsorship-form.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SponsorshipService } from '../../services/sponsorship.service';
import { SponsorshipTypeService } from '../../services/sponsorship-type.service';
import { SponsorshipType } from '../../models/sponsorship-type.model';
import { SponsorshipRequest } from '../../models/sponsorship-request.model';

@Component({
  selector: 'app-sponsorship-form',
  templateUrl: './sponsorship-form.component.html',
  styleUrls: ['./sponsorship-form.component.scss']
})
export class SponsorshipFormComponent implements OnInit {
  form!: FormGroup;
  sponsorshipTypes: SponsorshipType[] = [];
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  requestId?: number;

  constructor(
    private fb: FormBuilder,
    private sponsorshipService: SponsorshipService,
    private sponsorshipTypeService: SponsorshipTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadSponsorshipTypes();
    this.checkEditMode();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      department: ['', Validators.required],
      sponsorshipTypeId: ['', Validators.required],
      eventName: ['', Validators.required],
      eventDate: ['', Validators.required],
      requestedAmount: ['', [Validators.required, Validators.min(0.01)]],
      purpose: ['', [Validators.required, Validators.minLength(10)]],
      businessBenefit: [''],
      supportingDocumentUrl: ['']
    });
  }

  private loadSponsorshipTypes(): void {
    this.sponsorshipTypeService.types$.subscribe(types => {
      this.sponsorshipTypes = types;
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.requestId = params['id'];
        this.loadRequest(params['id']);
      }
    });
  }

  private loadRequest(id: number): void {
    this.sponsorshipService.getRequestDetail(id).subscribe({
      next: (request) => {
        this.populateForm(request);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load request';
      }
    });
  }

  private populateForm(request: SponsorshipRequest): void {
    this.form.patchValue({
      title: request.title,
      department: request.department,
      sponsorshipTypeId: request.sponsorshipType,
      eventName: request.eventName,
      eventDate: new Date(request.eventDate).toISOString().split('T')[0],
      requestedAmount: request.requestedAmount,
      purpose: request.purpose,
      businessBenefit: request.businessBenefit,
      supportingDocumentUrl: request.supportingDocumentUrl
    });
  }

  saveAsDraft(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    if (this.isEditMode && this.requestId) {
      this.sponsorshipService.updateDraftRequest(this.requestId, formValue).subscribe({
        next: () => {
          this.successMessage = 'Request saved as draft';
          this.router.navigate(['/sponsorship']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to save request';
          this.isSubmitting = false;
        }
      });
    } else {
      this.sponsorshipService.createRequest(formValue).subscribe({
        next: (id) => {
          this.successMessage = 'Request created successfully';
          this.router.navigate(['/sponsorship']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create request';
          this.isSubmitting = false;
        }
      });
    }
  }

  submitRequest(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.requestId) {
      // First save, then submit
      const formValue = this.form.value;
      this.sponsorshipService.updateDraftRequest(this.requestId, formValue).subscribe({
        next: () => {
          this.sponsorshipService.submitRequest(this.requestId!).subscribe({
            next: () => {
              this.successMessage = 'Request submitted for approval';
              this.router.navigate(['/sponsorship']);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Failed to submit request';
              this.isSubmitting = false;
            }
          });
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to save request';
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/sponsorship']);
  }
}
```

`src/app/sponsorship/sponsorship-form/sponsorship-form.component.html`
```html
<div class="container mt-4">
  <div class="row">
    <div class="col-md-8 offset-md-2">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isEditMode ? 'Edit' : 'Create' }} Sponsorship Request</h5>
        </div>
        <div class="card-body">
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show">
            {{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show">
            {{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
          </div>

          <form [formGroup]="form">
            <div class="mb-3">
              <label for="title" class="form-label">Title *</label>
              <input type="text" class="form-control" id="title" formControlName="title"
                [class.is-invalid]="form.get('title')?.invalid && form.get('title')?.touched">
              <div class="invalid-feedback" *ngIf="form.get('title')?.invalid && form.get('title')?.touched">
                Title is required
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="department" class="form-label">Department *</label>
                <input type="text" class="form-control" id="department" formControlName="department"
                  [class.is-invalid]="form.get('department')?.invalid && form.get('department')?.touched">
              </div>
              <div class="col-md-6 mb-3">
                <label for="sponsorshipTypeId" class="form-label">Sponsorship Type *</label>
                <select class="form-control" id="sponsorshipTypeId" formControlName="sponsorshipTypeId"
                  [class.is-invalid]="form.get('sponsorshipTypeId')?.invalid && form.get('sponsorshipTypeId')?.touched">
                  <option value="">Select a type</option>
                  <option *ngFor="let type of sponsorshipTypes" [value]="type.id">{{ type.name }}</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="eventName" class="form-label">Event Name *</label>
                <input type="text" class="form-control" id="eventName" formControlName="eventName">
              </div>
              <div class="col-md-6 mb-3">
                <label for="eventDate" class="form-label">Event Date *</label>
                <input type="date" class="form-control" id="eventDate" formControlName="eventDate">
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="requestedAmount" class="form-label">Requested Amount *</label>
                <input type="number" class="form-control" id="requestedAmount" formControlName="requestedAmount" step="0.01">
              </div>
            </div>

            <div class="mb-3">
              <label for="purpose" class="form-label">Purpose *</label>
              <textarea class="form-control" id="purpose" formControlName="purpose" rows="3"></textarea>
              <small class="form-text text-muted">Minimum 10 characters</small>
            </div>

            <div class="mb-3">
              <label for="businessBenefit" class="form-label">Expected Business Benefit</label>
              <textarea class="form-control" id="businessBenefit" formControlName="businessBenefit" rows="2"></textarea>
            </div>

            <div class="mb-3">
              <label for="supportingDocumentUrl" class="form-label">Supporting Document URL</label>
              <input type="url" class="form-control" id="supportingDocumentUrl" formControlName="supportingDocumentUrl">
            </div>

            <div class="d-flex gap-2">
              <button type="button" class="btn btn-secondary" (click)="saveAsDraft()" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Saving...' : 'Save as Draft' }}
              </button>
              <button type="button" class="btn btn-primary" (click)="submitRequest()" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### STEP 4: CREATE APPROVAL COMPONENTS

**10. Create approval-list.component.ts (for Manager & Finance)**

`src/app/sponsorship/approval-list/approval-list.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApprovalService, PendingApprovalDto } from '../../services/approval.service';
import { AuthService } from '../../api-authorization/auth.service';

@Component({
  selector: 'app-approval-list',
  templateUrl: './approval-list.component.html',
  styleUrls: ['./approval-list.component.scss']
})
export class ApprovalListComponent implements OnInit {
  approvals: PendingApprovalDto[] = [];
  isLoading = true;
  errorMessage = '';
  userRole: string | null = null;

  constructor(
    private approvalService: ApprovalService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserRole();
    this.loadApprovals();
  }

  private getUserRole(): void {
    // Get user role from claims or auth service
    this.userRole = this.authService.getUserRole();
  }

  private loadApprovals(): void {
    const loadFn = this.userRole === 'Manager'
      ? () => this.approvalService.getPendingManagerApprovals()
      : () => this.approvalService.getPendingFinanceApprovals();

    loadFn().subscribe({
      next: (response) => {
        this.approvals = response.pendingApprovals;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load pending approvals';
        this.isLoading = false;
      }
    });
  }

  viewApproval(id: number): void {
    this.router.navigate([
      '/sponsorship/approvals',
      this.userRole === 'Manager' ? 'manager' : 'finance',
      id
    ]);
  }

  getUrgencyClass(eventDate: Date): string {
    const daysUntilEvent = Math.floor(
      (new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilEvent <= 7) return 'badge-danger';
    if (daysUntilEvent <= 14) return 'badge-warning';
    return 'badge-info';
  }
}
```

`src/app/sponsorship/approval-list/approval-list.component.html`
```html
<div class="container mt-4">
  <div class="row">
    <div class="col-md-12">
      <h2>Pending Approvals</h2>

      <div *ngIf="isLoading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <table class="table table-hover" *ngIf="!isLoading && approvals.length > 0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Requestor</th>
            <th>Department</th>
            <th>Amount</th>
            <th>Event Date</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let approval of approvals">
            <td>{{ approval.title }}</td>
            <td>{{ approval.requestorName }}</td>
            <td>{{ approval.department }}</td>
            <td>{{ approval.requestedAmount | currency }}</td>
            <td>
              {{ approval.eventDate | date:'short' }}
              <span class="badge" [ngClass]="getUrgencyClass(approval.eventDate)">
                Urgent
              </span>
            </td>
            <td>{{ approval.submittedAt | date:'short' }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary" (click)="viewApproval(approval.id)">
                Review
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!isLoading && approvals.length === 0" class="alert alert-info">
        No pending approvals at the moment
      </p>
    </div>
  </div>
</div>
```

**11. Create approval-review.component.ts**

`src/app/sponsorship/approval-review/approval-review.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SponsorshipService } from '../../services/sponsorship.service';
import { ApprovalService } from '../../services/approval.service';
import { SponsorshipRequestDetail } from '../../models/sponsorship-request.model';
import { AuthService } from '../../api-authorization/auth.service';

@Component({
  selector: 'app-approval-review',
  templateUrl: './approval-review.component.html',
  styleUrls: ['./approval-review.component.scss']
})
export class ApprovalReviewComponent implements OnInit {
  request?: SponsorshipRequestDetail;
  form!: FormGroup;
  isLoading = true;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';
  userRole: string | null = null;
  requestId?: number;

  constructor(
    private fb: FormBuilder,
    private sponsorshipService: SponsorshipService,
    private approvalService: ApprovalService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      remarks: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.getUserRole();
    this.route.params.subscribe(params => {
      this.requestId = params['id'];
      this.loadRequestDetail(params['id']);
    });
  }

  private getUserRole(): void {
    this.userRole = this.authService.getUserRole();
  }

  private loadRequestDetail(id: number): void {
    this.sponsorshipService.getRequestDetail(id).subscribe({
      next: (request) => {
        this.request = request;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load request details';
        this.isLoading = false;
      }
    });
  }

  approve(): void {
    if (this.form.invalid || !this.requestId) return;

    this.isProcessing = true;
    const remarks = this.form.get('remarks')?.value;

    const approveFn = this.userRole === 'Manager'
      ? () => this.approvalService.approveRequestAsManager(this.requestId!, remarks)
      : () => this.approvalService.approveRequestAsFinance(this.requestId!, remarks);

    approveFn().subscribe({
      next: () => {
        this.successMessage = 'Request approved successfully';
        setTimeout(() => this.router.navigate(['/sponsorship/approvals', this.userRole === 'Manager' ? 'manager' : 'finance']), 1500);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to approve request';
        this.isProcessing = false;
      }
    });
  }

  reject(): void {
    if (this.form.invalid || !this.requestId) return;

    this.isProcessing = true;
    const remarks = this.form.get('remarks')?.value;

    const rejectFn = this.userRole === 'Manager'
      ? () => this.approvalService.rejectRequestAsManager(this.requestId!, remarks)
      : () => this.approvalService.rejectRequestAsFinance(this.requestId!, remarks);

    rejectFn().subscribe({
      next: () => {
        this.successMessage = 'Request rejected successfully';
        setTimeout(() => this.router.navigate(['/sponsorship/approvals', this.userRole === 'Manager' ? 'manager' : 'finance']), 1500);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to reject request';
        this.isProcessing = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sponsorship/approvals', this.userRole === 'Manager' ? 'manager' : 'finance']);
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

`src/app/sponsorship/approval-review/approval-review.component.html`
```html
<div class="container mt-4">
  <div class="row">
    <div class="col-md-8">
      <div class="card" *ngIf="!isLoading && request">
        <div class="card-header">
          <h5 class="mb-0">{{ request.title }}</h5>
        </div>
        <div class="card-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <p><strong>Requestor:</strong> {{ request.requestorName }}</p>
              <p><strong>Department:</strong> {{ request.department }}</p>
              <p><strong>Sponsorship Type:</strong> {{ request.sponsorshipType }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Status:</strong> <span class="badge" [ngClass]="getStatusBadgeClass(request.status)">{{ request.status }}</span></p>
              <p><strong>Event Date:</strong> {{ request.eventDate | date:'medium' }}</p>
              <p><strong>Amount Requested:</strong> {{ request.requestedAmount | currency }}</p>
            </div>
          </div>

          <hr>

          <div class="mb-3">
            <h6>Event Information</h6>
            <p><strong>Event Name:</strong> {{ request.eventName }}</p>
          </div>

          <div class="mb-3">
            <h6>Purpose</h6>
            <p>{{ request.purpose }}</p>
          </div>

          <div *ngIf="request.businessBenefit" class="mb-3">
            <h6>Expected Business Benefit</h6>
            <p>{{ request.businessBenefit }}</p>
          </div>

          <div *ngIf="request.approvalHistory && request.approvalHistory.length > 0" class="mb-3">
            <h6>Approval History</h6>
            <ul class="list-group">
              <li class="list-group-item" *ngFor="let history of request.approvalHistory">
                <strong>{{ history.approverRole }}:</strong> {{ history.action }}
                <br>
                <small class="text-muted">{{ history.approvedAt | date:'medium' }}</small>
                <br>
                {{ history.comments }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">Approval Decision</h6>
        </div>
        <div class="card-body">
          <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
          <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

          <form [formGroup]="form">
            <div class="mb-3">
              <label for="remarks" class="form-label">Remarks *</label>
              <textarea class="form-control" id="remarks" formControlName="remarks" rows="4"
                [class.is-invalid]="form.get('remarks')?.invalid && form.get('remarks')?.touched"></textarea>
              <small class="form-text text-muted">Minimum 10 characters</small>
            </div>

            <div class="d-grid gap-2">
              <button type="button" class="btn btn-success" (click)="approve()" [disabled]="form.invalid || isProcessing">
                {{ isProcessing ? 'Processing...' : 'Approve' }}
              </button>
              <button type="button" class="btn btn-danger" (click)="reject()" [disabled]="form.invalid || isProcessing">
                {{ isProcessing ? 'Processing...' : 'Reject' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### STEP 5: CREATE ADMIN COMPONENTS

**12. Create admin-dashboard.component.ts**

`src/app/sponsorship/admin-dashboard/admin-dashboard.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../../services/workflow.service';
import { SponsorshipRequest, SponsorshipRequestStatus } from '../../models/sponsorship-request.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  requests: SponsorshipRequest[] = [];
  isLoading = true;
  errorMessage = '';
  selectedFilters = {
    status: '',
    department: ''
  };
  statuses = Object.values(SponsorshipRequestStatus);
  departments: string[] = [];

  statusStats = {
    draft: 0,
    pendingManager: 0,
    pendingFinance: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };

  constructor(
    private workflowService: WorkflowService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllRequests();
  }

  private loadAllRequests(): void {
    this.workflowService.getAllRequests().subscribe({
      next: (response) => {
        this.requests = response.requests;
        this.extractDepartments();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load requests';
        this.isLoading = false;
      }
    });
  }

  private extractDepartments(): void {
    this.departments = [...new Set(this.requests.map(r => r.department))];
  }

  private calculateStats(): void {
    this.statusStats = {
      draft: this.requests.filter(r => r.status === SponsorshipRequestStatus.Draft).length,
      pendingManager: this.requests.filter(r => r.status === SponsorshipRequestStatus.PendingManagerApproval).length,
      pendingFinance: this.requests.filter(r => r.status === SponsorshipRequestStatus.PendingFinanceReview).length,
      approved: this.requests.filter(r => r.status === SponsorshipRequestStatus.Approved).length,
      rejected: this.requests.filter(r => r.status === SponsorshipRequestStatus.Rejected).length,
      cancelled: this.requests.filter(r => r.status === SponsorshipRequestStatus.Cancelled).length
    };
  }

  get filteredRequests(): SponsorshipRequest[] {
    return this.requests.filter(r => {
      if (this.selectedFilters.status && r.status !== this.selectedFilters.status) return false;
      if (this.selectedFilters.department && r.department !== this.selectedFilters.department) return false;
      return true;
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/sponsorship', id]);
  }

  viewHistory(id: number): void {
    this.router.navigate(['/sponsorship/admin/history', id]);
  }

  exportToCSV(): void {
    const csv = this.convertToCSV(this.filteredRequests);
    this.downloadCSV(csv);
  }

  private convertToCSV(data: SponsorshipRequest[]): string {
    const headers = ['ID', 'Title', 'Requestor', 'Department', 'Event', 'Amount', 'Status', 'Created'];
    const rows = data.map(r => [
      r.id,
      r.title,
      r.requestorName,
      r.department,
      r.eventName,
      r.requestedAmount,
      r.status,
      new Date(r.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    return csvContent;
  }

  private downloadCSV(csv: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `sponsorship-requests-${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      [SponsorshipRequestStatus.Draft]: 'badge-secondary',
      [SponsorshipRequestStatus.PendingManagerApproval]: 'badge-warning',
      [SponsorshipRequestStatus.PendingFinanceReview]: 'badge-info',
      [SponsorshipRequestStatus.Approved]: 'badge-success',
      [SponsorshipRequestStatus.Rejected]: 'badge-danger',
      [SponsorshipRequestStatus.Cancelled]: 'badge-dark'
    };
    return statusMap[status] || 'badge-secondary';
  }
}
```

`src/app/sponsorship/admin-dashboard/admin-dashboard.component.html`
```html
<div class="container-fluid mt-4">
  <div class="row mb-4">
    <div class="col-md-12">
      <h2>Admin Dashboard - All Sponsorship Requests</h2>
    </div>
  </div>

  <!-- Statistics Cards -->
  <div class="row mb-4">
    <div class="col-md-2">
      <div class="card text-center">
        <div class="card-body">
          <h6>Draft</h6>
          <p class="display-6 text-secondary">{{ statusStats.draft }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card text-center">
        <div class="card-body">
          <h6>Manager Approval</h6>
          <p class="display-6 text-warning">{{ statusStats.pendingManager }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card text-center">
        <div class="card-body">
          <h6>Finance Review</h6>
          <p class="display-6 text-info">{{ statusStats.pendingFinance }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card text-center">
        <div class="card-body">
          <h6>Approved</h6>
          <p class="display-6 text-success">{{ statusStats.approved }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card text-center">
        <div class="card-body">
          <h6>Rejected</h6>
          <p class="display-6 text-danger">{{ statusStats.rejected }}</p>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card text-center">
        <div class="card-body">
          <h6>Cancelled</h6>
          <p class="display-6 text-dark">{{ statusStats.cancelled }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="row mb-3">
    <div class="col-md-3">
      <select class="form-control" [(ngModel)]="selectedFilters.status">
        <option value="">All Statuses</option>
        <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
      </select>
    </div>
    <div class="col-md-3">
      <select class="form-control" [(ngModel)]="selectedFilters.department">
        <option value="">All Departments</option>
        <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
      </select>
    </div>
    <div class="col-md-3">
      <button class="btn btn-primary" (click)="exportToCSV()" [disabled]="filteredRequests.length === 0">
        <i class="bi bi-download"></i> Export to CSV
      </button>
    </div>
  </div>

  <!-- Requests Table -->
  <div class="card">
    <div class="card-body">
      <div *ngIf="isLoading" class="text-center">
        <div class="spinner-border"></div>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <table class="table table-hover" *ngIf="!isLoading && filteredRequests.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Requestor</th>
            <th>Department</th>
            <th>Event</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let request of filteredRequests">
            <td>{{ request.id }}</td>
            <td>{{ request.title }}</td>
            <td>{{ request.requestorName }}</td>
            <td>{{ request.department }}</td>
            <td>{{ request.eventName }}</td>
            <td>{{ request.requestedAmount | currency }}</td>
            <td><span class="badge" [ngClass]="getStatusBadgeClass(request.status)">{{ request.status }}</span></td>
            <td>{{ request.createdAt | date:'short' }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary" (click)="viewDetails(request.id)">Details</button>
              <button class="btn btn-sm btn-outline-secondary" (click)="viewHistory(request.id)">History</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!isLoading && filteredRequests.length === 0" class="text-muted">No requests found</p>
    </div>
  </div>
</div>
```

---

## CONTINUE IN: FRONTEND_MODULE_AND_ROUTING.md

