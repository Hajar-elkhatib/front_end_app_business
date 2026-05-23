import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Availability } from '../models/specialist.model';
import { Complaint, ComplaintStatus, ComplaintType } from '../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/availability';

  getAvailability(specialistId: string): Observable<Availability> {
    return this.http.get<Availability>(`${this.baseUrl}/${specialistId}`);
  }

  updateAvailability(specialistId: string, data: Partial<Availability>): Observable<Availability> {
    return this.http.put<Availability>(`${this.baseUrl}/${specialistId}`, data);
  }

  setAvailable(specialistId: string): Observable<Availability> {
    return this.http.post<Availability>(`${this.baseUrl}/${specialistId}/available`, {});
  }

  setUnavailable(specialistId: string, endDate?: string): Observable<Availability> {
    return this.http.post<Availability>(
      `${this.baseUrl}/${specialistId}/unavailable`,
      { endDate }
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/complaints';
  private storageKey = 'nexus_local_complaints';
  private complaintsSubject = new BehaviorSubject<Complaint[]>([]);
  public complaints$ = this.complaintsSubject.asObservable();

  getComplaints(status?: ComplaintStatus): Observable<Complaint[]> {
    let url = this.baseUrl;
    if (status) url += `?status=${status}`;

    return this.http.get<Complaint[]>(url).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after complaint endpoints are available.
        const complaints = this.readLocalComplaints();
        return of(status ? complaints.filter(complaint => complaint.status === status) : complaints);
      }),
      tap(complaints => this.complaintsSubject.next(complaints))
    );
  }

  getComplaintById(id: string): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after complaint detail endpoint is available.
        const complaint = this.readLocalComplaints().find(item => item.id === id);
        if (!complaint) {
          throw new Error('Complaint not found');
        }
        return of(complaint);
      })
    );
  }

  getUserComplaints(userId: string): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.baseUrl}?complainantId=${userId}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after user complaint endpoint is available.
        return of(this.readLocalComplaints().filter(complaint => complaint.userId === userId));
      }),
      tap(complaints => this.complaintsSubject.next(complaints))
    );
  }

  createComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Observable<Complaint> {
    return this.http.post<Complaint>(this.baseUrl, complaint).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after complaint creation endpoint is available.
        const newComplaint: Complaint = {
          ...complaint,
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          status: 'Pending',
          aiSuggestedResponse: complaint.aiSuggestedResponse || '',
          createdAt: new Date().toISOString()
        };
        const complaints = [...this.readLocalComplaints(), newComplaint];
        this.writeLocalComplaints(complaints);
        return of(newComplaint);
      }),
      tap(newComplaint => {
        const complaints = this.complaintsSubject.value;
        this.complaintsSubject.next([...complaints, newComplaint]);
      })
    );
  }

  updateComplaint(id: string, data: Partial<Complaint>): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after complaint update endpoint is available.
        const complaints = this.readLocalComplaints();
        const existing = complaints.find(complaint => complaint.id === id);
        if (!existing) {
          throw new Error('Complaint not found');
        }
        const updated = { ...existing, ...data, id };
        this.writeLocalComplaints(complaints.map(complaint => complaint.id === id ? updated : complaint));
        return of(updated);
      }),
      tap(updated => {
        const complaints = this.complaintsSubject.value.map(complaint =>
          complaint.id === id ? updated : complaint
        );
        this.complaintsSubject.next(complaints);
      })
    );
  }

  deleteComplaint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after complaint delete endpoint is available.
        this.writeLocalComplaints(this.readLocalComplaints().filter(complaint => complaint.id !== id));
        return of(undefined);
      }),
      tap(() => {
        this.complaintsSubject.next(this.complaintsSubject.value.filter(complaint => complaint.id !== id));
      })
    );
  }

  updateComplaintStatus(id: string, status: ComplaintStatus, resolution?: string): Observable<Complaint> {
    return this.http.patch<Complaint>(
      `${this.baseUrl}/${id}/status`,
      { status, resolution }
    ).pipe(
      tap(updated => {
        const complaints = this.complaintsSubject.value.map(c => c.id === id ? updated : c);
        this.complaintsSubject.next(complaints);
      })
    );
  }

  escalateComplaint(id: string, reason: string): Observable<Complaint> {
    return this.http.post<Complaint>(
      `${this.baseUrl}/${id}/escalate`,
      { reason }
    );
  }

  resolveComplaint(id: string, resolution: string): Observable<Complaint> {
    return this.http.post<Complaint>(
      `${this.baseUrl}/${id}/resolve`,
      { resolution }
    );
  }

  dismissComplaint(id: string, reason: string): Observable<Complaint> {
    return this.http.post<Complaint>(
      `${this.baseUrl}/${id}/dismiss`,
      { reason }
    );
  }

  private readLocalComplaints(): Complaint[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]') as Complaint[];
    } catch {
      return [];
    }
  }

  private writeLocalComplaints(complaints: Complaint[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(complaints));
  }
}
