export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  avatarUrl?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  name: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  avatarUrl?: string;
  isOnline?: boolean;
}
