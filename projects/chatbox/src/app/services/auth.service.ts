import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, AuthResponse, LoginResponse } from '../models/user.model';
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
    const savedUser = localStorage.getItem('nexus_user');
    const savedToken = localStorage.getItem('nexus_token');
    if (savedUser && savedToken) {
      this.currentUserSubject.next(this.normalizeUser(JSON.parse(savedUser)));
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  public get userRole(): string {
    return this.normalizeRole(this.currentUser?.role);
  }

  getDashboardRoute(): string {
    const role = this.userRole;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'specialist') return '/dashboard/specialist';
    return '/dashboard/entrepreneur';
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(response => {
        const payload = this.unwrapLoginResponse(response);
        if (payload && payload.token) {
          localStorage.setItem('nexus_token', payload.token);
          const user = this.mapLoginResponseToUser(payload, email);
          localStorage.setItem('nexus_user', JSON.stringify(user));
          this.persistSpecialistIdentity(payload);
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  registerEntrepreneur(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/entrepreneur`, data);
  }

  registerSpecialist(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/specialist`, data);
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

  private mapLoginResponseToUser(response: LoginResponse, email: string): User {
    const responseUser = response.user || {};
    return {
      id: String(response.userId || response.id || responseUser.id || responseUser.userId || ''),
      fullName: String(response.fullName || response.name || responseUser.fullName || email),
      email: String(response.email || responseUser.email || email),
      role: this.normalizeRole(response.role || response.userRole || response.roles || responseUser.role || responseUser.userRole || responseUser.roles),
      phone: responseUser.phone || '',
      createdAt: responseUser.createdAt || ''
    };
  }

  private normalizeUser(user: User): User {
    return {
      ...user,
      role: this.normalizeRole(user.role)
    };
  }

  private normalizeRole(role?: string | string[]): string {
    const rawRole = Array.isArray(role) ? role[0] : role;
    const normalized = String(rawRole || '').replace(/^ROLE_/i, '').toLowerCase();
    if (normalized.includes('specialist')) return 'specialist';
    if (normalized.includes('entrepreneur')) return 'entrepreneur';
    if (normalized.includes('admin')) return 'admin';
    return normalized;
  }

  private unwrapLoginResponse(response: LoginResponse | { data?: LoginResponse } | null | undefined): LoginResponse {
    if (!response) {
      return {} as LoginResponse;
    }

    return (response as { data?: LoginResponse }).data || (response as LoginResponse);
  }

  private persistSpecialistIdentity(response: LoginResponse): void {
    const responseUser = response.user || {};
    const specialistId = response.specialistId || response.mongoId || responseUser.specialistId || responseUser.mongoId;

    if (specialistId) {
      localStorage.setItem('specialistId', String(specialistId));
    }
  }
}
