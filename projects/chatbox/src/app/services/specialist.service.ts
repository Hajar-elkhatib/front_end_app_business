import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Specialist, SpecialistReview } from '../models/specialist.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialistService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/specialists';

  private specialistsSubject = new BehaviorSubject<Specialist[]>([]);
  public specialists$ = this.specialistsSubject.asObservable();
  private specialistsLoaded = false;

  private reviewsSubject = new BehaviorSubject<SpecialistReview[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  getSpecialists(): Observable<Specialist[]> {
    if (this.specialistsLoaded) {
      return of(this.specialistsSubject.value);
    }

    return this.http.get<any[]>(this.baseUrl).pipe(
      map(specialists => specialists.map(specialist => this.mapSpecialist(specialist))),
      tap(specialists => {
        this.specialistsLoaded = true;
        this.specialistsSubject.next(specialists);
      })
    );
  }

  getSpecialistById(id: string): Observable<Specialist | undefined> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(specialist => this.mapSpecialist(specialist))
    );
  }

  getReviews(specialistId: string): Observable<SpecialistReview[]> {
    return this.http.get<SpecialistReview[]>(`${this.baseUrl}/${specialistId}/reviews`).pipe(
      catchError(() => of([])),
      tap(reviews => this.reviewsSubject.next(reviews))
    );
  }

  createSpecialist(specialist: Omit<Specialist, 'id'>): Observable<Specialist> {
    return this.http.post<Specialist>(this.baseUrl, specialist).pipe(
      tap(newSpec => {
        const current = this.specialistsSubject.value;
        this.specialistsSubject.next([...current, newSpec]);
      })
    );
  }

  updateSpecialist(id: string, updates: Partial<Specialist>): Observable<Specialist> {
    return this.http.patch<Specialist>(`${this.baseUrl}/${id}`, updates).pipe(
      tap(updated => {
        const current = this.specialistsSubject.value.map(s =>
          s.id === id ? updated : s
        );
        this.specialistsSubject.next(current);
      })
    );
  }

  deleteSpecialist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const current = this.specialistsSubject.value.filter(s => s.id !== id);
        this.specialistsSubject.next(current);
      })
    );
  }

  searchSpecialists(query: string): Observable<Specialist[]> {
    return this.http.get<Specialist[]>(`${this.baseUrl}/search?q=${query}`);
  }

  getSpecialistsByDomain(domain: string): Observable<Specialist[]> {
    return this.http.get<Specialist[]>(`${this.baseUrl}?domain=${domain}`);
  }

  getTopRatedSpecialists(limit: number = 10): Observable<Specialist[]> {
    return this.http.get<Specialist[]>(`${this.baseUrl}/top-rated?limit=${limit}`);
  }

  getAvailableSpecialists(): Observable<Specialist[]> {
    return this.http.get<Specialist[]>(`${this.baseUrl}?available=true`);
  }

  addReview(specialistId: string, review: Omit<SpecialistReview, 'id'>): Observable<SpecialistReview> {
    return this.http.post<SpecialistReview>(`${this.baseUrl}/${specialistId}/reviews`, review);
  }

  updateReview(specialistId: string, reviewId: string, updates: Partial<SpecialistReview>): Observable<SpecialistReview> {
    return this.http.patch<SpecialistReview>(
      `${this.baseUrl}/${specialistId}/reviews/${reviewId}`,
      updates
    );
  }

  deleteReview(specialistId: string, reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${specialistId}/reviews/${reviewId}`);
  }

  private mapSpecialist(specialist: any): Specialist {
    return {
      ...specialist,
      id: specialist.id,
      fullName: specialist.fullName || 'NexusAI Specialist',
      email: specialist.email || '',
      role: 'specialist',
      phone: specialist.phone || '',
      createdAt: specialist.createdAt || new Date().toISOString(),
      profession: specialist.profession || specialist.expertiseDomain || 'Advisor',
      expertiseDomain: specialist.expertiseDomain || 'Business Strategy',
      skills: specialist.skills || [],
      sectors: specialist.sectors || [],
      industryExperience: specialist.industryExperience || 0,
      yearsExperience: specialist.industryExperience || 0,
      hourlyRate: specialist.hourlyRate || 0,
      languages: Array.isArray(specialist.languages)
        ? specialist.languages
        : (specialist.languages || '').split(',').map((language: string) => language.trim()).filter(Boolean),
      location: specialist.location || '',
      averageRating: specialist.rating || specialist.averageRating || 0,
      reviewsCount: specialist.reviewsCount || 0,
      availabilityStatus: specialist.availabilityStatus || 'AVAILABLE',
      available: (specialist.availabilityStatus || 'AVAILABLE') === 'AVAILABLE',
      bio: specialist.bio || '',
      completedProjects: specialist.completedProjects || 0,
      avatarUrl: (specialist.fullName || 'N').charAt(0).toUpperCase()
    };
  }
}
