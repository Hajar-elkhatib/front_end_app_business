import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HumChat } from '../../services/hum-chat';
import { AuthService } from '../../services/auth.service';
import { SpecialistService } from '../../services/specialist.service';
import { Conversation, ConversationMessage, SendMessageRequest } from '../../models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: ConversationMessage[] = [];
  activeConversation: Conversation | null = null;
  newMessage = '';
  isTyping = false;
  isLoading = true;
  isSending = false;
  connectionReady = false;
  loadError = '';

  private messageSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  constructor(
    private humChat: HumChat,
    private authService: AuthService,
    private specialistService: SpecialistService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    if (!currentUser?.id) {
      this.isLoading = false;
      return;
    }

    if (this.authService.userRole === 'specialist') {
      this.specialistService.getProfile(currentUser.id).subscribe({
        next: specialist => {
          const specialistId = specialist.mongoId || specialist.specialistId || specialist.id;
          this.initializeHumanChat(specialistId, currentUser.role);
        },
        error: () => this.initializeHumanChat(currentUser.id, currentUser.role)
      });
      return;
    }

    this.initializeHumanChat(currentUser.id, currentUser.role);
  }

  private initializeHumanChat(userId: string, role: string) {
    this.humChat.setCurrentUser(userId, role);

    this.messageSubscription = this.humChat.onMessage().subscribe(message => {
      if (message.conversationId !== this.activeConversation?.id) return;
      this.messages = [...this.messages.filter(existing => existing.id !== message.id), message];
      this.updateConversationPreview(message);
      this.isSending = false;
      this.cdr.markForCheck();
      this.scrollToBottom();
    });

    this.connectionSubscription = this.humChat.isConnected().subscribe(isConnected => {
      this.connectionReady = isConnected;
      this.cdr.markForCheck();
    });

    this.humChat.getConversations().subscribe({
      next: convos => {
        this.conversations = convos;
        this.isLoading = false;
        this.loadError = '';
        if (convos.length > 0) {
          const requestedConversationId = this.route.snapshot.paramMap.get('conversationId')
            || this.route.snapshot.queryParamMap.get('conversationId');
          const requestedConversation = convos.find(convo => convo.id === requestedConversationId);
          this.selectConversation(requestedConversation || convos[0]);
        } else {
          const requestedConversationId = this.route.snapshot.paramMap.get('conversationId')
            || this.route.snapshot.queryParamMap.get('conversationId');
          if (requestedConversationId) {
            this.humChat.getConversation(requestedConversationId).subscribe({
              next: (conversation: Conversation) => {
                this.conversations = [conversation];
                this.selectConversation(conversation);
                this.cdr.markForCheck();
              },
              error: () => {
                this.loadError = 'Conversation could not be loaded.';
                this.cdr.markForCheck();
              }
            });
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.conversations = [];
        this.isLoading = false;
        this.loadError = 'Conversations could not be loaded. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.humChat.disconnect();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectConversation(convo: Conversation) {
    this.activeConversation = convo;
    this.humChat.connect(convo.id);
    this.humChat.getMessages(convo.id).subscribe(msgs => {
      this.messages = msgs;
      this.cdr.markForCheck();
      this.scrollToBottom();
    });
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content || !this.activeConversation || this.isSending) return;

    const request: SendMessageRequest = {
      conversationId: this.activeConversation.id,
      senderId: this.humChat.getCurrentUserId(),
      role: this.humChat.getCurrentUserRole(),
      senderType: this.humChat.getCurrentUserRole(),
      content
    };

    this.isSending = true;
    this.newMessage = '';
    this.humChat.sendMessage(request).subscribe({
      next: (message: ConversationMessage) => {
        this.messages = [...this.messages, message];
        this.updateConversationPreview(message);
        this.isSending = false;
        this.cdr.markForCheck();
        this.scrollToBottom();
      },
      error: () => {
        this.isSending = false;
        this.cdr.markForCheck();
      }
    });
    this.cdr.markForCheck();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  private updateConversationPreview(message: ConversationMessage): void {
    this.conversations = this.conversations.map(conversation => {
      if (conversation.id !== message.conversationId) return conversation;

      return {
        ...conversation,
        lastMessage: {
          text: message.content,
          timestamp: message.timestamp
        }
      };
    });
  }
}
