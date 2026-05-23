import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/reports';
  private storageKey = 'nexus_local_reports';
  private reportsSubject = new BehaviorSubject<Report[]>([]);
  public reports$ = this.reportsSubject.asObservable();

  getReports(projectId?: string): Observable<Report[]> {
    const url = projectId ? `${this.baseUrl}?projectId=${projectId}` : this.baseUrl;
    return this.http.get<Report[]>(url).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after report list endpoints are available.
        const reports = this.readLocalReports();
        return of(projectId ? reports.filter(report => report.projectId === projectId) : reports);
      }),
      tap(reports => this.reportsSubject.next(reports))
    );
  }

  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after report detail endpoint is available.
        const report = this.readLocalReports().find(item => item.id === id);
        if (!report) {
          throw new Error('Report not found');
        }
        return of(report);
      })
    );
  }

  createReport(report: Omit<Report, 'id' | 'createdAt'>): Observable<Report> {
    return this.http.post<Report>(this.baseUrl, report).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after report creation endpoint is available.
        const newReport: Report = {
          ...report,
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        this.writeLocalReports([...this.readLocalReports(), newReport]);
        return of(newReport);
      }),
      tap(report => {
        const reports = this.reportsSubject.value;
        this.reportsSubject.next([...reports, report]);
      })
    );
  }

  updateReport(id: string, data: Partial<Report>): Observable<Report> {
    return this.http.put<Report>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after report update endpoint is available.
        const reports = this.readLocalReports();
        const existing = reports.find(report => report.id === id);
        if (!existing) {
          throw new Error('Report not found');
        }
        const updated = { ...existing, ...data, id };
        this.writeLocalReports(reports.map(report => report.id === id ? updated : report));
        return of(updated);
      }),
      tap(updated => {
        const reports = this.reportsSubject.value.map(r => r.id === id ? updated : r);
        this.reportsSubject.next(reports);
      })
    );
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after report delete endpoint is available.
        this.writeLocalReports(this.readLocalReports().filter(report => report.id !== id));
        return of(undefined);
      }),
      tap(() => {
        const reports = this.reportsSubject.value.filter(r => r.id !== id);
        this.reportsSubject.next(reports);
      })
    );
  }

  private readLocalReports(): Report[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]') as Report[];
    } catch {
      return [];
    }
  }

  private writeLocalReports(reports: Report[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(reports));
  }
}
