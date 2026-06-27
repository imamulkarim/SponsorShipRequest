export enum UserRole {
  Requestor = 'Requestor',
  Manager = 'Manager',
  FinanceAdmin = 'FinanceAdmin',
  SystemAdmin = 'SystemAdmin'
}

export enum ApprovalAction {
  Approve = 'Approve',
  Reject = 'Reject'
}

export interface WorkflowState {
  currentStatus: string;
  canEdit: boolean;
  canSubmit: boolean;
  canCancel: boolean;
  canApprove: boolean;
  nextApprover?: string;
}
