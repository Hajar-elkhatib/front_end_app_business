import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Evaluation, EvaluationRequest, EvaluationReviewView, EvaluationSummary } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/evaluations`;
  private specialistUrl = `${environment.apiUrl}/specialists`;

  private evaluationsSubject = new BehaviorSubject<Evaluation[]>([]);
  public evaluations$ = this.evaluationsSubject.asObservable();

  createEvaluation(evaluation: EvaluationRequest): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.baseUrl, this.toRequestBody(evaluation)).pipe(
      map(response => this.mapEvaluation(response)),
      tap(response => this.evaluationsSubject.next([...this.evaluationsSubject.value, response]))
    );
  }

  createReview(evaluation: EvaluationRequest): Observable<Evaluation> {
    return this.createEvaluation(evaluation);
  }

  submitProjectEvaluation(projectId: string, specialistId: string, data: Partial<Pick<EvaluationRequest, 'score' | 'comment' | 'status' | 'startTime' | 'endTime' | 'availableDate' | 'currentSessions'>> = {}): Observable<Evaluation> {
    const entrepreneurId = this.authService.currentUser?.id;
    const entrepreneurName = this.authService.currentUser?.fullName;

    if (!entrepreneurId) {
      throw new Error('Cannot create an evaluation without an authenticated entrepreneur.');
    }

    return this.createEvaluation({
      projectId: String(projectId),
      specialistId: String(specialistId),
      entrepreneurId: String(entrepreneurId),
      entrepreneurName,
      score: Number(data.score || 0),
      comment: data.comment || '',
      status: data.status || 'PENDING',
      startTime: data.startTime,
      endTime: data.endTime,
      availableDate: data.availableDate,
      currentSessions: Number(data.currentSessions || 0)
    });
  }

  getEvaluationById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      map(response => this.mapEvaluation(response))
    );
  }

  getEvaluationsBySpecialist(specialistId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}`).pipe(
      map(response => response.map(item => this.mapEvaluation(item))),
      tap(response => this.evaluationsSubject.next(response))
    );
  }

  getSpecialistEvaluations(specialistId: string): Observable<Evaluation[]> {
    return this.getEvaluationsBySpecialist(specialistId);
  }

  getEvaluationsByEntrepreneur(entrepreneurId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/entrepreneur/${encodeURIComponent(entrepreneurId)}`).pipe(
      map(response => response.map(item => this.mapEvaluation(item))),
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

  deleteEvaluation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      tap(() => {
        this.evaluationsSubject.next(this.evaluationsSubject.value.filter(item => item.id !== id));
      })
    );
  }

  deleteReview(id: string): Observable<void> {
    return this.deleteEvaluation(id);
  }

  getSpecialistEvaluationSummary(specialistId: string): Observable<EvaluationSummary> {
    return this.getSpecialistEvaluations(specialistId).pipe(
      map(items => ({
        specialistId,
        averageScore: this.computeAverageScore(items),
        totalEvaluations: items.length
      }))
    );
  }

  toReviewViews(evaluations: Evaluation[]): EvaluationReviewView[] {
    const currentUser = this.authService.currentUser;
    return evaluations.map(evaluation => ({
      id: evaluation.id,
      reviewerName: evaluation.entrepreneurName || evaluation.entrepreneurId || 'Anonymous',
      comment: evaluation.comment,
      rating: Number(evaluation.score || 0),
      createdAt: evaluation.createdAt,
      canDelete: !!currentUser && this.canDeleteReview(evaluation, currentUser.id, currentUser.fullName),
      raw: evaluation
    }));
  }

  canDeleteReview(evaluation: Evaluation, currentUserId?: string, currentUserName?: string): boolean {
    if (!currentUserId) return false;
    if (evaluation.entrepreneurId && evaluation.entrepreneurId === currentUserId) return true;
    if (evaluation.entrepreneurName && currentUserName && evaluation.entrepreneurName === currentUserName) return true;
    return false;
  }

  computeAverageScore(evaluations: Evaluation[]): number {
    if (!evaluations.length) return 0;
    const total = evaluations.reduce((sum, item) => sum + Number(item.score || 0), 0);
    return Math.round((total / evaluations.length) * 10) / 10;
  }

  private mapEvaluation(evaluation: Evaluation): Evaluation {
    const rawEvaluation = evaluation as Evaluation & { reviewerName?: string; author?: string };
    return {
      ...evaluation,
      id: String(evaluation.id || ''),
      projectId: evaluation.projectId ? String(evaluation.projectId) : undefined,
      specialistId: String(evaluation.specialistId || ''),
      entrepreneurId: String(evaluation.entrepreneurId || ''),
      entrepreneurName: evaluation.entrepreneurName || rawEvaluation.reviewerName || rawEvaluation.author || undefined,
      score: Number(evaluation.score || 0),
      comment: evaluation.comment || '',
      status: evaluation.status || 'PENDING',
      currentSessions: Number(evaluation.currentSessions || 0)
    };
  }

  private toRequestBody(evaluation: EvaluationRequest): EvaluationRequest {
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
}
