import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Conversation, ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat implements OnInit, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  activeConversation: Conversation | null = null;
  newMessage = '';
  isTyping = false;
  isLoading = true;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chatService.getConversations().subscribe(convos => {
      this.conversations = convos;
      this.isLoading = false;
      if (convos.length > 0) {
        this.selectConversation(convos[0]);
      }
      this.cdr.markForCheck();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectConversation(convo: Conversation) {
    this.activeConversation = convo;
    this.chatService.getMessages(convo.id).subscribe(msgs => {
      this.messages = msgs;
      this.cdr.markForCheck();
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeConversation) return;
    
    this.chatService.sendMessage(this.activeConversation.id, this.newMessage).subscribe(msg => {
      this.messages.push(msg);
      this.newMessage = '';
      this.cdr.markForCheck();
      this.scrollToBottom();
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
