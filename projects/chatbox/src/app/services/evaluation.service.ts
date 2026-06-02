import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Evaluation, EvaluationRequest, EvaluationSummary, Recommendation } from '../models/evaluation.model';
import { AuthService } from './auth.service';
import { SpecialistService } from './specialist.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private specialistService = inject(SpecialistService);

  private baseUrl = `${environment.apiUrl}/Ã©valuations`;
  private recommendationsUrl = `${environment.apiUrl}/recommendations`;
  private specialistSummaryUrl = `${environment.apiUrl}/specialists`;

  private evaluationsSubject = new BehaviorSubject<Evaluation[]>([]);
  public evaluations$ = this.evaluationsSubject.asObservable();

  createEvaluation(evaluation: EvaluationRequest): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.baseUrl, this.toEvaluationRequest(evaluation)).pipe(
      map(response => this.mapEvaluation(response)),
      switchMap(response => this.refreshSpecialistAfterEvaluation(response)),
      tap(response => {
        this.evaluationsSubject.next([...this.evaluationsSubject.value, response]);
      })
    );
  }

  submitProjectEvaluation(
    projectId: string,
    specialistId: string,
    data: Partial<Pick<EvaluationRequest, 'score' | 'comment' | 'status' | 'startTime' | 'endTime' | 'availableDate' | 'currentSessions'>> = {}
  ): Observable<Evaluation> {
    const entrepreneurId = this.authService.currentUser?.id;

    if (!entrepreneurId) {
      throw new Error('Cannot create an evaluation without an authenticated entrepreneur.');
    }

    return this.createEvaluation({
      projectId: String(projectId),
      specialistId: String(specialistId),
      entrepreneurId: String(entrepreneurId),
      score: Number(data.score || 0),
      comment: data.comment || '',
      status: data.status || 'PENDING',
      startTime: data.startTime,
      endTime: data.endTime,
      availableDate: data.availableDate,
      currentSessions: Number(data.currentSessions || 0)
    });
  }

  requestProjectEvaluation(
    projectId: string,
    data: Pick<EvaluationRequest, 'specialistId'> & Partial<Pick<EvaluationRequest, 'score' | 'comment' | 'status' | 'startTime' | 'endTime' | 'availableDate' | 'currentSessions'>>
  ): Observable<Evaluation> {
    return this.submitProjectEvaluation(projectId, data.specialistId, data);
  }

  getEvaluationById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      map(response => this.mapEvaluation(response))
    );
  }

  deleteEvaluation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      tap(() => {
        this.evaluationsSubject.next(
          this.evaluationsSubject.value.filter(evaluation => evaluation.id !== id)
        );
      })
    );
  }

  getEvaluationsBySpecialist(specialistId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.baseUrl}/spÃ©cialiste/${encodeURIComponent(specialistId)}`
    ).pipe(
      map(response => response.map(evaluation => this.mapEvaluation(evaluation))),
      tap(response => this.evaluationsSubject.next(response))
    );
  }

  getSpecialistEvaluations(specialistId: string): Observable<Evaluation[]> {
    return this.getEvaluationsBySpecialist(specialistId);
  }

  getEvaluationsByEntrepreneur(entrepreneurId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.baseUrl}/entrepreneur/${encodeURIComponent(entrepreneurId)}`
    ).pipe(
      map(response => response.map(evaluation => this.mapEvaluation(evaluation))),
      tap(response => this.evaluationsSubject.next(response))
    );
  }

  getEntrepreneurEvaluations(entrepreneurId?: string): Observable<Evaluation[]> {
    const currentEntrepreneurId = entrepreneurId || this.authService.currentUser?.id;

    if (!currentEntrepreneurId) {
      throw new Error('Cannot load evaluations without an entrepreneur id.');
    }

    return this.getEvaluationsByEntrepreneur(currentEntrepreneurId);
  }

  getSpecialistEvaluationSummary(specialistId: string): Observable<EvaluationSummary> {
    return this.http.get<EvaluationSummary>(
      `${this.specialistSummaryUrl}/${encodeURIComponent(specialistId)}/evaluation-summary`
    );
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(this.recommendationsUrl);
  }

  createRecommendation(recommendation: Omit<Recommendation, 'id' | 'createdAt'>): Observable<Recommendation> {
    return this.http.post<Recommendation>(this.recommendationsUrl, recommendation);
  }

  endorseRecommendation(recommendationId: string): Observable<Recommendation> {
    return this.http.post<Recommendation>(
      `${this.recommendationsUrl}/${encodeURIComponent(recommendationId)}/endorse`,
      {}
    );
  }

  private mapEvaluation(evaluation: Evaluation): Evaluation {
    return {
      ...evaluation,
      id: String(evaluation.id || ''),
      projectId: evaluation.projectId ? String(evaluation.projectId) : undefined,
      specialistId: String(evaluation.specialistId || ''),
      entrepreneurId: String(evaluation.entrepreneurId || ''),
      score: Number(evaluation.score || 0),
      comment: evaluation.comment || '',
      status: evaluation.status || 'PENDING',
      currentSessions: Number(evaluation.currentSessions || 0)
    };
  }

  private toEvaluationRequest(evaluation: EvaluationRequest): EvaluationRequest {
    return {
      projectId: evaluation.projectId ? String(evaluation.projectId) : undefined,
      specialistId: String(evaluation.specialistId),
      entrepreneurId: String(evaluation.entrepreneurId),
      score: Number(evaluation.score || 0),
      comment: evaluation.comment || '',
      status: evaluation.status || 'PENDING',
      startTime: evaluation.startTime,
      endTime: evaluation.endTime,
      availableDate: evaluation.availableDate,
      currentSessions: Number(evaluation.currentSessions || 0)
    };
  }

  private refreshSpecialistAfterEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.specialistService.refreshSpecialistProfile(evaluation.specialistId).pipe(
      map(() => evaluation)
    );
  }
}


