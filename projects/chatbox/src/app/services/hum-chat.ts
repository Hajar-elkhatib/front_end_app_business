import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, map } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';
import { Conversation, ConversationMessage, SendMessageRequest } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class HumChat {

  private apiUrl = environment.apiUrl;
  private wsUrl = environment.wsUrl;

  private stompClient?: Client;
  private activeSubscription?: StompSubscription;
  private activeConversationId = '';
  private messageSubject = new Subject<ConversationMessage>();
  private connectedSubject = new BehaviorSubject<boolean>(false);

  private currentUserId = '';
  private currentUserRole = '';

  constructor(private http: HttpClient) {}

  setCurrentUser(userId: string, role: string) {
    this.currentUserId = userId;
    this.currentUserRole = this.normalizeRole(role);
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  getCurrentUserRole(): string {
    return this.currentUserRole;
  }

  connect(conversationId: string): void {
    this.activeConversationId = conversationId;

    if (this.stompClient?.active) {
      this.subscribeToConversation(conversationId);
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        this.connectedSubject.next(true);
        this.subscribeToConversation(this.activeConversationId);
      },
      onDisconnect: () => {
        this.connectedSubject.next(false);
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    this.activeSubscription?.unsubscribe();
    this.activeSubscription = undefined;
    this.activeConversationId = '';

    if (this.stompClient?.active) {
      void this.stompClient.deactivate();
    }
  }

  onMessage(): Observable<ConversationMessage> {
    return this.messageSubject.asObservable();
  }

  isConnected(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  sendMessageWS(request: SendMessageRequest): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(request)
      });
    }
  }

  getConversations(): Observable<Conversation[]> {
    if (this.currentUserRole === 'SPECIALIST') {
      return this.getConversationsBySpecialist(this.currentUserId);
    }

    return this.getConversationsByEntrepreneur(this.currentUserId);
  }

  getConversationsBySpecialist(specialistId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(
      `${this.apiUrl}/conversations/specialist/${specialistId}`
    ).pipe(map(conversations => conversations.map(conversation => this.mapConversation(conversation))));
  }

  getConversationsByEntrepreneur(entrepreneurId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(
      `${this.apiUrl}/conversations/entrepreneur/${entrepreneurId}`
    ).pipe(map(conversations => conversations.map(conversation => this.mapConversation(conversation))));
  }

  getMessages(conversationId: string): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>(
      `${this.apiUrl}/conversations/${conversationId}/messages`
    ).pipe(map(messages => messages.map(message => this.mapMessage(message))));
  }

  startConversation(
      entrepreneurId: string,
      specialistId: string,
      projectId?: string): Observable<Conversation> {
    let url = `${this.apiUrl}/conversations?entrepreneurId=${entrepreneurId}&specialistId=${specialistId}`;
    if (projectId) url += `&projectId=${projectId}`;
    return this.http.post<Conversation>(url, {}).pipe(
      map(conversation => this.mapConversation(conversation))
    );
  }

  private subscribeToConversation(conversationId: string): void {
    if (!conversationId || !this.stompClient?.connected) return;

    this.activeSubscription?.unsubscribe();
    this.activeSubscription = this.stompClient.subscribe(
      `/topic/conversation/${conversationId}`,
      (message: IMessage) => {
        this.messageSubject.next(this.mapMessage(JSON.parse(message.body)));
      }
    );
  }

  private mapConversation(conversation: Conversation): Conversation {
    const otherRole = this.currentUserRole === 'SPECIALIST' ? 'Entrepreneur' : 'Specialist';
    const otherId = this.currentUserRole === 'SPECIALIST'
      ? conversation.entrepreneurId
      : conversation.specialistId;

    return {
      ...conversation,
      name: conversation.name || `${otherRole} ${this.shortId(otherId)}`,
      avatarUrl: conversation.avatarUrl || otherRole.charAt(0),
      isOnline: conversation.isOnline ?? false,
      unreadCount: conversation.unreadCount ?? 0
    };
  }

  private mapMessage(message: ConversationMessage): ConversationMessage {
    const role = this.normalizeRole(message.role || message.senderType);

    return {
      ...message,
      role,
      senderType: this.normalizeRole(message.senderType || role),
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      senderId: role === this.currentUserRole ? 'current' : 'other',
      text: message.content,
      avatarUrl: role.charAt(0)
    };
  }

  private normalizeRole(role?: string): string {
    return (role || '').replace(/^ROLE_/i, '').toUpperCase();
  }

  private shortId(id?: string): string {
    return id ? id.slice(0, 8) : '';
  }
}
