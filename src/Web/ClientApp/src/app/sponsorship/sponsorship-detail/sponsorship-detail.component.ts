import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { SponsorshipService } from '../../services/sponsorship.service';
import { SponsorshipRequestDetail, SponsorshipRequestStatus } from '../../models/sponsorship-request.model';
import { AuthService } from 'src/api-authorization/auth.service';

@Component({
  standalone: false,
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.route.params.pipe(take(1)).subscribe(params => {
      this.loadRequestDetail(params['id']);
    });
  }

  private loadRequestDetail(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sponsorshipService.getRequestDetail(id).pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (request) => {
        this.request = request;
        this.userRole = this.authService.getUserRole();
        this.isRequestor = this.checkIfRequestor();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load request details';
      }
    });
  }

  private checkIfRequestor(): boolean {
    return !this.userRole || this.userRole === 'Requestor';
  }

  canEdit(): boolean {
    return this.hasRequestorActions() && this.request?.status === SponsorshipRequestStatus.Draft;
  }

  canSubmit(): boolean {
    return this.hasRequestorActions() && this.request?.status === SponsorshipRequestStatus.Draft;
  }

  canCancel(): boolean {
    return this.hasRequestorActions() &&
           !!this.request &&
           ![
             SponsorshipRequestStatus.Approved,
             SponsorshipRequestStatus.Rejected,
             SponsorshipRequestStatus.Cancelled
           ].includes(this.request.status);
  }

  private hasRequestorActions(): boolean {
    return this.isRequestor;
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
