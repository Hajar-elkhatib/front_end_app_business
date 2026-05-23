import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { KnowledgeDocument, DocumentType, DocumentStatus } from '../models/knowledge-document.model';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeDocumentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/documents';
  private documentsSubject = new BehaviorSubject<KnowledgeDocument[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  getDocuments(filters?: any): Observable<KnowledgeDocument[]> {
    let url = this.baseUrl;
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      if (params.toString()) url += '?' + params.toString();
    }

    return this.http.get<KnowledgeDocument[]>(url).pipe(
      tap(docs => this.documentsSubject.next(docs))
    );
  }

  getDocumentById(id: string): Observable<KnowledgeDocument> {
    return this.http.get<KnowledgeDocument>(`${this.baseUrl}/${id}`).pipe(
      tap(doc => this.trackView(doc.id))
    );
  }

  searchDocuments(query: string, type?: DocumentType, tags?: string[]): Observable<KnowledgeDocument[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);
    if (tags && tags.length > 0) params.append('tags', tags.join(','));

    return this.http.get<KnowledgeDocument[]>(
      `${this.baseUrl}/search?${params.toString()}`
    );
  }

  createDocument(document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(this.baseUrl, document).pipe(
      tap(newDoc => {
        const docs = this.documentsSubject.value;
        this.documentsSubject.next([...docs, newDoc]);
      })
    );
  }

  updateDocument(id: string, data: Partial<KnowledgeDocument>): Observable<KnowledgeDocument> {
    return this.http.patch<KnowledgeDocument>(`${this.baseUrl}/${id}`, data).pipe(
      tap(updated => {
        const docs = this.documentsSubject.value.map(d => d.id === id ? updated : d);
        this.documentsSubject.next(docs);
      })
    );
  }

  publishDocument(id: string): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.baseUrl}/${id}/publish`, {});
  }

  archiveDocument(id: string): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.baseUrl}/${id}/archive`, {});
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const docs = this.documentsSubject.value.filter(d => d.id !== id);
        this.documentsSubject.next(docs);
      })
    );
  }

  likeDocument(id: string): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.baseUrl}/${id}/like`, {});
  }

  unlikeDocument(id: string): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.baseUrl}/${id}/unlike`, {});
  }

  private trackView(documentId: string): void {
    this.http.post(`${this.baseUrl}/${documentId}/view`, {}).subscribe(
      () => {},
      error => console.error('Failed to track view:', error)
    );
  }

  getPopularDocuments(limit: number = 10): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.baseUrl}/popular?limit=${limit}`);
  }

  getRelatedDocuments(documentId: string, limit: number = 5): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(
      `${this.baseUrl}/${documentId}/related?limit=${limit}`
    );
  }
}