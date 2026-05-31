import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/reports';
  private projectsUrl = 'http://localhost:8080/api/projects';
  private reportsSubject = new BehaviorSubject<Report[]>([]);
  public reports$ = this.reportsSubject.asObservable();

  getReports(projectId?: string): Observable<Report[]> {
    const url = projectId ? `${this.baseUrl}/project/${projectId}` : this.baseUrl;
    return this.http.get<Report[]>(url).pipe(
      tap(reports => this.reportsSubject.next(reports))
    );
  }

  getLatestReport(projectId: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/project/${projectId}/latest`);
  }

  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/${id}`);
  }

  createReport(report: Partial<Report>): Observable<Report> {
    const payload = {
      projectId: report.projectId || '',
      title: report.title || '',
      summary: report.summary || '',
      reportType: report.reportType || 'AI_GENERATED',
      region: (report as any).region || '',
      modelVersion: report.modelVersion || ''
    };
    return this.http.post<Report>(this.baseUrl, payload).pipe(
      tap(created => this.reportsSubject.next([created, ...this.reportsSubject.value]))
    );
  }

  generateProjectReport(projectId: string): Observable<Report> {
    return this.http.post<Report>(`${this.projectsUrl}/${projectId}/reports/generate`, {}).pipe(
      tap(created => this.reportsSubject.next([created, ...this.reportsSubject.value]))
    );
  }

  downloadReport(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }

  updateReport(id: string, data: Partial<Report>): Observable<Report> {
    return throwError(() => new Error('Reports cannot be updated right now.'));
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.reportsSubject.next(this.reportsSubject.value.filter(report => report.id !== id)))
    );
  }
}
