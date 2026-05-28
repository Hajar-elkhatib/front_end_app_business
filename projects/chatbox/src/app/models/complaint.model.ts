export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | string;
export type ComplaintType = 'Technical' | 'Billing' | 'Specialist' | 'Other' | string;

export interface Complaint {
  id: string;
  userId: string;
  projectId?: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  aiSuggestedResponse: string;
  createdAt: Date | string;
  resolvedAt?: Date | string;
}
