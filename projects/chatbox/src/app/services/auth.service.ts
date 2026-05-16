import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
    return role === 'specialist' ? '/dashboard/specialist' : '/dashboard/entrepreneur';
  }

  login(email: string, password: string, role: 'entrepreneur' | 'specialist' = 'entrepreneur'): Observable<AuthResponse> {
    // Mock API call — in production, the backend returns the role from JWT
    return of({
      user: { id: '1', email, role, fullName: 'Demo User' } as User,
      token: 'mock-jwt-token'
    }).pipe(
      delay(800),
      tap(res => {
        localStorage.setItem('nexus_token', res.token);
        localStorage.setItem('nexus_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: { fullName: string; email: string; password: string; role: 'entrepreneur' | 'specialist' }): Observable<AuthResponse> {
    return of({
      user: { id: '2', email: data.email, role: data.role, fullName: data.fullName } as User,
      token: 'mock-jwt-token-new'
    }).pipe(
      delay(800),
      tap(res => {
        localStorage.setItem('nexus_token', res.token);
        localStorage.setItem('nexus_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    this.currentUserSubject.next(null);
  }
}
