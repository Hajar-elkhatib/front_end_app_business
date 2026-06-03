import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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
    const savedUser = localStorage.getItem('nexus_user');
    const savedToken = localStorage.getItem('nexus_token');
    if (savedUser && savedToken) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  public get userRole(): string {
    return this.currentUser?.role || '';
  }

  getDashboardRoute(): string {
    const role = this.userRole.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'specialist') return '/specialist/dashboard';
    return '/entrepreneur/dashboard';
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('nexus_token', response.token);
          localStorage.setItem('nexus_user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
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
}
