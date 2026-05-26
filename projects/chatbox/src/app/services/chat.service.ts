import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Chat, ChatMessage, Conversation } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private chatbotBaseUrl = 'http://localhost:8080/api/chatbot';
  private conversationBaseUrl = 'http://localhost:8080/api/chat';
  private aiChatsStorageKey = 'nexus_local_ai_assistant_chats';
  private aiMessagesStorageKey = 'nexus_local_ai_assistant_messages';

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  getAiChats(projectId?: string): Observable<Chat[]> {
    const userId = this.currentUserId();
    let params = new HttpParams().set('userId', userId);
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<Chat[]>(this.chatbotBaseUrl, { params });
  }

  getAiChatById(id: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.chatbotBaseUrl}/chat/${id}`);
  }

  createAiChat(chat: Omit<Chat, 'id' | 'createdAt'> & { id?: string }): Observable<Chat> {
    return this.http.post<Chat>(this.chatbotBaseUrl, chat);
  }

  updateAiChat(id: string, data: Partial<Chat>): Observable<Chat> {
    return this.http.post<Chat>(this.chatbotBaseUrl, { ...data, id });
  }

  deleteAiChat(id: string): Observable<void> {
    const allMessages = this.readLocalAiMessages();
    delete allMessages[id];
    this.writeLocalAiMessages(allMessages);
    const params = new HttpParams().set('userId', this.currentUserId());
    return this.http.delete<void>(`${this.chatbotBaseUrl}/${id}`, { params });
  }

  getAiMessages(chatId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.chatbotBaseUrl}/${chatId}/messages`).pipe(
      tap(messages => this.messagesSubject.next(messages))
    );
  }

  sendAiMessage(chatId: string, userId: string, message: string): Observable<ChatMessage> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('message', message);
    return this.http.post<ChatMessage>(`${this.chatbotBaseUrl}/${chatId}/message`, {}, { params });
  }

  getLocalAiMessages(chatId: string): ChatMessage[] {
    return this.readLocalAiMessages()[chatId] || [];
  }

  saveLocalAiMessages(chatId: string, messages: ChatMessage[]) {
    const allMessages = this.readLocalAiMessages();
    allMessages[chatId] = messages;
    this.writeLocalAiMessages(allMessages);
  }

  checkAiRequestStatus(requestId: string): Observable<string> {
    return this.http.get(`${this.chatbotBaseUrl}/status/${requestId}`, { responseType: 'text' });
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.conversationBaseUrl}/conversations`).pipe(
      tap(conversations => this.conversationsSubject.next(conversations))
    );
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.conversationBaseUrl}/conversations/${conversationId}/messages`).pipe(
      tap(messages => this.messagesSubject.next(messages))
    );
  }

  sendMessage(conversationId: string, text: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.conversationBaseUrl}/conversations/${conversationId}/messages`,
      { text }
    );
  }

  createConversation(participantIds: string[]): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.conversationBaseUrl}/conversations`, { participantIds });
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.conversationBaseUrl}/conversations/${conversationId}`);
  }

  markAsRead(conversationId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.conversationBaseUrl}/conversations/${conversationId}/mark-read`, {});
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.conversationBaseUrl}/conversations/${conversationId}`);
  }

  private readLocalAiMessages(): Record<string, ChatMessage[]> {
    try {
      return JSON.parse(localStorage.getItem(this.aiMessagesStorageKey) || '{}') as Record<string, ChatMessage[]>;
    } catch {
      return {};
    }
  }

  private writeLocalAiMessages(messages: Record<string, ChatMessage[]>) {
    localStorage.setItem(this.aiMessagesStorageKey, JSON.stringify(messages));
  }

  private currentUserId(): string {
    const rawUser = localStorage.getItem('nexus_user');
    if (!rawUser) return '';
    try {
      return JSON.parse(rawUser)?.id || '';
    } catch {
      return '';
    }
  }
}
