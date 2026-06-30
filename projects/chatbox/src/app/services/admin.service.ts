import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  active: boolean;
  banned?: boolean;
  createdAt: string;
}

export interface AdminProject {
  id: string;
  title: string;
  entrepreneurId: string;
  entrepreneur?: AdminUser;
  sector?: string;
  country?: string;
  createdAt?: string;
  analysisStatus: string;
  finalScore?: number;
  riskLevel?: string;
  reportCount?: number;
  latestAnalysis?: AdminAnalysis;
  reports?: AdminReport[];
  supportRequest?: AdminSupportRequest;
  [key: string]: unknown;
}

export interface AdminAnalysis {
  id: string;
  projectId: string;
  project?: string;
  predictionLabel?: string;
  predictionScore?: number;
  confidenceScore?: number;
  finalScore?: number;
  marketAnalysisScore?: number;
  riskLevel?: string;
  strengths?: string;
  weaknesses?: string;
  warnings?: string;
  recommendations?: string;
  createdAt?: string;
}

export interface AdminReport {
  id: string;
  projectId: string;
  project?: string;
  entrepreneur?: AdminUser;
  title: string;
  summary?: string;
  reportType?: string;
  pdfUrl?: string;
  createdAt?: string;
}

export interface AdminSpecialist {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  profession?: string;
  expertiseDomain?: string;
  expertiseDomains?: string[];
  skills?: string[];
  sectors?: string[];
  yearsOfExperience?: number;
  availability?: string;
  rating?: number;
  approvalStatus: string;
  active: boolean;
  verified?: boolean;
  createdAt?: string;
}

export interface AdminComplaint {
  id: string;
  userId?: string;
  projectId?: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  adminResponse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSupportRequest {
  id: string;
  projectId: string;
  project?: string;
  entrepreneur?: AdminUser;
  analysisId?: string;
  generatedNeeds?: string[];
  requestedExpertise?: string[];
  status: string;
  matchedSpecialistId?: string;
  matchedSpecialist?: AdminSpecialist;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totalUsers: number;
  totalEntrepreneurs: number;
  totalSpecialists: number;
  totalAssignments?: number;
  totalReviews?: number;
  totalProjects: number;
  draftProjects: number;
  analyzedProjects: number;
  projectsInProgress: number;
  failedAnalyses: number;
  generatedReports: number;
  pendingSpecialistRequests: number;
  matchedRequests: number;
  projectsBySector: { label: string; count: number }[];
  projectsByStatus: { label: string; count: number }[];
  recentProjects: AdminProject[];
  recentUsers: AdminUser[];
  recentReports: AdminReport[];
  pendingRequests: AdminSupportRequest[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/stats`);
  }

  getDashboardStatistics(): Observable<DashboardSummary> {
    return this.getDashboardSummary();
  }

  getUsers(filters: { search?: string; role?: string; active?: string } = {}): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`, { params: this.params(filters) });
  }

  getUser(userId: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/users/${encodeURIComponent(userId)}`);
  }

  updateUserStatus(userId: string, active: boolean): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${userId}/status`, { active });
  }

  banUser(userId: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/users/${encodeURIComponent(userId)}/ban`, {});
  }

  unbanUser(userId: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/users/${encodeURIComponent(userId)}/unban`, {});
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${encodeURIComponent(userId)}`);
  }

  getEntrepreneurs(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/entrepreneurs`);
  }

  getProjects(filters: { search?: string; status?: string; sector?: string; risk?: string } = {}): Observable<AdminProject[]> {
    return this.http.get<AdminProject[]>(`${this.baseUrl}/projects`, { params: this.params(filters) });
  }

  getProject(projectId: string): Observable<AdminProject> {
    return this.http.get<AdminProject>(`${this.baseUrl}/projects/${projectId}`);
  }

  archiveProject(projectId: string): Observable<AdminProject> {
    return this.http.patch<AdminProject>(`${this.baseUrl}/projects/${projectId}/archive`, {});
  }

  getReports(): Observable<AdminReport[]> {
    return this.http.get<AdminReport[]>(`${this.baseUrl}/reports`);
  }

  downloadReportUrl(reportId: string): string {
    return `${this.baseUrl}/reports/${reportId}/download`;
  }

  getSpecialists(filters: { approvalStatus?: string; active?: string; expertise?: string } = {}): Observable<AdminSpecialist[]> {
    return this.http.get<AdminSpecialist[]>(`${this.baseUrl}/specialists`, { params: this.params(filters) });
  }

  getPendingSpecialists(): Observable<AdminSpecialist[]> {
    return this.http.get<AdminSpecialist[]>(`${this.baseUrl}/specialists/pending`);
  }

  getVerifiedSpecialists(): Observable<AdminSpecialist[]> {
    return this.http.get<AdminSpecialist[]>(`${this.baseUrl}/specialists/verified`);
  }

  updateSpecialistApproval(specialistId: string, approvalStatus: string): Observable<AdminSpecialist> {
    return this.http.patch<AdminSpecialist>(`${this.baseUrl}/specialists/${specialistId}/approval`, { approvalStatus });
  }

  confirmSpecialist(specialistId: string): Observable<AdminSpecialist> {
    return this.http.put<AdminSpecialist>(`${this.baseUrl}/specialists/${encodeURIComponent(specialistId)}/confirm`, {});
  }

  rejectSpecialist(specialistId: string): Observable<AdminSpecialist> {
    return this.http.put<AdminSpecialist>(`${this.baseUrl}/specialists/${encodeURIComponent(specialistId)}/reject`, {});
  }

  updateSpecialistStatus(specialistId: string, active: boolean): Observable<AdminSpecialist> {
    return this.http.patch<AdminSpecialist>(`${this.baseUrl}/specialists/${specialistId}/status`, { active });
  }

  getSupportRequests(status = ''): Observable<AdminSupportRequest[]> {
    return this.http.get<AdminSupportRequest[]>(`${this.baseUrl}/support-requests`, { params: this.params({ status }) });
  }

  updateSupportRequestStatus(requestId: string, status: string, adminNote = ''): Observable<AdminSupportRequest> {
    return this.http.patch<AdminSupportRequest>(`${this.baseUrl}/support-requests/${requestId}/status`, { status, adminNote });
  }

  assignSpecialist(requestId: string, specialistId: string, adminNote = ''): Observable<AdminSupportRequest> {
    return this.http.post<AdminSupportRequest>(`${this.baseUrl}/support-requests/${requestId}/assign-specialist`, { specialistId, adminNote });
  }

  getComplaints(filters: { status?: string } = {}): Observable<AdminComplaint[]> {
    const status = filters.status?.trim();
    if (status) {
      return this.http.get<AdminComplaint[]>(`${this.baseUrl}/complaints/status/${encodeURIComponent(status)}`);
    }
    return this.http.get<AdminComplaint[]>(`${this.baseUrl}/complaints`);
  }

  updateComplaint(complaintId: string, data: { status?: string; adminResponse?: string }): Observable<AdminComplaint> {
    return this.http.put<AdminComplaint>(`${this.baseUrl}/complaints/${encodeURIComponent(complaintId)}`, data);
  }

  deleteComplaint(complaintId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/complaints/${encodeURIComponent(complaintId)}`);
  }

  private params(filters: Record<string, string | undefined>): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });
    return params;
  }
}
