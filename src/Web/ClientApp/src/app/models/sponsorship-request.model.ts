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
