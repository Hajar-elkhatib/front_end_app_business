export type ProjectAssignmentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DONE' | 'CANCELLED';

export interface ProjectAssignmentResponse {
  id: string;
  projectId: string;
  specialistId: string;
  entrepreneurId: string;
  status: ProjectAssignmentStatus;
  message?: string;
  responseMessage?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  respondedAt?: Date | string;
  doneAt?: Date | string;
  cancelledAt?: Date | string;
  project?: {
    id?: string;
    title?: string;
    summary?: string;
    description?: string;
    sector?: string;
    projectStatus?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    keyword?: string;
    createdAt?: Date | string;
    [key: string]: any;
  };
  entrepreneur?: {
    id?: string;
    fullName?: string;
    email?: string;
    [key: string]: any;
  };
  specialist?: {
    id?: string;
    fullName?: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AssignmentRequest {
  projectId: string;
  specialistId: string;
  entrepreneurId: string;
  message?: string;
}

export interface AssignmentResponseRequest {
  response?: 'ACCEPTED' | 'REJECTED';
  message?: string;
}
