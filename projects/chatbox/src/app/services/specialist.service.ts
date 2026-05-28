import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
    return this.getAllSpecialists();
  }

  getAllSpecialists(): Observable<Specialist[]> {
    if (this.specialistsLoaded) {
      return of(this.specialistsSubject.value);
    }

    return this.http.get<any[]>(this.baseUrl).pipe(
      map(specialists => this.mapSpecialistList(specialists)),
      tap(specialists => this.setSpecialists(specialists))
    );
  }

  getSpecialistById(id: string): Observable<Specialist | undefined> {
    return this.getProfile(id);
  }

  getProfile(userId: string): Observable<Specialist> {
    return this.http.get<any>(`${this.baseUrl}/${encodeURIComponent(userId)}/profile`).pipe(
      map(specialist => this.mapSpecialist(specialist)),
      tap(specialist => this.upsertSpecialist(specialist))
    );
  }

  refreshSpecialistProfile(userId: string): Observable<Specialist> {
    return this.getProfile(userId);
  }

  getByAvailability(availability: string): Observable<Specialist[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/availability/${encodeURIComponent(availability)}`
    ).pipe(
      map(specialists => this.mapSpecialistList(specialists)),
      tap(specialists => this.setSpecialists(specialists))
    );
  }

  getBySector(sector: string): Observable<Specialist[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/sector/${encodeURIComponent(sector)}`
    ).pipe(
      map(specialists => this.mapSpecialistList(specialists))
    );
  }

  getBySkill(skill: string): Observable<Specialist[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/skill/${encodeURIComponent(skill)}`
    ).pipe(
      map(specialists => this.mapSpecialistList(specialists))
    );
  }

  getReviews(specialistId: string): Observable<SpecialistReview[]> {
    return this.http.get<SpecialistReview[]>(
      `${this.baseUrl}/${encodeURIComponent(specialistId)}/reviews`
    ).pipe(
      tap(reviews => this.reviewsSubject.next(reviews))
    );
  }

  createSpecialist(specialist: Omit<Specialist, 'id'>): Observable<Specialist> {
    return this.http.post<any>(this.baseUrl, specialist).pipe(
      map(newSpec => this.mapSpecialist(newSpec)),
      tap(newSpec => {
        const current = this.specialistsSubject.value;
        this.specialistsSubject.next([...current, newSpec]);
      })
    );
  }

  updateSpecialist(id: string, updates: Partial<Specialist>): Observable<Specialist> {
    return this.updateProfile(id, updates);
  }

  updateProfile(userId: string, updates: Partial<Specialist>): Observable<Specialist> {
    return this.http.put<any>(`${this.baseUrl}/${encodeURIComponent(userId)}/profile`, updates).pipe(
      map(specialist => this.mapSpecialist(specialist)),
      tap(updated => {
        const current = this.specialistsSubject.value.map(s =>
          s.id === userId ? updated : s
        );
        this.specialistsSubject.next(current);
      })
    );
  }

  deleteSpecialist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      tap(() => {
        const current = this.specialistsSubject.value.filter(s => s.id !== id);
        this.specialistsSubject.next(current);
      })
    );
  }

  searchSpecialists(query: string): Observable<Specialist[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return this.getAllSpecialists();
    }

    return this.getAllSpecialists().pipe(
      map(specialists => specialists.filter(specialist =>
        specialist.fullName.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
        specialist.expertiseDomain.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
        specialist.skills.some(skill => skill.toLowerCase().includes(normalizedQuery.toLowerCase()))
      ))
    );
  }

  getSpecialistsByDomain(domain: string): Observable<Specialist[]> {
    return this.getBySector(domain);
  }

  getTopRatedSpecialists(limit: number = 10): Observable<Specialist[]> {
    return this.getAllSpecialists().pipe(
      map(specialists => [...specialists]
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limit)
      )
    );
  }

  getAvailableSpecialists(): Observable<Specialist[]> {
    return this.getByAvailability('AVAILABLE');
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

  private mapSpecialistList(specialists: any[]): Specialist[] {
    return specialists.map(specialist => this.mapSpecialist(specialist));
  }

  private setSpecialists(specialists: Specialist[]) {
    this.specialistsLoaded = true;
    this.specialistsSubject.next(specialists);
  }

  private upsertSpecialist(specialist: Specialist) {
    const current = this.specialistsSubject.value;
    const exists = current.some(item => item.id === specialist.id);
    this.specialistsSubject.next(
      exists
        ? current.map(item => item.id === specialist.id ? specialist : item)
        : [...current, specialist]
    );
  }

  private mapSpecialist(specialist: any): Specialist {
    const userId = String(specialist.userId || specialist.id || '');
    const specialistId = String(specialist.specialistId || specialist.id || specialist.userId || '');

    return {
      ...specialist,
      id: userId,
      userId,
      specialistId,
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
      averageRating: Number(specialist.rating ?? specialist.averageRating ?? 0),
      reviewsCount: specialist.reviewsCount || 0,
      availabilityStatus: specialist.availabilityStatus || 'AVAILABLE',
      available: (specialist.availabilityStatus || 'AVAILABLE') === 'AVAILABLE',
      bio: specialist.bio || '',
      completedProjects: Number(specialist.completedProjects || 0),
      avatarUrl: (specialist.fullName || 'N').charAt(0).toUpperCase()
    };
  }
}
