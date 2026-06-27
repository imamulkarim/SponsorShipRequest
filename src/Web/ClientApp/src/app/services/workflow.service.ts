import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  ApprovalHistory,
  SponsorshipRequest,
  SponsorshipRequestDetail,
  SponsorshipRequestStatus
} from '../models/sponsorship-request.model';
import {
  AdminRequestsClient,
  AllSponsorshipRequestDto,
  ApprovalHistoryDto,
  RequestDetailVm
} from '../web-api-client';

export interface AllRequestsVm {
  requests: SponsorshipRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  constructor(private adminRequestsClient: AdminRequestsClient) {}

  getAllRequests(): Observable<AllRequestsVm> {
    
    return this.adminRequestsClient.getAllRequests().pipe(
      take(1),
      map(vm => ({ requests: (vm.requests ?? []).map(request => this.mapAdminRequest(request)) }))
    );
  }

  getWorkflowHistory(requestId: number): Observable<SponsorshipRequestDetail> {
    return this.adminRequestsClient.getRequestDetail(requestId).pipe(
      take(1),
      map(request => this.mapRequestDetail(request))
    );
  }

  private mapAdminRequest(request: AllSponsorshipRequestDto): SponsorshipRequest {
    return {
      id: request.id ?? 0,
      title: request.title ?? '',
      requestorName: request.requestorName ?? '',
      department: request.department ?? '',
      sponsorshipType: request.sponsorshipType ?? '',
      eventName: '',
      eventDate: request.eventDate ?? new Date(),
      requestedAmount: request.requestedAmount ?? 0,
      purpose: '',
      status: this.mapStatus(request.status),
      createdAt: request.createdAt ?? new Date()
    };
  }

  private mapRequestDetail(request: RequestDetailVm): SponsorshipRequestDetail {
    return {
      id: request.id ?? 0,
      title: request.title ?? '',
      requestorName: request.requestorName ?? '',
      department: request.department ?? '',
      sponsorshipType: request.sponsorshipType ?? '',
      eventName: request.eventName ?? '',
      eventDate: request.eventDate ?? new Date(),
      requestedAmount: request.requestedAmount ?? 0,
      purpose: request.purpose ?? '',
      businessBenefit: request.businessBenefit,
      supportingDocumentUrl: request.supportingDocumentUrl,
      status: this.mapStatus(request.status),
      managerApprovalRemarks: request.managerApprovalRemarks,
      financeApprovalRemarks: request.financeApprovalRemarks,
      createdAt: request.createdAt ?? new Date(),
      lastModifiedAt: request.lastModifiedAt,
      approvalHistory: (request.approvalHistory ?? []).map(history => this.mapApprovalHistory(history))
    };
  }

  private mapApprovalHistory(history: ApprovalHistoryDto): ApprovalHistory {
    return {
      id: history.id ?? 0,
      approverId: history.approverId ?? '',
      approverRole: history.approverRole ?? '',
      action: history.action ?? '',
      comments: history.comments ?? '',
      approvedAt: history.approvedAt ?? new Date()
    };
  }

  private mapStatus(status?: string): SponsorshipRequestStatus {
    return Object.values(SponsorshipRequestStatus).includes(status as SponsorshipRequestStatus)
      ? status as SponsorshipRequestStatus
      : SponsorshipRequestStatus.Draft;
  }
}
