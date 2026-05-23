import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ai-chatbot.html',
  styleUrls: ['./ai-chatbot.css']
})
export class AiChatbot implements OnInit {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  chats: Chat[] = [];
  filteredChats: Chat[] = [];
  isLoading = true;
  query = '';
  typeFilter = 'all';

  ngOnInit() {
    this.loadChats();
    this.route.queryParamMap.subscribe(params => {
      this.query = (params.get('search') || '').toLowerCase();
      this.applyFilters();
    });
  }

  loadChats() {
    this.isLoading = true;
    this.chatService.getAiChats().subscribe({
      next: chats => {
        this.chats = chats;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.chats = [];
        this.filteredChats = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters() {
    let results = [...this.chats];
    if (this.typeFilter !== 'all') {
      results = results.filter(chat => (chat.chatType || 'General') === this.typeFilter);
    }
    if (this.query) {
      results = results.filter(chat =>
        chat.title.toLowerCase().includes(this.query) ||
        chat.projectId.toLowerCase().includes(this.query) ||
        (chat.chatType || '').toLowerCase().includes(this.query) ||
        chat.contextType.toLowerCase().includes(this.query)
      );
    }
    this.filteredChats = results;
  }

  deleteChat(chat: Chat) {
    if (!confirm(`Delete AI assistant chat "${chat.title}"?`)) {
      return;
    }
    this.chatService.deleteAiChat(chat.id).subscribe(() => {
      this.chats = this.chats.filter(item => item.id !== chat.id);
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }
}
