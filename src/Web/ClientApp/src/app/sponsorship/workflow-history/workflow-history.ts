import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../../services/workflow.service';
import { ApprovalHistory } from '../../models/sponsorship-request.model';

@Component({
  standalone: false,
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.html',
  styleUrls: ['./workflow-history.css']
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
  ) { }

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
