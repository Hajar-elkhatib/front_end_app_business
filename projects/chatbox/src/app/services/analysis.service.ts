import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {
  BusinessIdeaAnalysis,
  MarketAnalysis,
  SentimentAnalysis,
  AiSpecialistRecommendation,
  StartupSuccessAnalysis
} from '../models/analysis.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/analysis`;
  private projectsUrl = `${environment.apiUrl}/projects`;

  analyzeBusinessValidation(projectId: string, opinions = ''): Observable<BusinessIdeaAnalysis> {
    const payload = opinions.trim() ? { opinions: opinions.trim() } : {};
    return this.http.post<BusinessIdeaAnalysis>(`${this.projectsUrl}/${projectId}/analysis/run`, payload);
  }

  getLatestBusinessValidation(projectId: string): Observable<BusinessIdeaAnalysis> {
    return this.http.get<BusinessIdeaAnalysis>(`${this.projectsUrl}/${projectId}/analysis/latest`);
  }

  getBusinessValidationHistory(projectId: string): Observable<BusinessIdeaAnalysis[]> {
    return this.http.get<BusinessIdeaAnalysis[]>(`${this.projectsUrl}/${projectId}/analysis/history`);
  }

  createFeedbacks(projectId: string, feedbackText: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.projectsUrl}/${projectId}/feedbacks`, { feedbackText });
  }

  getFeedbacks(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.projectsUrl}/${projectId}/feedbacks`);
  }

  analyzeFeedbacks(projectId: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.projectsUrl}/${projectId}/feedbacks/analyze`, {});
  }

  predictStartupSuccess(projectId: string): Observable<StartupSuccessAnalysis> {
    return this.http.post<StartupSuccessAnalysis>(`${this.baseUrl}/${projectId}/startup-success`, {});
  }

  analyzeMarket(projectId: string): Observable<MarketAnalysis> {
    return this.http.post<MarketAnalysis>(`${this.baseUrl}/${projectId}/market`, {});
  }

  analyzeSentiment(projectId: string, text: string, textSource = 'manual_feedback'): Observable<SentimentAnalysis> {
    const params = new HttpParams()
      .set('text', text)
      .set('textSource', textSource);
    return this.http.post<SentimentAnalysis>(`${this.baseUrl}/${projectId}/sentiment`, {}, { params });
  }

  recommendSpecialists(projectId: string): Observable<AiSpecialistRecommendation[]> {
    return this.http.post<AiSpecialistRecommendation[]>(`${this.baseUrl}/${projectId}/specialists/recommend`, {});
  }

  getBusinessIdeaAnalysisById(id: string): Observable<BusinessIdeaAnalysis> {
    return throwError(() => new Error('Cette analyse n est pas disponible pour le moment.'));
  }

  createBusinessIdeaAnalysis(data: Partial<BusinessIdeaAnalysis>): Observable<BusinessIdeaAnalysis> {
    return data.projectId
      ? this.analyzeBusinessValidation(data.projectId)
      : throwError(() => new Error('Business validation requires a projectId.'));
  }

  updateBusinessIdeaAnalysis(id: string, data: Partial<BusinessIdeaAnalysis>): Observable<BusinessIdeaAnalysis> {
    return data.projectId
      ? this.analyzeBusinessValidation(data.projectId)
      : throwError(() => new Error('Cette analyse ne peut pas etre mise a jour pour le moment.'));
  }
}


