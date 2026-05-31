import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Chat, ChatMessage } from '../../../models/chat.model';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ai-chatbot.html',
  styleUrls: ['./ai-chatbot.css']
})
export class AiChatbot implements OnInit, AfterViewChecked {
  @ViewChild('messageScroller') messageScroller?: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  chats: Chat[] = [];
  activeChat?: Chat;
  messages: ChatMessage[] = [];
  projects: Project[] = [];

  projectContextId = '';
  selectedProjectId = '';
  draft = '';
  errorMessage = '';
  isLoadingChats = false;
  isLoadingMessages = false;
  isSending = false;
  isProjectModalOpen = false;
  isLoadingProjects = false;
  sidebarOpen = true;
  private shouldScroll = false;

  suggestions = [
    "Analyze my project's validation score",
    'Why might this project fail?',
    'What are the market opportunities?',
    'Generate a short business plan',
    'Suggest a marketing strategy',
    'Which specialists could help me?'
  ];

  ngOnInit() {
    this.projectContextId = this.route.snapshot.queryParamMap.get('projectId') || '';
    this.selectedProjectId = this.projectContextId;
    this.loadProjects();
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

  openNewChatModal() {
    this.selectedProjectId = this.projectContextId || this.projects[0]?.id || '';
    this.isProjectModalOpen = true;
  }

  closeNewChatModal() {
    if (this.isSending) return;
    this.isProjectModalOpen = false;
  }

  confirmStartNewChat() {
    if (!this.selectedProjectId) {
      this.errorMessage = 'Select a project before starting a conversation.';
      return;
    }
    this.chatService.createAiChat({
      userId: this.currentUserId(),
      projectId: this.selectedProjectId,
      title: '',
      chatType: 'AI_ASSISTANT',
      contextType: 'PROJECT_VALIDATION'
    }).subscribe(chat => {
      this.errorMessage = '';
      this.isProjectModalOpen = false;
      this.chats = [chat, ...this.chats.filter(item => item.id !== chat.id)];
      this.openChat(chat);
      this.cdr.markForCheck();
    }, () => {
      this.errorMessage = 'The conversation could not be started. Please choose another project.';
      this.cdr.markForCheck();
    });
  }

  loadProjects() {
    this.isLoadingProjects = true;
    this.projectService.getProjects().subscribe({
      next: projects => {
        this.projects = projects || [];
        this.isLoadingProjects = false;
        if (!this.selectedProjectId && this.projectContextId) {
          this.selectedProjectId = this.projectContextId;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.projects = [];
        this.isLoadingProjects = false;
        this.cdr.markForCheck();
      }
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

    this.chatService.sendAiMessage(this.activeChat.id, text).subscribe({
      next: exchange => {
        const messages = this.messages.filter(message => message.id !== optimistic.id);
        this.messages = [...messages, exchange.userMessage, exchange.assistantMessage];
        this.chatService.saveLocalAiMessages(this.activeChat!.id, this.messages);
        this.isSending = false;
        this.shouldScroll = true;
        this.refreshActiveChat();
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

  sendSuggestion(text: string) {
    if (!this.activeChat || this.isSending) return;
    this.draft = text;
    this.sendMessage();
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

  renderedMessage(message: ChatMessage): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(this.messageText(message)));
  }

  messageRole(message: ChatMessage): string {
    return (message.role || message.senderType || '').toUpperCase();
  }

  isAssistant(message: ChatMessage): boolean {
    return this.messageRole(message).includes('ASSISTANT') || this.messageRole(message).includes('AI');
  }

  currentUserId(): string {
    if (this.authService.currentUser?.id) {
      return this.authService.currentUser.id;
    }
    try {
      return JSON.parse(localStorage.getItem('nexus_user') || '{}')?.id || '';
    } catch {
      return '';
    }
  }

  projectName(chat: Chat | undefined = this.activeChat): string {
    if (!chat) return '';
    return chat.projectName || this.projects.find(project => project.id === chat.projectId)?.title || 'Selected project';
  }

  projectSector(chat: Chat): string {
    return this.projects.find(project => project.id === chat.projectId)?.sector || 'Project';
  }

  private refreshActiveChat() {
    if (!this.activeChat) return;
    this.chatService.getAiChatById(this.activeChat.id).subscribe({
      next: chat => {
        this.activeChat = chat;
        this.chats = this.chats.map(item => item.id === chat.id ? chat : item);
        this.cdr.markForCheck();
      }
    });
  }

  private markdownToHtml(markdown: string): string {
    const escaped = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/s, '<p>$1</p>');
  }
}
