import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, catchError, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';
import { Conversation, ConversationMessage, SendMessageRequest } from '../models/chat.model';
import { SpecialistService } from './specialist.service';
import { AuthService } from './auth.service';

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
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private conversationRefreshTimer?: ReturnType<typeof setInterval>;
  private isRefreshingConversations = false;

  private currentUserId = '';
  private currentUserRole = '';
  private specialistNameCache = new Map<string, string>();
  private entrepreneurNameCache = new Map<string, string>();

  readonly conversations$ = this.conversationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private specialistService: SpecialistService,
    private authService: AuthService
  ) {}

  setCurrentUser(userId: string, role: string) {
    this.currentUserId = userId;
    this.currentUserRole = this.normalizeRole(role);
    if (!this.currentUserId || !this.currentUserRole) {
      this.stopConversationRefresh();
      this.conversationsSubject.next([]);
      return;
    }

    this.ensureConversationRefresh();
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
      onStompError: (frame: IFrame) => {
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

  clearUnreadCountLocally(conversationId: string): void {
    if (!conversationId) return;

    const currentConversation = this.conversationsSubject.value.find(conversation => conversation.id === conversationId);
    this.setSeenTimestamp(conversationId, currentConversation?.lastMessage?.timestamp || Date.now());

    this.conversationsSubject.next(
      this.sortConversations(
        this.conversationsSubject.value.map(conversation =>
          conversation.id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      )
    );
  }

  markConversationAsRead(conversationId: string): Observable<Conversation | null> {
    if (!conversationId) {
      return of(null);
    }

    this.clearUnreadCountLocally(conversationId);
    return of(this.conversationsSubject.value.find(conversation => conversation.id === conversationId) || null);
  }

  sendMessageWS(request: SendMessageRequest): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(request)
      });
    }
  }

  sendMessage(request: SendMessageRequest): Observable<ConversationMessage> {
    return new Observable<ConversationMessage>(subscriber => {
      if (!this.stompClient?.connected) {
        subscriber.error(new Error('Chat is not connected.'));
        return;
      }

      const role = this.normalizeRole(request.role || request.senderType);
      const subscription = this.onMessage().subscribe({
        next: message => {
          const messageRole = this.normalizeRole(message.role || message.senderType);
          if (message.conversationId !== request.conversationId) return;
          if (messageRole !== role) return;
          if ((message.content || message.text) !== request.content) return;

          subscriber.next(message);
          subscriber.complete();
        },
        error: error => subscriber.error(error)
      });

      this.sendMessageWS(request);

      return () => subscription.unsubscribe();
    });
  }

  getConversations(): Observable<Conversation[]> {
    if (!this.currentUserId) {
      return of([]);
    }

    this.ensureConversationRefresh();

    if (this.currentUserRole === 'SPECIALIST') {
      return this.fetchConversationsBySpecialist(this.currentUserId);
    }

    if (this.currentUserRole === 'ENTREPRENEUR') {
      return this.fetchConversationsByEntrepreneur(this.currentUserId);
    }

    return of([]);
  }

  getConversationsBySpecialist(specialistId: string): Observable<Conversation[]> {
    this.currentUserId = specialistId || this.currentUserId;
    this.currentUserRole = 'SPECIALIST';
    this.ensureConversationRefresh();
    return this.fetchConversationsBySpecialist(specialistId);
  }

  getConversationsByEntrepreneur(entrepreneurId: string): Observable<Conversation[]> {
    this.currentUserId = entrepreneurId || this.currentUserId;
    this.currentUserRole = 'ENTREPRENEUR';
    this.ensureConversationRefresh();
    return this.fetchConversationsByEntrepreneur(entrepreneurId);
  }

  private fetchConversationsBySpecialist(specialistId: string): Observable<Conversation[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/conversations/specialist/${specialistId}`
    ).pipe(
      switchMap(conversations => this.enrichConversationList(conversations))
    );
  }

  private fetchConversationsByEntrepreneur(entrepreneurId: string): Observable<Conversation[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/conversations/entrepreneur/${entrepreneurId}`
    ).pipe(
      switchMap(conversations => this.enrichConversationList(conversations))
    );
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
    const params = [
      `entrepreneurId=${encodeURIComponent(entrepreneurId)}`,
      `specialistId=${encodeURIComponent(specialistId)}`
    ];

    if (projectId) {
      params.push(`projectId=${encodeURIComponent(projectId)}`);
    }

    return this.http.post<any>(`${this.apiUrl}/conversations?${params.join('&')}`, null).pipe(
      switchMap(conversation => this.enrichConversationList([conversation])),
      map(conversations => conversations[0])
    );
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.getConversations().pipe(
      map(conversations => {
        const conversation = conversations.find(item => item.id === conversationId);
        if (!conversation) {
          throw new Error('Conversation not found.');
        }

        return conversation;
      })
    );
  }

  private subscribeToConversation(conversationId: string): void {
    if (!conversationId || !this.stompClient?.connected) return;

    this.activeSubscription?.unsubscribe();
    this.activeSubscription = this.stompClient.subscribe(
      `/topic/conversation/${conversationId}`,
      (message: IMessage) => {
        const mappedMessage = this.mapMessage(JSON.parse(message.body));
        this.applyConversationActivity(mappedMessage);
        this.messageSubject.next(mappedMessage);
      }
    );
  }

  private enrichConversationList(rawConversations: any[]): Observable<Conversation[]> {
    if (!rawConversations.length) {
      this.conversationsSubject.next([]);
      return of([]);
    }

    const baseConversations = rawConversations.map(conversation => this.mapConversation(conversation));
    const enrichedConversations$ = baseConversations.map(conversation =>
      this.resolveConversationName(conversation).pipe(
        map(name => {
          const resolvedName = name || conversation.name;
          return {
            ...conversation,
            name: resolvedName,
            avatarUrl: this.getAvatarLetter(resolvedName, conversation.avatarUrl)
          };
        })
      )
    );

    return forkJoin(enrichedConversations$).pipe(
      switchMap(conversations => this.decorateConversationsWithMessageState(conversations)),
      map(conversations => this.sortConversations(conversations)),
      tap(conversations => this.conversationsSubject.next(conversations))
    );
  }

  private ensureConversationRefresh(): void {
    if (!this.currentUserId || !this.currentUserRole || this.conversationRefreshTimer) {
      return;
    }

    this.conversationRefreshTimer = window.setInterval(() => {
      this.refreshConversationsSilently();
    }, 5000);
  }

  private stopConversationRefresh(): void {
    if (this.conversationRefreshTimer) {
      window.clearInterval(this.conversationRefreshTimer);
      this.conversationRefreshTimer = undefined;
    }
    this.isRefreshingConversations = false;
  }

  private refreshConversationsSilently(): void {
    if (this.isRefreshingConversations || !this.currentUserId || !this.currentUserRole) {
      return;
    }

    this.isRefreshingConversations = true;
    this.getConversations().pipe(
      finalize(() => {
        this.isRefreshingConversations = false;
      })
    ).subscribe({
      error: () => undefined
    });
  }

  private applyConversationActivity(message: ConversationMessage): void {
    const conversationIndex = this.conversationsSubject.value.findIndex(
      conversation => conversation.id === message.conversationId
    );

    if (conversationIndex === -1) {
      this.refreshConversationsSilently();
      return;
    }

    const currentConversation = this.conversationsSubject.value[conversationIndex];
    const isCurrentUserMessage = this.normalizeRole(message.role || message.senderType) === this.currentUserRole;
    const isActiveConversation = message.conversationId === this.activeConversationId;
    const unreadCount = !isCurrentUserMessage && !isActiveConversation
      ? Number(currentConversation.unreadCount || 0) + 1
      : 0;
    if (isActiveConversation || isCurrentUserMessage) {
      this.setSeenTimestamp(message.conversationId, message.timestamp);
    }

    const updatedConversation: Conversation = {
      ...currentConversation,
      lastMessage: {
        text: message.content || message.text || '',
        timestamp: message.timestamp
      },
      unreadCount
    };

    const remainingConversations = this.conversationsSubject.value.filter(
      conversation => conversation.id !== message.conversationId
    );

    this.conversationsSubject.next(this.sortConversations([updatedConversation, ...remainingConversations]));
  }

  private decorateConversationsWithMessageState(conversations: Conversation[]): Observable<Conversation[]> {
    if (!conversations.length) {
      return of([]);
    }

    const requests = conversations.map(conversation =>
      this.getMessages(conversation.id).pipe(
        map(messages => this.applyMessageStateToConversation(conversation, messages)),
        catchError(() => of(conversation))
      )
    );

    return forkJoin(requests);
  }

  private applyMessageStateToConversation(conversation: Conversation, messages: ConversationMessage[]): Conversation {
    if (!messages.length) {
      return {
        ...conversation,
        unreadCount: 0
      };
    }

    const sortedMessages = [...messages].sort((left, right) => this.toTimestamp(left.timestamp) - this.toTimestamp(right.timestamp));
    const latestMessage = sortedMessages[sortedMessages.length - 1];
    const seenTimestamp = this.getSeenTimestamp(conversation.id);
    const unreadCount = sortedMessages.filter(message => this.isUnreadForCurrentUser(message, seenTimestamp)).length;

    return {
      ...conversation,
      lastMessage: {
        text: latestMessage.content || latestMessage.text || conversation.lastMessage?.text || '',
        timestamp: latestMessage.timestamp
      },
      unreadCount
    };
  }

  private isUnreadForCurrentUser(message: ConversationMessage, seenTimestamp: number): boolean {
    const messageRole = this.normalizeRole(message.role || message.senderType);
    return messageRole !== this.currentUserRole && this.toTimestamp(message.timestamp) > seenTimestamp;
  }

  private sortConversations(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((left, right) => this.conversationTimestamp(right) - this.conversationTimestamp(left));
  }

  private conversationTimestamp(conversation: Conversation & Record<string, any>): number {
    const candidate = conversation.lastMessage?.timestamp
      || conversation['lastMessageAt']
      || conversation['updatedAt']
      || conversation.createdAt;

    return this.toTimestamp(candidate);
  }

  private mapConversation(conversation: any): Conversation {
    const otherRole = this.currentUserRole === 'SPECIALIST' ? 'Entrepreneur' : 'Specialist';
    const otherId = this.currentUserRole === 'SPECIALIST'
      ? conversation.entrepreneurId
      : conversation.specialistId;
    const explicitName = this.extractExplicitConversationName(conversation);
    const lastMessage = typeof conversation.lastMessage === 'string'
      ? { text: conversation.lastMessage, timestamp: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt }
      : conversation.lastMessage;

    return {
      ...conversation,
      name: explicitName || conversation.name || `${otherRole} ${this.shortId(otherId)}`,
      avatarUrl: conversation.avatarUrl || otherRole.charAt(0),
      isOnline: conversation.isOnline ?? false,
      unreadCount: conversation.unreadCount ?? 0,
      lastMessage
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

  private resolveConversationName(conversation: Conversation & Record<string, any>): Observable<string> {
    const explicitName = this.extractExplicitConversationName(conversation);
    if (explicitName) {
      return of(explicitName);
    }

    if (this.currentUserRole === 'SPECIALIST') {
      return this.resolveEntrepreneurName(String(conversation.entrepreneurId || ''));
    }

    return this.resolveSpecialistName(String(conversation.specialistId || ''));
  }

  private resolveSpecialistName(specialistId: string): Observable<string> {
    if (!specialistId) {
      return of('Specialist');
    }

    const cachedName = this.specialistNameCache.get(specialistId);
    if (cachedName) {
      return of(cachedName);
    }

    return this.specialistService.getAllSpecialists().pipe(
      map(specialists => specialists.find(specialist =>
        [specialist.mongoId, specialist.specialistId, specialist.userId, specialist.id]
          .map(value => String(value || ''))
          .includes(specialistId)
      )?.fullName || ''),
      switchMap(fullName => {
        if (fullName) {
          this.specialistNameCache.set(specialistId, fullName);
          return of(fullName);
        }

        return this.specialistService.getSpecialist(specialistId).pipe(
          map(specialist => specialist.fullName || `Specialist ${this.shortId(specialistId)}`),
          tap(name => this.specialistNameCache.set(specialistId, name)),
          catchError(() => of(`Specialist ${this.shortId(specialistId)}`))
        );
      })
    );
  }

  private resolveEntrepreneurName(entrepreneurId: string): Observable<string> {
    if (!entrepreneurId) {
      return of('Entrepreneur');
    }

    const cachedName = this.entrepreneurNameCache.get(entrepreneurId);
    if (cachedName) {
      return of(cachedName);
    }

    return this.authService.getEntrepreneurProfile(entrepreneurId).pipe(
      map(profile => String(profile?.fullName || profile?.name || `Entrepreneur ${this.shortId(entrepreneurId)}`)),
      tap(name => this.entrepreneurNameCache.set(entrepreneurId, name)),
      catchError(() => of(`Entrepreneur ${this.shortId(entrepreneurId)}`))
    );
  }

  private extractExplicitConversationName(conversation: Record<string, any>): string {
    const preferredName = this.currentUserRole === 'SPECIALIST'
      ? conversation['entrepreneur']?.fullName || conversation['entrepreneurName'] || conversation['entrepreneurFullName']
      : conversation['specialist']?.fullName || conversation['specialistName'] || conversation['specialistFullName'];

    const fallbackName = conversation['name'];

    if (this.isMeaningfulName(preferredName)) {
      return String(preferredName).trim();
    }

    if (this.isMeaningfulName(fallbackName)) {
      return String(fallbackName).trim();
    }

    return '';
  }

  private isMeaningfulName(value: unknown): boolean {
    const name = String(value || '').trim();
    if (!name) return false;

    return !/^(specialist|entrepreneur)\s+[a-f0-9]{4,}$/i.test(name);
  }

  private getAvatarLetter(name: string, fallback: string): string {
    const value = String(name || fallback || 'N').trim();
    return value.charAt(0).toUpperCase();
  }

  private normalizeRole(role?: string): string {
    return (role || '').replace(/^ROLE_/i, '').toUpperCase();
  }

  private shortId(id?: string): string {
    return id ? id.slice(0, 8) : '';
  }

  private getSeenTimestamp(conversationId: string): number {
    const state = this.readSeenState();
    return Number(state[conversationId] || 0);
  }

  private setSeenTimestamp(conversationId: string, timestamp: Date | string | number): void {
    if (!conversationId) return;
    const state = this.readSeenState();
    state[conversationId] = this.toTimestamp(timestamp || Date.now());
    this.writeSeenState(state);
  }

  private readSeenState(): Record<string, number> {
    if (!this.currentUserId || !this.currentUserRole) {
      return {};
    }

    try {
      const raw = localStorage.getItem(this.seenStateStorageKey());
      return raw ? JSON.parse(raw) as Record<string, number> : {};
    } catch {
      return {};
    }
  }

  private writeSeenState(state: Record<string, number>): void {
    if (!this.currentUserId || !this.currentUserRole) {
      return;
    }

    localStorage.setItem(this.seenStateStorageKey(), JSON.stringify(state));
  }

  private seenStateStorageKey(): string {
    return `hum-chat-seen:${this.currentUserRole}:${this.currentUserId}`;
  }

  private toTimestamp(value?: Date | string | number): number {
    const timestamp = value ? new Date(value).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
