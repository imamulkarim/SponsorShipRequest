import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  SponsorshipRequest,
  SponsorshipRequestDetail,
  CreateSponsorshipRequestDto,
  UpdateSponsorshipRequestDto,
  SponsorshipRequestStatus,
  ApprovalHistory
} from '../models/sponsorship-request.model';
import {
  AdminRequestsClient,
  ApprovalHistoryDto,
  CancelRequestCommand,
  CreateSponsorshipRequestCommand,
  RequestDetailVm,
  SponsorshipRequestDto,
  SponsorshipRequestsClient,
  UpdateSponsorshipRequestCommand
} from '../web-api-client';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {
  constructor(
    private sponsorshipRequestsClient: SponsorshipRequestsClient,
    private adminRequestsClient: AdminRequestsClient
  ) {}

  createRequest(request: CreateSponsorshipRequestDto): Observable<number> {
    return this.sponsorshipRequestsClient.createRequest(
      new CreateSponsorshipRequestCommand({
        ...request,
        eventDate: new Date(request.eventDate)
      })
    ).pipe(take(1));
  }

  getMyRequests(): Observable<{ requests: SponsorshipRequest[] }> {
    return this.sponsorshipRequestsClient.getMyRequests().pipe(
      take(1),
      map(vm => ({ requests: (vm.requests ?? []).map(request => this.mapRequest(request)) }))
    );
  }

  getRequestDetail(id: number): Observable<SponsorshipRequestDetail> {
    return this.sponsorshipRequestsClient.getMyRequestsDetail(id).pipe(
      take(1),
      map(request => this.mapRequestDetail(request))
    );
  }

  updateDraftRequest(id: number, request: UpdateSponsorshipRequestDto): Observable<void> {
    return this.sponsorshipRequestsClient.updateRequest(
      id,
      new UpdateSponsorshipRequestCommand({
        ...request,
        id,
        eventDate: new Date(request.eventDate)
      })
    ).pipe(take(1));
  }

  submitRequest(id: number): Observable<void> {
    return this.sponsorshipRequestsClient.submitRequest(id).pipe(take(1));
  }

  cancelRequest(id: number, reason: string): Observable<void> {
    return this.sponsorshipRequestsClient.cancelRequest(
      id,
      new CancelRequestCommand({ id, reason })
    ).pipe(take(1));
  }

  private mapRequest(request: SponsorshipRequestDto): SponsorshipRequest {
    return {
      id: request.id ?? 0,
      title: request.title ?? '',
      requestorName: '',
      department: request.department ?? '',
      sponsorshipType: request.sponsorshipType ?? '',
      eventName: request.eventName ?? '',
      eventDate: request.eventDate ?? new Date(),
      requestedAmount: request.requestedAmount ?? 0,
      purpose: request.purpose ?? '',
      status: this.mapStatus(request.status),
      createdAt: request.createdAt ?? new Date(),
      lastModifiedAt: request.lastModifiedAt
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
