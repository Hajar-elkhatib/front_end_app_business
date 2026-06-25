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
        if (response && response.token) {
          localStorage.setItem('nexus_token', response.token);
          const user = this.mapLoginResponseToUser(response, email);
          localStorage.setItem('nexus_user', JSON.stringify(user));
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
    return {
      id: response.userId,
      fullName: response.fullName,
      email: response.email || email,
      role: this.normalizeRole(response.role),
      phone: '',
      createdAt: ''
    };
  }

  private normalizeUser(user: User): User {
    return {
      ...user,
      role: this.normalizeRole(user.role)
    };
  }

  private normalizeRole(role?: string): string {
    return (role || '').replace(/^ROLE_/i, '').toLowerCase();
  }
}
