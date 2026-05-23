export interface Insight {
  id: string;
  projectId: string;
  title: string;
  description: string;
  insightType: string;
  importanceLevel: string;
  createdAt: Date | string;
}

export interface AIRequest {
  id: string;
  chatId: string;
  prompt: string;
  userId?: string;
  projectId?: string;
  requestType: string;
  endpoint: string;
  payload: string;
  contextData: string;
  status: string;
  createdAt: Date | string;
}

export interface AIResponse {
  id: string;
  requestId: string;
  responseText: string;
  responseJson: string;
  responseType: string;
  score: number;
  label: string;
  confidenceScore: number;
  modelName: string;
  modelMode: string;
  createdAt: Date | string;
}

export interface MLModel {
  id: string;
  modelName: string;
  modelType: string;
  version: string;
  artifactPath: string;
  trainingDataset: string;
  targetName: string;
  accuracy: number;
  precisionScore: number;
  recallScore: number;
  f1Score: number;
  isLoaded: boolean;
  fallbackMode: boolean;
  createdAt: Date | string;
}

export interface EngineeredFeatures {
  id: string;
  projectId: string;
  fundingPerRound: number;
  experiencePerRound: number;
  tractionPerEmployee: number;
  burnToRevenueRatio: number;
  revenuePerEmployee: number;
  revenuePerUser: number;
  tractionToMarketRatio: number;
}
