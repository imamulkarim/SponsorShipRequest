import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { SponsorshipService } from '../../services/sponsorship.service';
import { SponsorshipRequest, SponsorshipRequestStatus } from '../../models/sponsorship-request.model';

@Component({
  standalone: false,
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sponsorshipService.getMyRequests().pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.requests = response?.requests ?? [];
        this.calculateStats();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load requests';
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
