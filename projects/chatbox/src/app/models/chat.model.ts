export interface Chat {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  userId?: string;
  chatLabel?: string;
  chatType?: string;
  contextType: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
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
  id?: string;
  senderId?: string;
  senderName?: string;
  text?: string;
  chatId?: string;
  role?: string;
  content?: string;
  timestamp: Date | string;
  isRead?: boolean;
  senderType?: string;
  avatarUrl?: string;
}

export interface ChatExchange {
  chatId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  sourcesUsed?: string[];
  intent?: string;
}
