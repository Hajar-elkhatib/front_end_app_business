import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  Analysis,
  AnalysisType,
  MarketAnalysis,
  BusinessIdeaAnalysis,
  SentimentAnalysis,
  CompetitorAnalysis
} from '../models/analysis.model';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';
  private businessIdeaStorageKey = 'nexus_local_business_idea_analyses';
  private analysesSubject = new BehaviorSubject<Analysis[]>([]);
  public analyses$ = this.analysesSubject.asObservable();

  getAnalyses(projectId: string, type?: AnalysisType): Observable<Analysis[]> {
    let url = `${this.baseUrl}/projects/${projectId}/analyses`;
    if (type) url += `?type=${type}`;

    return this.http.get<Analysis[]>(url).pipe(
      tap(analyses => this.analysesSubject.next(analyses))
    );
  }

  getAnalysisById(id: string): Observable<Analysis> {
    return this.http.get<Analysis>(`${this.baseUrl}/analyses/${id}`);
  }

  // Market Analysis
  getMarketAnalysis(projectId: string): Observable<MarketAnalysis> {
    return this.http.get<MarketAnalysis>(`${this.baseUrl}/projects/${projectId}/market-analysis`);
  }

  generateMarketAnalysis(projectId: string): Observable<MarketAnalysis> {
    return this.http.post<MarketAnalysis>(`${this.baseUrl}/projects/${projectId}/market-analysis/generate`, {});
  }

  // Business Idea Analysis
  getBusinessIdeaAnalyses(projectId?: string): Observable<BusinessIdeaAnalysis[]> {
    const url = projectId
      ? `${this.baseUrl}/projects/${projectId}/business-idea-analysis`
      : `${this.baseUrl}/business-idea-analysis`;

    return this.http.get<BusinessIdeaAnalysis[] | BusinessIdeaAnalysis>(url).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after business idea analysis list endpoint is available.
        const analyses = this.readLocalBusinessIdeaAnalyses();
        return of(projectId ? analyses.filter(analysis => analysis.projectId === projectId) : analyses);
      }),
      map(response => Array.isArray(response) ? response : response ? [response] : []),
      tap(analyses => {
        this.analysesSubject.next(analyses.map(analysis => ({ ...analysis, type: 'BUSINESS_IDEA' })));
      }),
      catchError(() => of([]))
    );
  }

  getBusinessIdeaAnalysis(projectId: string): Observable<BusinessIdeaAnalysis> {
    return this.http.get<BusinessIdeaAnalysis>(`${this.baseUrl}/projects/${projectId}/business-idea-analysis`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after project business idea analysis endpoint is available.
        const analysis = this.readLocalBusinessIdeaAnalyses().find(item => item.projectId === projectId);
        if (!analysis) {
          throw new Error('Business idea analysis not found');
        }
        return of(analysis);
      })
    );
  }

  getBusinessIdeaAnalysisById(id: string): Observable<BusinessIdeaAnalysis> {
    return this.http.get<BusinessIdeaAnalysis>(`${this.baseUrl}/business-idea-analysis/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after business idea analysis detail endpoint is available.
        const analysis = this.readLocalBusinessIdeaAnalyses().find(item => item.id === id);
        if (!analysis) {
          throw new Error('Business idea analysis not found');
        }
        return of(analysis);
      })
    );
  }

  createBusinessIdeaAnalysis(data: Omit<BusinessIdeaAnalysis, 'id' | 'createdAt'>): Observable<BusinessIdeaAnalysis> {
    return this.http.post<BusinessIdeaAnalysis>(`${this.baseUrl}/business-idea-analysis`, data).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after business idea analysis creation endpoint is available.
        const analysis: BusinessIdeaAnalysis = {
          ...data,
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        this.writeLocalBusinessIdeaAnalyses([...this.readLocalBusinessIdeaAnalyses(), analysis]);
        return of(analysis);
      })
    );
  }

  updateBusinessIdeaAnalysis(id: string, data: Partial<BusinessIdeaAnalysis>): Observable<BusinessIdeaAnalysis> {
    return this.http.put<BusinessIdeaAnalysis>(`${this.baseUrl}/business-idea-analysis/${id}`, data).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after business idea analysis update endpoint is available.
        const analyses = this.readLocalBusinessIdeaAnalyses();
        const existing = analyses.find(analysis => analysis.id === id);
        if (!existing) {
          throw new Error('Business idea analysis not found');
        }
        const updated = { ...existing, ...data, id };
        this.writeLocalBusinessIdeaAnalyses(analyses.map(analysis => analysis.id === id ? updated : analysis));
        return of(updated);
      })
    );
  }

  deleteBusinessIdeaAnalysis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/business-idea-analysis/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after business idea analysis delete endpoint is available.
        this.writeLocalBusinessIdeaAnalyses(this.readLocalBusinessIdeaAnalyses().filter(analysis => analysis.id !== id));
        return of(undefined);
      })
    );
  }

  generateBusinessIdeaAnalysis(projectId: string): Observable<BusinessIdeaAnalysis> {
    return this.http.post<BusinessIdeaAnalysis>(
      `${this.baseUrl}/projects/${projectId}/business-idea-analysis/generate`,
      {}
    );
  }

  // Sentiment Analysis
  getSentimentAnalysis(projectId: string): Observable<SentimentAnalysis> {
    return this.http.get<SentimentAnalysis>(`${this.baseUrl}/projects/${projectId}/sentiment-analysis`);
  }

  generateSentimentAnalysis(projectId: string): Observable<SentimentAnalysis> {
    return this.http.post<SentimentAnalysis>(
      `${this.baseUrl}/projects/${projectId}/sentiment-analysis/generate`,
      {}
    );
  }

  // Competitor Analysis
  getCompetitorAnalysis(projectId: string): Observable<CompetitorAnalysis> {
    return this.http.get<CompetitorAnalysis>(`${this.baseUrl}/projects/${projectId}/competitor-analysis`);
  }

  generateCompetitorAnalysis(projectId: string): Observable<CompetitorAnalysis> {
    return this.http.post<CompetitorAnalysis>(
      `${this.baseUrl}/projects/${projectId}/competitor-analysis/generate`,
      {}
    );
  }

  // Comprehensive analysis generation
  generateAllAnalyses(projectId: string): Observable<Analysis[]> {
    return this.http.post<Analysis[]>(
      `${this.baseUrl}/projects/${projectId}/analyses/generate-all`,
      {}
    ).pipe(
      tap(analyses => this.analysesSubject.next(analyses))
    );
  }

  deleteAnalysis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/analyses/${id}`).pipe(
      tap(() => {
        const analyses = this.analysesSubject.value.filter(a => a.id !== id);
        this.analysesSubject.next(analyses);
      })
    );
  }

  private readLocalBusinessIdeaAnalyses(): BusinessIdeaAnalysis[] {
    try {
      return JSON.parse(localStorage.getItem(this.businessIdeaStorageKey) || '[]') as BusinessIdeaAnalysis[];
    } catch {
      return [];
    }
  }

  private writeLocalBusinessIdeaAnalyses(analyses: BusinessIdeaAnalysis[]) {
    localStorage.setItem(this.businessIdeaStorageKey, JSON.stringify(analyses));
  }
}
