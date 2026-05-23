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
  country: string;
  countryCode: string;
  region: string;
  marketSize: number;
  growthRate: number;
  competitionLevel: string;
  competitorsCount: number;
  productTractionUsers: number;
  trendScore: number;
  geographicScore: number;
  marketLabel: string;
  confidenceScore: number;
  keywords: string;
  dataSource: string;
  dataSources: string;
  createdAt: Date | string;
}

export interface BusinessIdeaAnalysis {
  id: string;
  projectId: string;
  successProbability: number;
  predictionLabel: string;
  confidenceScore: number;
  finalScore: number;
  finalLabel: string;
  startupSuccessScore: number;
  marketAnalysisScore: number;
  sentimentScore: number;
  specialistScore: number;
  modelName: string;
  modelVersion: string;
  strengths: string;
  weaknesses: string;
  recommendationsSummary: string;
  warnings: string;
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
