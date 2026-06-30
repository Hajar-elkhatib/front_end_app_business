import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AssignmentRequest, AssignmentResponseRequest, ProjectAssignmentResponse } from '../models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/assignments`;

  assignProject(payload: AssignmentRequest): Observable<ProjectAssignmentResponse> {
    return this.http.post<ProjectAssignmentResponse>(this.baseUrl, payload).pipe(
      map(response => this.normalizeAssignment(response))
    );
  }

  respondToAssignment(id: string, payload: AssignmentResponseRequest): Observable<ProjectAssignmentResponse> {
    const body = {
      status: payload.status || payload.response,
      responseMessage: payload.responseMessage || payload.message || ''
    };
    return this.http.put<ProjectAssignmentResponse>(`${this.baseUrl}/${encodeURIComponent(id)}/respond`, body).pipe(
      map(response => this.normalizeAssignment(response))
    );
  }

  markAsDone(id: string): Observable<ProjectAssignmentResponse> {
    return this.http.put<ProjectAssignmentResponse>(`${this.baseUrl}/${encodeURIComponent(id)}/done`, {}).pipe(
      map(response => this.normalizeAssignment(response))
    );
  }

  cancelAssignment(id: string): Observable<ProjectAssignmentResponse> {
    return this.http.put<ProjectAssignmentResponse>(`${this.baseUrl}/${encodeURIComponent(id)}/cancel`, {}).pipe(
      map(response => this.normalizeAssignment(response))
    );
  }

  getEntrepreneurAssignments(entrepreneurId: string): Observable<ProjectAssignmentResponse[]> {
    return this.http.get<ProjectAssignmentResponse[]>(`${this.baseUrl}/entrepreneur/${encodeURIComponent(entrepreneurId)}`).pipe(
      map(items => items.map(item => this.normalizeAssignment(item)))
    );
  }

  getDoneAssignments(entrepreneurId: string): Observable<ProjectAssignmentResponse[]> {
    return this.http.get<ProjectAssignmentResponse[]>(`${this.baseUrl}/entrepreneur/${encodeURIComponent(entrepreneurId)}/done`).pipe(
      map(items => items.map(item => this.normalizeAssignment(item)))
    );
  }

  getPendingAssignments(specialistId: string): Observable<ProjectAssignmentResponse[]> {
    return this.http.get<ProjectAssignmentResponse[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}/pending`).pipe(
      map(items => items.map(item => this.normalizeAssignment(item)))
    );
  }

  getActiveAssignments(specialistId: string): Observable<ProjectAssignmentResponse[]> {
    return this.http.get<ProjectAssignmentResponse[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}/active`).pipe(
      map(items => items.map(item => this.normalizeAssignment(item)))
    );
  }

  getSpecialistAssignments(specialistId: string): Observable<ProjectAssignmentResponse[]> {
    return this.http.get<ProjectAssignmentResponse[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}`).pipe(
      map(items => items.map(item => this.normalizeAssignment(item)))
    );
  }

  getAssignmentByProject(projectId: string): Observable<ProjectAssignmentResponse> {
    return this.http.get<ProjectAssignmentResponse>(`${this.baseUrl}/project/${encodeURIComponent(projectId)}`).pipe(
      map(item => this.normalizeAssignment(item))
    );
  }

  toProjectLike(assignment: ProjectAssignmentResponse) {
    const project = assignment.project || {};
    return {
      id: project.id || assignment.projectId,
      entrepreneurId: assignment.entrepreneurId,
      title: project.title || '',
      summary: project.summary || project.description || '',
      description: project.description || project.summary || '',
      sector: project.sector || '',
      projectStatus: project.projectStatus || assignment.status || 'DRAFT',
      country: project.country || '',
      countryCode: project.countryCode || '',
      region: project.region || '',
      keyword: project.keyword || '',
      founderExperienceYears: 0,
      fundingRounds: 0,
      teamSize: 0,
      marketSizeBillion: 0,
      marketGrowthRatePercent: 0,
      productTractionUsers: 0,
      burnRateMillion: 0,
      revenueMillion: 0,
      runwayMonths: 0,
      founderBackground: '',
      competitionLevel: '',
      searchTrendScore: 0,
      viewsWorldRank: 0,
      opinions: '',
      createdAt: project.createdAt || assignment.createdAt || '',
      assignedSpecialistId: assignment.specialistId,
      assignedSpecialist: assignment.specialist,
      status: assignment.status
    };
  }

  private normalizeAssignment(assignment: ProjectAssignmentResponse): ProjectAssignmentResponse {
    return {
      ...assignment,
      id: String(assignment.id || ''),
      projectId: String(assignment.projectId || ''),
      specialistId: String(assignment.specialistId || ''),
      entrepreneurId: String(assignment.entrepreneurId || ''),
      status: assignment.status || 'PENDING'
    };
  }
}
