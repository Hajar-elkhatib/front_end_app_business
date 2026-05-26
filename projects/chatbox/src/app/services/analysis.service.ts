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

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/analysis';

  analyzeBusinessValidation(projectId: string, opinions = ''): Observable<BusinessIdeaAnalysis> {
    const payload = opinions.trim() ? { opinions: opinions.trim() } : {};
    return this.http.post<BusinessIdeaAnalysis>(`${this.baseUrl}/${projectId}/analyze`, payload);
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
