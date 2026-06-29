// src/app/models/chat.model.ts

// ================================
// CHATBOT (AI) — already yours
// ================================

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

// ================================
// HUMAN CHAT — Specialist ↔ Entrepreneur
// ================================

export interface Conversation {
  id: string;
  specialistId: string;
  entrepreneurId: string;
  projectId?: string;
  chatId?: string;
  createdAt?: Date | string;

  // UI fields
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: Date | string;
  };
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: string;          // "ENTREPRENEUR" | "SPECIALIST"
  content: string;
  senderType: string;
  timestamp: Date | string;

  // UI fields
  senderId: string;      // "current" | "other"
  text: string;
  avatarUrl: string;
}

export interface SendMessageRequest {
  conversationId: string;
  senderId: string;
  role: string;
  content: string;
  senderType: string;
}
