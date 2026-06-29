import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Review {
  id: string;
  entrepreneurId: string;
  specialistId: string;
  comment: string;
  reviewerName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: any;
}

export interface ReviewCreateRequest {
  entrepreneurId: string;
  specialistId: string;
  comment: string;
}

export interface ReviewUpdateRequest {
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reviews`;

  createReview(payload: ReviewCreateRequest): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, payload).pipe(
      map(response => this.normalizeReview(response))
    );
  }

  updateReview(id: string, payload: ReviewUpdateRequest): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload).pipe(
      map(response => this.normalizeReview(response))
    );
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  getSpecialistReviews(specialistId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}`).pipe(
      map(items => items.map(item => this.normalizeReview(item)))
    );
  }

  getEntrepreneurReviews(entrepreneurId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/entrepreneur/${encodeURIComponent(entrepreneurId)}`).pipe(
      map(items => items.map(item => this.normalizeReview(item)))
    );
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      map(response => this.normalizeReview(response))
    );
  }

  private normalizeReview(review: any): Review {
    return {
      ...review,
      id: String(review.id || ''),
      entrepreneurId: String(review.entrepreneurId || ''),
      specialistId: String(review.specialistId || ''),
      comment: String(review.comment || ''),
      reviewerName: review.reviewerName || review.entrepreneurName || review.entrepreneur?.fullName || review.entrepreneur?.name || 'Anonymous',
      createdAt: review.createdAt || review.updatedAt || ''
    };
  }
}
