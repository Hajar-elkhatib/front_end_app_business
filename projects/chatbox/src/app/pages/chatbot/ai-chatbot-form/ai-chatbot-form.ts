import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-ai-chatbot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ai-chatbot-form.html',
  styleUrls: ['./ai-chatbot-form.css']
})
export class AiChatbotForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chatService = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);

  chatId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;

  form = this.fb.group({
    projectId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    chatType: ['General', Validators.required],
    contextType: ['Project', Validators.required]
  });

  ngOnInit() {
    const projectId = this.route.snapshot.queryParamMap.get('projectId');
    if (projectId) {
      this.form.patchValue({ projectId });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.chatId = id;
      this.loadChat(id);
    }
  }

  loadChat(id: string) {
    this.isLoading = true;
    this.chatService.getAiChatById(id).subscribe({
      next: chat => {
        this.form.patchValue({
          projectId: chat.projectId,
          title: chat.title,
          chatType: chat.chatType || 'General',
          contextType: chat.contextType || 'Project'
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/chatbot']);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const value = this.form.getRawValue();
    const payload = {
      projectId: value.projectId || '',
      title: value.title || '',
      chatType: value.chatType || 'General',
      contextType: value.contextType || 'Project'
    };

    const request = this.isEditMode
      ? this.chatService.updateAiChat(this.chatId, payload)
      : this.chatService.createAiChat(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/chatbot']);
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
        alert('AI chat could not be saved.');
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
