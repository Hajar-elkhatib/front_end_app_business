import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Report } from '../models/report.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reports`;
  private projectsUrl = `${environment.apiUrl}/projects`;
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

  generateProjectReport(projectId: string): Observable<Report> {
    return this.http.post<Report>(`${this.projectsUrl}/${projectId}/reports/generate`, {}).pipe(
      tap(created => this.reportsSubject.next([created, ...this.reportsSubject.value]))
    );
  }

  downloadReport(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.reportsSubject.next(this.reportsSubject.value.filter(report => report.id !== id)))
    );
  }
}


