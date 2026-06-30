export interface EvaluationTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface Evaluation {
  id: string;
  assignmentId?: string;
  projectId?: string;
  specialistId: string;
  entrepreneurId: string;
  entrepreneurName?: string;
  score: number;
  comment: string;
  status: string;
  startTime?: EvaluationTime;
  endTime?: EvaluationTime;
  availableDate?: Date | string;
  currentSessions?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EvaluationRequest {
  projectId?: string;
  assignmentId?: string;
  specialistId: string;
  entrepreneurId: string;
  entrepreneurName?: string;
  score: number;
  comment: string;
  status?: string;
  startTime?: EvaluationTime;
  endTime?: EvaluationTime;
  availableDate?: Date | string;
  currentSessions?: number;
}

export interface EvaluationSummary {
  specialistId?: string;
  averageScore?: number;
  totalEvaluations?: number;
  [key: string]: any;
}

export interface EvaluationReviewView {
  id: string;
  reviewerName: string;
  comment: string;
  rating: number;
  createdAt?: Date | string;
  canDelete: boolean;
  raw: Evaluation;
}

export interface Recommendation {
  id: string;
  specialistId?: string;
  projectId?: string;
  content?: string;
  createdAt: Date | string;
  [key: string]: any;
}
