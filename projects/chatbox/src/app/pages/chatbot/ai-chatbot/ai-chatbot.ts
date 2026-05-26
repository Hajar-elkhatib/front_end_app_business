import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Chat, ChatMessage } from '../../../models/chat.model';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.html',
  styleUrls: ['./ai-chatbot.css']
})
export class AiChatbot implements OnInit, AfterViewChecked {
  @ViewChild('messageScroller') messageScroller?: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  chats: Chat[] = [];
  activeChat?: Chat;
  messages: ChatMessage[] = [];

  projectContextId = '';
  draft = '';
  errorMessage = '';
  isLoadingChats = false;
  isLoadingMessages = false;
  isSending = false;
  sidebarOpen = true;
  private shouldScroll = false;

  ngOnInit() {
    this.projectContextId = this.route.snapshot.queryParamMap.get('projectId') || '';
    this.loadLocalChats();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.messageScroller) {
      this.messageScroller.nativeElement.scrollTop = this.messageScroller.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  loadLocalChats() {
    this.isLoadingChats = true;
    this.chatService.getAiChats(this.projectContextId || undefined).subscribe({
      next: chats => {
        this.chats = chats;
        this.activeChat = this.activeChat || chats[0];
        this.isLoadingChats = false;
        if (this.activeChat) {
          this.openChat(this.activeChat);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingChats = false;
        this.errorMessage = 'Conversations could not be loaded. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  startNewChat() {
    const title = 'New conversation';
    this.chatService.createAiChat({
      userId: this.currentUserId(),
      projectId: this.projectContextId,
      title,
      chatType: 'AI_ASSISTANT',
      contextType: this.projectContextId ? 'PROJECT_VALIDATION' : 'GENERAL'
    }).subscribe(chat => {
      this.errorMessage = '';
      this.chats = [chat, ...this.chats.filter(item => item.id !== chat.id)];
      this.openChat(chat);
      this.cdr.markForCheck();
    });
  }

  openChat(chat: Chat) {
    this.activeChat = chat;
    this.messages = this.chatService.getLocalAiMessages(chat.id);
    this.errorMessage = '';
    this.isLoadingMessages = true;
    this.chatService.getAiMessages(chat.id).subscribe({
      next: messages => {
        this.messages = (messages && messages.length > 0) ? messages : this.messages;
        this.chatService.saveLocalAiMessages(chat.id, this.messages);
        this.isLoadingMessages = false;
        this.shouldScroll = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingMessages = false;
        this.shouldScroll = true;
        this.cdr.markForCheck();
      }
    });
  }

  deleteLocalChat(chat: Chat, event: Event) {
    event.stopPropagation();
    this.chatService.deleteAiChat(chat.id).subscribe(() => {
      this.chats = this.chats.filter(item => item.id !== chat.id);
      if (this.activeChat?.id === chat.id) {
        this.activeChat = this.chats[0];
        this.messages = [];
        if (this.activeChat) {
          this.openChat(this.activeChat);
        }
      }
      this.cdr.markForCheck();
    });
  }

  sendMessage() {
    const text = this.draft.trim();
    if (!this.activeChat || !text || this.isSending) return;

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      chatId: this.activeChat.id,
      role: 'USER',
      content: text,
      senderType: 'ENTREPRENEUR',
      timestamp: new Date().toISOString()
    };
    this.messages = [...this.messages, optimistic];
    this.chatService.saveLocalAiMessages(this.activeChat.id, this.messages);
    this.draft = '';
    this.isSending = true;
    this.errorMessage = '';
    this.shouldScroll = true;

    this.chatService.sendAiMessage(this.activeChat.id, this.currentUserId(), text).subscribe({
      next: assistantMessage => {
        this.messages = [...this.messages, assistantMessage];
        this.chatService.saveLocalAiMessages(this.activeChat!.id, this.messages);
        this.isSending = false;
        this.shouldScroll = true;
        this.cdr.markForCheck();
      },
      error: () => {
        const fallback: ChatMessage = {
          id: `local-assistant-${Date.now()}`,
          chatId: this.activeChat!.id,
          role: 'ASSISTANT',
          content: 'The assistant could not answer for now. Please try again in a few moments.',
          senderType: 'AI',
          timestamp: new Date().toISOString()
        };
        this.messages = [...this.messages, fallback];
        this.chatService.saveLocalAiMessages(this.activeChat!.id, this.messages);
        this.isSending = false;
        this.errorMessage = 'The assistant could not answer for now. Please try again.';
        this.shouldScroll = true;
        this.cdr.markForCheck();
      }
    });
  }

  onComposerKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  messageText(message: ChatMessage): string {
    return message.content || message.text || '';
  }

  messageRole(message: ChatMessage): string {
    return (message.role || message.senderType || '').toUpperCase();
  }

  isAssistant(message: ChatMessage): boolean {
    return this.messageRole(message).includes('ASSISTANT') || this.messageRole(message).includes('AI');
  }

  currentUserId(): string {
    return this.authService.currentUser?.id || '';
  }
}
