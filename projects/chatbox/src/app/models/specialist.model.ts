import { User } from './user.model';

export interface Specialist extends User {
  userId?: string;
  specialistId?: string;
  mongoId?: string;
  profession: string;
  expertiseDomain: string;

  skills: string[];
  sectors: string[];

  industryExperience: number;
  hourlyRate: number;

  languages: string[];

  location: string;
  averageRating: number;
  reviewsCount: number;

  availabilityStatus: string;
  available?: boolean;

  bio: string;
  completedProjects: number;

  avatarUrl?: string;
  yearsExperience?: number;
  responseRate?: number;
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

export interface SpecialistReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}
