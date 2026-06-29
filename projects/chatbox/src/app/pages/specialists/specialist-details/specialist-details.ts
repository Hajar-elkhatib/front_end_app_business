import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SpecialistService } from '../../../services/specialist.service';
import { Specialist } from '../../../models/specialist.model';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation, EvaluationReviewView } from '../../../models/evaluation.model';
import { HumChat } from '../../../services/hum-chat';

@Component({
  selector: 'app-specialist-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './specialist-details.html',
  styleUrls: ['./specialist-details.css']
})
export class SpecialistDetails implements OnInit {
  private fb = inject(FormBuilder);

  specialist: Specialist | undefined;
  reviews: EvaluationReviewView[] = [];
  reviewForm = this.fb.group({
    reviewerName: ['', Validators.required],
    comment: ['', [Validators.required, Validators.minLength(3)]],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
  });
  hoverRating = 0;
  editingReviewId: string | null = null;
  isLoading = true;
  loadError = '';
  isSubmittingEvaluation = false;
  evaluationSuccess = '';
  evaluationError = '';
  showDeleteModal = false;
  reviewToast = '';
  contactError = '';
  isStartingConversation = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialistService: SpecialistService,
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private humChat: HumChat,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.router.navigate(['/specialists']);
      return;
    }

    this.loadSpecialistProfile(userId);
  }

  loadSpecialistProfile(userId: string) {
    this.isLoading = true;
    this.loadError = '';

    this.specialistService.getProfile(userId).pipe(
      timeout(10000)
    ).subscribe({
      next: specialist => {
        this.specialist = specialist;
        this.isLoading = false;
        const specialistMongoId = this.getSpecialistMongoId();
        if (specialistMongoId) {
          this.loadReviews(specialistMongoId);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Specialist profile could not be loaded. Check that the route uses the backend userId.';
        this.cdr.markForCheck();
      }
    });
  }

  loadReviews(userId: string) {
    this.evaluationService.getSpecialistEvaluations(userId).subscribe({
      next: reviews => {
        this.reviews = this.evaluationService.toReviewViews(reviews).sort((a, b) => {
          const left = new Date(a.createdAt || 0).getTime();
          const right = new Date(b.createdAt || 0).getTime();
          return right - left;
        });
        this.updateSpecialistReviewStats(reviews);
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviews = [];
        this.updateSpecialistReviewStats([]);
        this.cdr.markForCheck();
      }
    });
  }

  submitEvaluation() {
    if (!this.specialist) return;
    this.saveReview();
  }

  get ratingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get reviewCount(): number {
    return this.reviews.length;
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    return Math.round((this.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / this.reviews.length) * 10) / 10;
  }

  get hasReviews(): boolean {
    return this.reviews.length > 0;
  }

  get selectedRating(): number {
    return Number(this.reviewForm.get('rating')?.value || 0);
  }

  setHoverRating(value: number) {
    this.hoverRating = value;
  }

  setRating(value: number) {
    this.reviewForm.patchValue({ rating: value });
    this.reviewForm.get('rating')?.markAsTouched();
  }

  startEditReview(review: EvaluationReviewView) {
    this.editingReviewId = review.id;
    this.reviewForm.patchValue({
      reviewerName: review.reviewerName,
      comment: review.comment,
      rating: review.rating
    });
  }

  cancelReviewEdit() {
    this.editingReviewId = null;
    this.reviewForm.reset({ reviewerName: '', comment: '', rating: 5 });
  }

  saveReview() {
    if (!this.specialist) return;
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const value = this.reviewForm.getRawValue();
    const specialistId = this.getSpecialistMongoId();
    if (!specialistId) {
      this.evaluationError = 'Specialist identifier is missing.';
      return;
    }
    const currentUserId = this.authService.currentUser?.id;
    const payload = {
      specialistId,
      entrepreneurId: currentUserId || '',
      score: Number(value.rating || 5),
      comment: value.comment || '',
      availableDate: undefined,
      startTime: undefined,
      endTime: undefined,
      status: 'COMPLETED'
    };

    this.evaluationService.createEvaluation(payload).subscribe({
      next: () => {
        this.loadReviews(specialistId);
        // Reload the profile so rating and reviewsCount refresh immediately.
        this.loadSpecialistProfile(this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('userId') || specialistId);
        this.reviewForm.reset({ reviewerName: '', comment: '', rating: 5 });
        this.editingReviewId = null;
        this.reviewToast = 'Review saved successfully.';
        this.evaluationSuccess = this.reviewToast;
        this.cdr.markForCheck();
      },
      error: () => {
        this.evaluationError = 'Review could not be saved.';
        this.cdr.markForCheck();
      }
    });
  }

  deleteReview(review: EvaluationReviewView) {
    if (!this.specialist) return;
    const specialistMongoId = this.getSpecialistMongoId();
    this.evaluationService.deleteReview(review.id).subscribe(() => {
      if (specialistMongoId) {
        this.loadReviews(specialistMongoId);
        this.loadSpecialistProfile(this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('userId') || specialistMongoId);
      }
    });
  }

  canDeleteReview(review: EvaluationReviewView): boolean {
    return review.canDelete;
  }

  reviewerDisplay(review: EvaluationReviewView): string {
    return review.reviewerName || 'Anonymous';
  }

  createdAtDisplay(review: EvaluationReviewView): string {
    return review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '';
  }

  private updateSpecialistReviewStats(reviews: Evaluation[]) {
    if (!this.specialist) return;
    const average = this.evaluationService.computeAverageScore(reviews);
    this.specialist = {
      ...this.specialist,
      averageRating: average,
      reviewsCount: reviews.length
    };
  }

  private getSpecialistMongoId(): string {
    return this.specialist?.mongoId || this.specialist?.specialistId || '';
  }

  startConversation() {
    if (!this.specialist || this.isStartingConversation) return;

    const entrepreneurId = this.authService.currentUser?.id || '';
    const specialistId = this.getSpecialistMongoId();

    if (!entrepreneurId || !specialistId) {
      this.contactError = 'Conversation could not be started because an identifier is missing.';
      return;
    }

    this.contactError = '';
    this.isStartingConversation = true;
    this.humChat.setCurrentUser(entrepreneurId, this.authService.userRole);
    this.humChat.startConversation(entrepreneurId, specialistId).subscribe({
      next: conversation => {
        this.isStartingConversation = false;
        this.router.navigate(['/conversations'], {
          queryParams: { conversationId: conversation.id }
        });
      },
      error: () => {
        this.isStartingConversation = false;
        this.contactError = 'Conversation could not be started. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  deleteSpecialist() {
    if (this.specialist) {
      this.specialistService.deleteSpecialist(this.specialist.id).subscribe(() => {
        this.cdr.markForCheck();
        this.router.navigate(['/specialists']);
      });
    }
  }
}
