import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface AdminCollection {
  name: string;
  documentCount: number;
}

export type AdminDocument = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/admin';

  getCollections(): Observable<AdminCollection[]> {
    return this.http.get<AdminCollection[]>(`${this.baseUrl}/collections`);
  }

  getDocuments(collection: string, limit = 100): Observable<AdminDocument[]> {
    return this.http.get<AdminDocument[]>(
      `${this.baseUrl}/collections/${encodeURIComponent(collection)}/documents`,
      { params: { limit } }
    );
  }

  deleteDocument(collection: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/collections/${encodeURIComponent(collection)}/documents/${encodeURIComponent(id)}`
    );
  }
}
