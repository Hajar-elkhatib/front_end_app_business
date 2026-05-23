import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Chat, Conversation, ChatMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/chat';
  private aiAssistantBaseUrl = 'http://localhost:8080/api/chats';
  private chatStorageKey = 'nexus_local_ai_chats';
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  getAiChats(projectId?: string): Observable<Chat[]> {
    const url = projectId ? `${this.aiAssistantBaseUrl}?projectId=${projectId}` : this.aiAssistantBaseUrl;
    return this.http.get<Chat[]>(url).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after chatbot/RAG chat list endpoint is available.
        const chats = this.readLocalChats();
        return of(projectId ? chats.filter(chat => chat.projectId === projectId) : chats);
      })
    );
  }

  getAiChatById(id: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.aiAssistantBaseUrl}/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after chatbot/RAG chat detail endpoint is available.
        const chat = this.readLocalChats().find(item => item.id === id);
        if (!chat) {
          throw new Error('AI chat not found');
        }
        return of(chat);
      })
    );
  }

  createAiChat(chat: Omit<Chat, 'id' | 'createdAt'>): Observable<Chat> {
    return this.http.post<Chat>(this.aiAssistantBaseUrl, chat).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after chatbot/RAG chat creation endpoint is available.
        const newChat: Chat = {
          ...chat,
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        this.writeLocalChats([...this.readLocalChats(), newChat]);
        return of(newChat);
      })
    );
  }

  updateAiChat(id: string, data: Partial<Chat>): Observable<Chat> {
    return this.http.put<Chat>(`${this.aiAssistantBaseUrl}/${id}`, data).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after chatbot/RAG chat update endpoint is available.
        const chats = this.readLocalChats();
        const existing = chats.find(chat => chat.id === id);
        if (!existing) {
          throw new Error('AI chat not found');
        }
        const updated = { ...existing, ...data, id };
        this.writeLocalChats(chats.map(chat => chat.id === id ? updated : chat));
        return of(updated);
      })
    );
  }

  deleteAiChat(id: string): Observable<void> {
    return this.http.delete<void>(`${this.aiAssistantBaseUrl}/${id}`).pipe(
      catchError(() => {
        // TODO backend: remove local fallback after chatbot/RAG chat delete endpoint is available.
        this.writeLocalChats(this.readLocalChats().filter(chat => chat.id !== id));
        return of(undefined);
      })
    );
  }

  getConversations(): Observable<Conversation[]> {
    // TODO backend: expose conversation endpoints for entrepreneurs and specialists.
    return this.http.get<Conversation[]>(`${this.baseUrl}/conversations`).pipe(
      catchError(() => of([])),
      tap(conversations => this.conversationsSubject.next(conversations))
    );
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    // TODO backend: expose messages for a conversation.
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/conversations/${conversationId}/messages`).pipe(
      catchError(() => of([])),
      tap(messages => this.messagesSubject.next(messages))
    );
  }

  sendMessage(conversationId: string, text: string): Observable<ChatMessage> {
    const payload = { text };
    return this.http.post<ChatMessage>(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      payload
    ).pipe(
      tap(message => {
        const messages = this.messagesSubject.value;
        this.messagesSubject.next([...messages, message]);
      })
    );
  }

  createConversation(participantIds: string[]): Observable<Conversation> {
    const payload = { participantIds };
    return this.http.post<Conversation>(`${this.baseUrl}/conversations`, payload).pipe(
      tap(conversation => {
        const conversations = this.conversationsSubject.value;
        this.conversationsSubject.next([...conversations, conversation]);
      })
    );
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.baseUrl}/conversations/${conversationId}`);
  }

  markAsRead(conversationId: string): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.baseUrl}/conversations/${conversationId}/mark-read`,
      {}
    ).pipe(
      tap(conversation => {
        const conversations = this.conversationsSubject.value.map(c =>
          c.id === conversation.id ? conversation : c
        );
        this.conversationsSubject.next(conversations);
      })
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/conversations/${conversationId}`).pipe(
      tap(() => {
        const conversations = this.conversationsSubject.value.filter(c => c.id !== conversationId);
        this.conversationsSubject.next(conversations);
      })
    );
  }

  private readLocalChats(): Chat[] {
    try {
      return JSON.parse(localStorage.getItem(this.chatStorageKey) || '[]') as Chat[];
    } catch {
      return [];
    }
  }

  private writeLocalChats(chats: Chat[]) {
    localStorage.setItem(this.chatStorageKey, JSON.stringify(chats));
  }
}
