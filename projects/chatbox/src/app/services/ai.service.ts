import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AIRequest, AIResponse, MLModel, EngineeredFeatures } from '../models/ai.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/ai`;
  private requestsSubject = new BehaviorSubject<AIRequest[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  // AI Requests
  submitRequest(request: Omit<AIRequest, 'id' | 'createdAt' | 'status'>): Observable<AIRequest> {
    return this.http.post<AIRequest>(`${this.baseUrl}/requests`, request);
  }

  getRequest(id: string): Observable<AIRequest> {
    return this.http.get<AIRequest>(`${this.baseUrl}/requests/${id}`);
  }

  getUserRequests(userId: string): Observable<AIRequest[]> {
    return this.http.get<AIRequest[]>(`${this.baseUrl}/requests?userId=${userId}`).pipe(
      tap(requests => this.requestsSubject.next(requests))
    );
  }

  cancelRequest(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/cancel`, {});
  }

  // AI Responses
  getResponse(requestId: string): Observable<AIResponse> {
    return this.http.get<AIResponse>(`${this.baseUrl}/responses?requestId=${requestId}`);
  }

  getResponseById(id: string): Observable<AIResponse> {
    return this.http.get<AIResponse>(`${this.baseUrl}/responses/${id}`);
  }

  // ML Models
  getModels(): Observable<MLModel[]> {
    return this.http.get<MLModel[]>(`${this.baseUrl}/models`);
  }

  getModel(id: string): Observable<MLModel> {
    return this.http.get<MLModel>(`${this.baseUrl}/models/${id}`);
  }

  getModelMetrics(modelId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/models/${modelId}/metrics`);
  }

  // Engineered Features
  getFeatures(modelId: string): Observable<EngineeredFeatures> {
    return this.http.get<EngineeredFeatures>(`${this.baseUrl}/models/${modelId}/features`);
  }

  // Analysis using AI
  analyzeProject(projectId: string, analysisType: string): Observable<AIResponse> {
    const request: Partial<AIRequest> = {
      id: '',
      userId: '', // Should be set by interceptor
      projectId,
      requestType: 'analysis',
      prompt: `Analyze project ${projectId} for ${analysisType}`,
    };

    return this.http.post<AIResponse>(`${this.baseUrl}/analyze-project`, { projectId, analysisType });
  }

  // Recommendation using AI
  getSpecialistRecommendations(projectId: string): Observable<AIResponse> {
    return this.http.post<AIResponse>(
      `${this.baseUrl}/recommend-specialists`, 
      { projectId }
    );
  }

  // Model evaluation
  evaluateModel(modelId: string, testData: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/models/${modelId}/evaluate`, 
      { testData }
    );
  }
}


