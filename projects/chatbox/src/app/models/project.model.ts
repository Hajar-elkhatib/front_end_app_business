import { Specialist } from './specialist.model';

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string; // ISO Date string
  category: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'pending';
  assignedSpecialistId?: string;
  assignedSpecialist?: Specialist;
  analysisSummary?: string;
  progress: number; // 0 to 100
  createdAt: string; // ISO Date string
  updatedAt?: string; // ISO Date string
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  aiScores?: {
    marketScore: number; // 0 to 100
    successProbability: number; // 0 to 100
    competitionLevel: 'Low' | 'Medium' | 'High';
    sentimentScore: number; // 0 to 100
  };
}
