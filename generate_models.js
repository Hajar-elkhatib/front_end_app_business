const fs = require('fs');
const path = require('path');

const modelsDir = 'c:/projects/tutor/front_end_app_business/projects/chatbox/src/app/models';

const models = {
    'user.model.ts': `export interface User {
  id: string;
  fullname: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  createdAt: Date | string;
}

export interface Entrepreneur extends User {
  companyName: string;
  businessType: string;
}

export interface Admin extends User {
}
`,
    'specialist.model.ts': `import { User } from './user.model';

export interface Specialist extends User {
  profession: string;
  expertiseDomain: string;
  skills: string;
  sectors: string;
  industryExperience: number;
  hourlyRate: number;
  languages: string;
  location: string;
  averageRating: number;
  reviewsCount: number;
  availabilityStatus: string;
  bio: string;
  completedProjects: number;
}

export interface Availability {
  id: string;
  specialistId: string;
  availableDate: Date | string;
  startTime: string;
  endTime: string;
  status: string;
  maxSessions: number;
  currentSessions: number;
}

export interface SpecialistRecommendation {
  id: string;
  projectId: string;
  specialistId: string;
  recommendedScore: number;
  rank: number;
  reason: string;
  scoreDetails: string;
  createdAt: Date | string;
}
`,
    'project.model.ts': `export interface Project {
  id: string;
  entrepreneurId: string;
  title: string;
  description: string;
  sector: string;
  projectStatus: string;
  country: string;
  countryCode: string;
  region: string;
  keyword: string;
  founderExperienceYears: number;
  fundingRounds: number;
  teamSize: number;
  marketSizeBillion: number;
  marketGrowthRatePercent: number;
  productTractionUsers: number;
  burnRateMillion: number;
  revenueMillion: number;
  investorType: string;
  founderBackground: string;
  competitionLevel: string;
  searchTrendScore: number;
  useWorldBank: boolean;
  opinions: string;
  createdAt: Date | string;
}
`,
    'complaint.model.ts': `export interface Complaint {
  id: string;
  userId: string;
  projectId: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  aiSuggestedResponse: string;
  createdAt: Date | string;
  resolvedAt?: Date | string;
}
`,
    'report.model.ts': `export interface Report {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  reportType: string;
  content: string;
  pdfUrl: string;
  generatedBy: string;
  modelVersion: string;
  createdAt: Date | string;
}
`,
    'chat.model.ts': `export interface Chat {
  id: string;
  projectId: string;
  title: string;
  contextType: string;
  createdAt: Date | string;
}

export interface Conversation {
  id: string;
  specialistId: string;
  entrepreneurId: string;
  projectId: string;
  startedAt: Date | string;
}

export interface Message {
  id: string;
  conversationId: string;
  chatId: string;
  role: string;
  content: string;
  timestamp: Date | string;
  senderType: string;
}
`,
    'evaluation.model.ts': `export interface Evaluation {
  id: string;
  specialistId: string;
  entrepreneurId: string;
  score: number;
  comment: string;
  createdAt: Date | string;
}
`,
    'ai.model.ts': `export interface Insight {
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
`,
    'analysis.model.ts': `export interface MarketAnalysis {
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
`,
    'knowledge-document.model.ts': `export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  embeddingVector: string;
  createdAt: Date | string;
}
`
};

for (const [filename, content] of Object.entries(models)) {
    fs.writeFileSync(path.join(modelsDir, filename), content);
}
console.log('Successfully generated all models.');
