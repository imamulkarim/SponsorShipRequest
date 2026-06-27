import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { ApprovalService, PendingApprovalDto } from '../../services/approval.service';
import { AuthService } from 'src/api-authorization/auth.service';

@Component({
  standalone: false,
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
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUserRole();
    this.loadApprovals();
  }

  private getUserRole(): void {
    this.userRole = this.authService.getUserRole();
  }

  private loadApprovals(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const role = this.getApprovalRole();
    const loadFn = role === 'Manager'
      ? () => this.approvalService.getPendingManagerApprovals()
      : () => this.approvalService.getPendingFinanceApprovals();

    loadFn().pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.approvals = response?.pendingApprovals ?? [];
      },
      error: (error) => {
        this.errorMessage = 'Failed to load pending approvals';
      }
    });
  }

  viewApproval(id: number): void {
    const role = this.getApprovalRole();

    this.router.navigate([
      '/sponsorship/approvals',
      role === 'Manager' ? 'manager' : 'finance',
      id
    ]);
  }

  private getApprovalRole(): string | null {
    const configuredRole = this.route.snapshot.data['roles']?.[0] as string | undefined;
    return configuredRole ?? this.userRole;
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
