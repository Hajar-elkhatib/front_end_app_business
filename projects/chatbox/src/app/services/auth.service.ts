import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem('nexus_user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get userRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  /** Returns the dashboard route based on the user's role */
  getDashboardRoute(): string {
    const role = this.currentUserSubject.value?.role;
    if (role === 'admin') {
      return '/admin/dashboard';
    }
    return role === 'specialist' ? '/dashboard/specialist' : '/dashboard/entrepreneur';
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }).pipe(
      map(res => {
        const normalizedRole = (res.role || 'ENTREPRENEUR').toLowerCase();
        const user: User = {
          id: res.userId || res.id || 'unknown',
          email: email,
          role: normalizedRole,
          fullName: res.fullName || 'User',
          phone: res.phone || '',
          createdAt: res.createdAt || new Date().toISOString()
        };
        return {
          user,
          token: res.token
        } as AuthResponse;
      }),
      tap(authRes => {
        localStorage.setItem('nexus_token', authRes.token);
        localStorage.setItem('nexus_user', JSON.stringify(authRes.user));
        this.currentUserSubject.next(authRes.user);
      })
    );
  }

  registerEntrepreneur(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/entrepreneur`, data).pipe(
      map(res => {
        const normalizedRole = (res.role || 'ENTREPRENEUR').toLowerCase() as 'entrepreneur' | 'specialist';
        return {
          message: res.message,
          userId: res.userId,
          role: normalizedRole
        };
      })
    );
  }

  registerSpecialist(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/specialist`, data).pipe(
      map(res => {
        const normalizedRole = (res.role || 'SPECIALIST').toLowerCase() as 'entrepreneur' | 'specialist';
        return {
          message: res.message,
          userId: res.userId,
          role: normalizedRole
        };
      })
    );
  }

  getEntrepreneurProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/entrepreneurs/${userId}/profile`);
  }

  updateEntrepreneurProfile(userId: string, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/entrepreneurs/${userId}/profile`, data);
  }

  getSpecialistProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/specialists/${userId}/profile`);
  }

  updateSpecialistProfile(userId: string, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/specialists/${userId}/profile`, data);
  }

  logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    this.currentUserSubject.next(null);
  }
}
