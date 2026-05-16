import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Conversation, ChatMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mockConversations: Conversation[] = [
    {
      id: '1', participants: ['current', 'alex'], name: 'Alex Rivera',
      unreadCount: 2, avatarUrl: 'A', isOnline: true,
      lastMessage: { id: 'm1', senderId: 'alex', senderName: 'Alex Rivera', text: 'The new UI looks great!', timestamp: new Date(), isRead: false }
    },
    {
      id: '2', participants: ['current', 'project-nexus'], name: 'Project: Nexus E-commerce',
      unreadCount: 0, avatarUrl: 'N', isOnline: false,
      lastMessage: { id: 'm2', senderId: 'group', senderName: 'Sarah', text: 'Are we launching today?', timestamp: new Date(Date.now() - 3600000), isRead: true }
    }
  ];

  private mockMessages: Record<string, ChatMessage[]> = {
    '1': [
      { id: 'm10', senderId: 'alex', senderName: 'Alex Rivera', text: 'Hey there! I just reviewed the latest mockups for the dashboard.', timestamp: new Date(Date.now() - 7200000), isRead: true, avatarUrl: 'A' },
      { id: 'm11', senderId: 'current', senderName: 'Me', text: 'Awesome! Did you like the new layout with the AI recommendations?', timestamp: new Date(Date.now() - 3600000), isRead: true },
      { id: 'm1', senderId: 'alex', senderName: 'Alex Rivera', text: 'The new UI looks great!', timestamp: new Date(), isRead: false, avatarUrl: 'A' }
    ]
  };

  getConversations(): Observable<Conversation[]> {
    return of(this.mockConversations).pipe(delay(400));
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    return of(this.mockMessages[conversationId] || []).pipe(delay(300));
  }

  sendMessage(conversationId: string, text: string): Observable<ChatMessage> {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: 'Me',
      text,
      timestamp: new Date(),
      isRead: true
    };
    if (!this.mockMessages[conversationId]) {
      this.mockMessages[conversationId] = [];
    }
    this.mockMessages[conversationId].push(newMsg);
    return of(newMsg).pipe(delay(200));
  }
}
