import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../../services/workflow.service';
import { SponsorshipRequest, SponsorshipRequestStatus } from '../../models/sponsorship-request.model';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
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
