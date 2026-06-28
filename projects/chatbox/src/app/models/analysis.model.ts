export type AnalysisType = 'MARKET' | 'BUSINESS_IDEA' | 'SENTIMENT' | 'COMPETITOR';

export interface Analysis {
  id: string;
  projectId: string;
  type?: AnalysisType;
  title?: string;
  createdAt?: Date | string;
  [key: string]: any;
}

export interface MarketAnalysis {
  id: string;
  projectId: string;
  sector: string;
  country?: string;
  countryCode?: string;
  region: string;
  marketSize: number;
  growthRate: number;
  competitionLevel: string;
  competitorsCount?: number;
  competitionCount?: number;
  productTractionUsers: number;
  trendScore: number;
  geographicScore?: number;
  geographicFitScore?: number;
  marketLabel?: string;
  priority?: string;
  confidenceScore: number;
  keywords: string;
  dataSource?: string;
  dataSources?: string;
  modelVersion?: string;
  createdAt: Date | string;
}

export interface BusinessIdeaAnalysis {
  id: string;
  projectId: string;
  successProbability: number;
  predictionLabel: string;
  confidenceScore: number;
  finalScore: number;
  rawModelFinalScore?: number;
  llmReviewedFinalScore?: number;
  llmAdjustment?: number;
  scoreReliability?: string;
  dataQualityLevel?: string;
  scoreReviewReason?: string;
  scoreReviewSource?: string;
  finalLabel: string;
  startupSuccessScore: number;
  marketAnalysisScore: number;
  sentimentScore: number;
  specialistScore: number;
  modelName: string;
  modelVersion: string;
  strengths: string[] | string;
  weaknesses: string[] | string;
  recommendationsSummary: string;
  recommendations?: string[] | string;
  warnings: string[] | string;
  generatedNeeds?: string[] | string;
  interpretation?: string;
  marketOpinionScore?: number;
  createdAt: Date | string;
}

export interface SentimentAnalysis {
  id: string;
  projectId: string;
  textSource: string;
  reviewText: string;
  sentimentLabel: string;
  sentimentScore: number;
  averageSentimentScore: number;
  overallLabel: string;
  confidenceScore: number;
  rating: number;
  count: number;
  modelName: string;
  modelVersion: string;
  createdAt: Date | string;
}

export interface StartupSuccessAnalysis {
  projectId: string;
  successProbability: number;
  predictionLabel: string;
  confidenceScore: number;
  modelVersion: string;
}

export interface AiSpecialistRecommendation {
  id?: string;
  projectId: string;
  specialistId: string;
  specialistName?: string;
  expertiseDomain?: string;
  skills?: string[] | string;
  availability?: string;
  recommendedScore: number;
  rank: number;
  scoreDetails: string;
  reason: string;
  createdAt?: Date | string;
}

export interface CompetitorAnalysis {
  id: string;
  projectId: string;
  marketAnalysisId: string;
  competitorName: string;
  competitorSector: string;
  strengthLevel: string;
  weaknessLevel: string;
  estimatedMarketShare: number;
  pricePositioning: string;
  createdAt: Date | string;
}

export interface Recommendation {
  id: string;
  projectId: string;
  analysisId: string;
  recommendationType: string;
  content: string;
  priority: string;
  confidenceScore: number;
  generatedBy: string;
  createdAt: Date | string;
}
