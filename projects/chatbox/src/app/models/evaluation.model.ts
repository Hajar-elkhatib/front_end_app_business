export interface EvaluationTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface Evaluation {
  id: string;
  projectId?: string;
  specialistId: string;
  entrepreneurId: string;
  score: number;
  comment: string;
  status: string;
  startTime?: EvaluationTime;
  endTime?: EvaluationTime;
  availableDate?: Date | string;
  currentSessions?: number;
  createdAt?: Date | string;
}

export interface EvaluationRequest {
  projectId?: string;
  specialistId: string;
  entrepreneurId: string;
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

export interface Recommendation {
  id: string;
  specialistId?: string;
  projectId?: string;
  content?: string;
  createdAt: Date | string;
  [key: string]: any;
}
