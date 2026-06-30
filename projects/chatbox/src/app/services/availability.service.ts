import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Availability } from '../models/specialist.model';

export interface CreateAvailabilityPayload {
  specialistId: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  maxSessions: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/availability`;

  addSlot(payload: CreateAvailabilityPayload): Observable<Availability> {
    const body = {
      ...payload,
      availableDate: this.toBackendDate(payload.availableDate)
    };

    return this.http.post<Availability>(this.baseUrl, body).pipe(
      map(slot => this.normalizeSlot(slot))
    );
  }

  getBySpecialist(specialistId: string): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}`).pipe(
      map(slots => slots.map(slot => this.normalizeSlot(slot)))
    );
  }

  getOpenBySpecialist(specialistId: string): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.baseUrl}/specialist/${encodeURIComponent(specialistId)}/open`).pipe(
      map(slots => slots.map(slot => this.normalizeSlot(slot)))
    );
  }

  cancelSlot(id: string): Observable<Availability> {
    return this.http.put<Availability>(`${this.baseUrl}/${encodeURIComponent(id)}/cancel`, {}).pipe(
      map(slot => this.normalizeSlot(slot))
    );
  }

  deleteSlot(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${encodeURIComponent(id)}`, { responseType: 'text' });
  }

  private toBackendDate(value: string): number | string {
    const [year, month, day] = String(value || '').split('-').map(Number);
    if ([year, month, day].some(part => Number.isNaN(part))) {
      return value;
    }

    // Keep the selected calendar day stable when the backend stores dates with timezones.
    return Date.UTC(year, month - 1, day, 12, 0, 0);
  }

  private normalizeSlot(slot: Availability): Availability {
    return {
      ...slot,
      id: String(slot.id || ''),
      specialistId: String(slot.specialistId || ''),
      status: slot.status || 'OPEN',
      maxSessions: Number(slot.maxSessions || 0),
      currentSessions: Number(slot.currentSessions || 0)
    };
  }
}
