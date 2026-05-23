import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Evaluation, EvaluationSummary, Recommendation } from '../models/evaluation.model';

@Injectable({
    providedIn: 'root'
})
export class EvaluationService {

    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080/api';

    private evaluationsSubject = new BehaviorSubject<Evaluation[]>([]);
    public evaluations$ = this.evaluationsSubject.asObservable();

    getEvaluations(
        specialistId?: string,
        projectId?: string
    ): Observable<Evaluation[]> {

        let url = `${this.baseUrl}/evaluations`;

        const params = new URLSearchParams();

        if (specialistId) {
            params.append('specialistId', specialistId);
        }

        if (projectId) {
            params.append('projectId', projectId);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return this.http.get<Evaluation[]>(url).pipe(
            tap((evals) => {
                this.evaluationsSubject.next(evals);
            })
        );
    }

    getEvaluationById(id: string): Observable<Evaluation> {
        return this.http.get<Evaluation>(
            `${this.baseUrl}/evaluations/${id}`
        );
    }

    createEvaluation(
        evaluation: Omit<Evaluation, 'id' | 'createdAt'>
    ): Observable<Evaluation> {

        return this.http.post<Evaluation>(
            `${this.baseUrl}/evaluations`,
            evaluation
        ).pipe(
            tap((newEval) => {
                const evals = this.evaluationsSubject.value;
                this.evaluationsSubject.next([...evals, newEval]);
            })
        );
    }

    updateEvaluation(
        id: string,
        data: Partial<Evaluation>
    ): Observable<Evaluation> {

        return this.http.patch<Evaluation>(
            `${this.baseUrl}/evaluations/${id}`,
            data
        ).pipe(
            tap((updated) => {
                const evals = this.evaluationsSubject.value.map((e) =>
                    e.id === id ? updated : e
                );

                this.evaluationsSubject.next(evals);
            })
        );
    }

    deleteEvaluation(id: string): Observable<void> {

        return this.http.delete<void>(
            `${this.baseUrl}/evaluations/${id}`
        ).pipe(
            tap(() => {
                const evals = this.evaluationsSubject.value.filter(
                    (e) => e.id !== id
                );

                this.evaluationsSubject.next(evals);
            })
        );
    }

    getSpecialistEvaluationSummary(
        specialistId: string
    ): Observable<EvaluationSummary> {

        return this.http.get<EvaluationSummary>(
            `${this.baseUrl}/specialists/${specialistId}/evaluation-summary`
        );
    }

    getRecommendations(
        specialistId?: string,
        projectId?: string
    ): Observable<Recommendation[]> {

        let url = `${this.baseUrl}/recommendations`;

        const params = new URLSearchParams();

        if (specialistId) {
            params.append('specialistId', specialistId);
        }

        if (projectId) {
            params.append('projectId', projectId);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return this.http.get<Recommendation[]>(url);
    }

    createRecommendation(
        recommendation: Omit<Recommendation, 'id' | 'createdAt'>
    ): Observable<Recommendation> {

        return this.http.post<Recommendation>(
            `${this.baseUrl}/recommendations`,
            recommendation
        );
    }

    endorseRecommendation(
        recommendationId: string
    ): Observable<Recommendation> {

        return this.http.post<Recommendation>(
            `${this.baseUrl}/recommendations/${recommendationId}/endorse`,
            {}
        );
    }
}