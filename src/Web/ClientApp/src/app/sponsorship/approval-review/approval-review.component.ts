import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SponsorshipService } from '../../services/sponsorship.service';
import { ApprovalService } from '../../services/approval.service';
import { SponsorshipRequestDetail } from '../../models/sponsorship-request.model';
import { AuthService } from 'src/api-authorization/auth.service';

@Component({
  standalone: false,
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
