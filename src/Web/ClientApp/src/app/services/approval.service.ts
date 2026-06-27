import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  ApproveRequestCommand,
  FinanceApprovalsClient,
  ManagerApprovalsClient,
  PendingApprovalDto as PendingApprovalDtoClient,
  RejectRequestCommand
} from '../web-api-client';

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
  constructor(
    private managerApprovalsClient: ManagerApprovalsClient,
    private financeApprovalsClient: FinanceApprovalsClient
  ) {}

  // Manager Approvals
  getPendingManagerApprovals(): Observable<PendingApprovalsVm> {
    return this.managerApprovalsClient.getPendingApprovals().pipe(
      take(1),
      map(vm => ({ pendingApprovals: this.mapPendingApprovals(vm.pendingApprovals) }))
    );
  }

  approveRequestAsManager(id: number, remarks: string): Observable<void> {
    return this.managerApprovalsClient.approveRequest(
      id,
      new ApproveRequestCommand({ id, remarks, approverRole: 'Manager' })
    ).pipe(take(1));
  }

  rejectRequestAsManager(id: number, remarks: string): Observable<void> {
    return this.managerApprovalsClient.rejectRequest(
      id,
      new RejectRequestCommand({ id, remarks, approverRole: 'Manager' })
    ).pipe(take(1));
  }

  // Finance Admin Approvals
  getPendingFinanceApprovals(): Observable<PendingApprovalsVm> {
    return this.financeApprovalsClient.getPendingApprovalsFinance().pipe(
      take(1),
      map(vm => ({ pendingApprovals: this.mapPendingApprovals(vm.pendingApprovals) }))
    );
  }

  approveRequestAsFinance(id: number, remarks: string): Observable<void> {
    return this.financeApprovalsClient.approveRequestFinance(
      id,
      new ApproveRequestCommand({ id, remarks, approverRole: 'FinanceAdmin' })
    ).pipe(take(1));
  }

  rejectRequestAsFinance(id: number, remarks: string): Observable<void> {
    return this.financeApprovalsClient.rejectRequestFinance(
      id,
      new RejectRequestCommand({ id, remarks, approverRole: 'FinanceAdmin' })
    ).pipe(take(1));
  }

  private mapPendingApprovals(pendingApprovals?: PendingApprovalDtoClient[]): PendingApprovalDto[] {
    return (pendingApprovals ?? []).map(approval => ({
      id: approval.id ?? 0,
      title: approval.title ?? '',
      requestorName: approval.requestorName ?? '',
      department: approval.department ?? '',
      eventName: approval.eventName ?? '',
      eventDate: approval.eventDate ?? new Date(),
      requestedAmount: approval.requestedAmount ?? 0,
      purpose: approval.purpose ?? '',
      submittedAt: approval.submittedAt ?? new Date()
    }));
  }
}
