export interface Evaluation {
  id: string;
  specialistId: string;
  entrepreneurId: string;
  score: number;
  comment: string;
  createdAt: Date | string;
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
