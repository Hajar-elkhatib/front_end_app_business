export interface Specialist {
  id: string;
  fullName: string;
  expertiseDomain: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  languages: string[];
  bio: string;
  yearsExperience: number;
  averageRating: number;
  avatarUrl?: string;
  available?: boolean;
  completedProjects?: number;
  responseRate?: number;
}

export interface SpecialistReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}
