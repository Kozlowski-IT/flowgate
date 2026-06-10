export type RequestCategory = 'purchase' | 'travel' | 'access' | 'other';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export interface RequestPayload {
  category: RequestCategory;
  description: string;
  amountEur?: number;
  neededBy?: string; // ISO date
}

export interface WorkflowRequest {
  id: string;
  title: string;
  payload: RequestPayload;
  status: RequestStatus;
  requesterId: string;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestInput {
  title: string;
  payload: RequestPayload;
}

export const CATEGORY_LABELS: Record<RequestCategory, string> = {
  purchase: 'Einkauf',
  travel: 'Reise',
  access: 'Zugriff/Berechtigung',
  other: 'Sonstiges',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Entwurf',
  submitted: 'Eingereicht',
  in_review: 'In Prüfung',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
  changes_requested: 'Änderungen erbeten',
};
