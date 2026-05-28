import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComplaintService } from '../../../services/availability-complaint.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './complaint-form.html',
  styleUrls: ['./complaint-form.css']
})
export class ComplaintForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private complaintService = inject(ComplaintService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  complaintId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  saveError = '';

  form = this.fb.group({
    subject: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Technical', Validators.required],
    priority: ['Medium', Validators.required],
    status: ['Pending', Validators.required],
    aiSuggestedResponse: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.complaintId = id;
      this.loadComplaint(id);
    }
  }

  loadComplaint(id: string) {
    this.isLoading = true;
    this.complaintService.getComplaintById(id).subscribe({
      next: complaint => {
        this.form.patchValue({
          subject: complaint.subject,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          status: complaint.status || 'Pending',
          aiSuggestedResponse: complaint.aiSuggestedResponse || ''
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/complaints']);
      }
    });
  }

  save() {
    this.saveError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Please complete the required fields before saving.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    const value = this.form.getRawValue();
    const userId = this.authService.currentUser?.id || 'local-user';

    const request = this.isEditMode
      ? this.complaintService.updateComplaint(this.complaintId, {
          subject: value.subject || '',
          description: value.description || '',
          category: value.category || '',
          priority: value.priority || '',
          status: value.status || 'Pending',
          aiSuggestedResponse: value.aiSuggestedResponse || ''
        })
      : this.complaintService.createComplaint({
          userId,
          subject: value.subject || '',
          description: value.description || '',
          category: value.category || '',
          priority: value.priority || '',
          aiSuggestedResponse: value.aiSuggestedResponse || ''
        });

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/complaints']);
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Complaint could not be saved. Please check the backend connection and try again.';
        this.cdr.markForCheck();
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
