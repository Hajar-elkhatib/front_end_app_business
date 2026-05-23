export interface Chat {
  id: string;
  projectId: string;
  title: string;
  chatType?: string;
  contextType: string;
  createdAt: Date | string;
}


export interface Conversation {
  id: string;
  specialistId: string;
  entrepreneurId: string;
  projectId: string;
  startedAt: Date | string;
  type?: string;
  participants?: string[];
  name?: string;
  unreadCount?: number;
  avatarUrl?: string;
  isOnline?: boolean;
  lastMessage?: ChatMessage;
}
export interface Message {
  id: string;
  conversationId: string;
  chatId: string;
  role: string;
  content: string;
  timestamp: Date | string;
  senderType: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date | string;
  isRead: boolean;
  avatarUrl?: string;
}
