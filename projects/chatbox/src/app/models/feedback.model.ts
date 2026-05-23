export interface MarketFeedback {
  id: string;
  projectId: string;
  feedbackText: string;
  interestLevel: number; // 1-5
  respondentType: 'potential-customer' | 'student' | 'entrepreneur' | 'expert' | 'other';
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // 0-1
  createdAt: Date | string;
}

export interface FeedbackForm {
  projectId: string;
  formUrl: string;
  responses: number;
  createdAt: Date | string;
}
