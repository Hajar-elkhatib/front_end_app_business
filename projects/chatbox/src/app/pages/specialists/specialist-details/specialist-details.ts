import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SpecialistService } from '../../../services/specialist.service';
import { Specialist } from '../../../models/specialist.model';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { AssignmentService } from '../../../services/assignment.service';
import { ProjectAssignmentResponse } from '../../../models/assignment.model';
import { Review, ReviewService } from '../../../services/review.service';
import { EvaluationService } from '../../../services/evaluation.service';
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
  reviews: Review[] = [];
  completedAssignments: ProjectAssignmentResponse[] = [];
  currentEvaluationAssignment: ProjectAssignmentResponse | null = null;
  reviewForm = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(3)]]
  });
  editingReviewId: string | null = null;
  isLoading = true;
  loadError = '';
  evaluationSuccess = '';
  evaluationError = '';
  showDeleteModal = false;
  reviewToast = '';
  canSubmitReview = false;
  canEvaluate = false;
  isStartingConversation = false;
  contactError = '';
  selectedEvaluationScore = 0;
  averageEvaluationScore = 0;
  evaluationCount = 0;
  hasEvaluation = false;
  evaluationMessage = '';
  evaluationMessageType: 'success' | 'error' | '' = '';
  contactError = '';
  isStartingConversation = false;
  private toastTimer: number | undefined;
  private evaluationRequestInFlight = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialistService: SpecialistService,
    private reviewService: ReviewService,
    private assignmentService: AssignmentService,
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

    this.specialistService.getProfile(userId).pipe(timeout(10000)).subscribe({
      next: specialist => {
        this.specialist = specialist;
        this.isLoading = false;
        const specialistMongoId = this.getSpecialistMongoId();
        if (specialistMongoId) {
          this.loadReviews(specialistMongoId);
          this.loadEvaluationSummary(specialistMongoId);
          this.loadCompletedAssignmentsAndEvaluation(specialistMongoId);
          this.refreshReviewEligibility(specialistMongoId);
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
    this.reviewService.getSpecialistReviews(userId).subscribe({
      next: reviews => {
        this.reviews = reviews.sort((a, b) => {
          const left = new Date(a.createdAt || 0).getTime();
          const right = new Date(b.createdAt || 0).getTime();
          return right - left;
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviews = [];
        this.cdr.markForCheck();
      }
    });
  }

  submitEvaluation() {
    if (!this.specialist) return;
    this.saveReview();
  }

  get reviewCount(): number {
    return this.reviews.length;
  }

  get averageRating(): string {
    return (this.averageEvaluationScore || 0).toFixed(1);
  }

  readonly evaluationStars = [1, 2, 3, 4, 5];

  ratingFill(star: number): number {
    const value = this.averageEvaluationScore || 0;
    return Math.max(0, Math.min(1, value - (star - 1)));
  }

  userRatingFill(star: number): number {
    return Math.max(0, Math.min(1, this.selectedEvaluationScore - (star - 1)));
  }

  get hasReviews(): boolean {
    return this.reviews.length > 0;
  }

  startEditReview(review: Review) {
    this.editingReviewId = review.id;
    this.reviewForm.patchValue({
      comment: review.comment
    });
  }

  cancelReviewEdit() {
    this.editingReviewId = null;
    this.reviewForm.reset({ comment: '' });
  }

  saveReview() {
    if (!this.specialist) return;
    if (!this.canSubmitReview) {
      this.showToastMessage('error', 'Only entrepreneurs with review access can submit a review.');
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const value = this.reviewForm.getRawValue();
    const specialistId = this.getSpecialistMongoId();
    if (!specialistId) {
      this.showToastMessage('error', 'Specialist identifier is missing.');
      return;
    }

    const currentUserId = this.authService.currentUser?.id;
    if (!currentUserId) {
      this.showToastMessage('error', 'You need to be signed in to submit a review.');
      return;
    }

    const payload = {
      specialistId,
      entrepreneurId: currentUserId,
      comment: value.comment || ''
    };

    const request$ = this.editingReviewId
      ? this.reviewService.updateReview(this.editingReviewId, { comment: payload.comment })
      : this.reviewService.createReview(payload);

    request$.subscribe({
      next: () => {
        this.loadReviews(specialistId);
        this.refreshReviewEligibility(specialistId);
        this.reviewForm.reset({ comment: '' });
        this.editingReviewId = null;
        this.showToastMessage('success', this.editingReviewId ? 'Review updated successfully.' : 'Review saved successfully.');
      },
      error: () => {
        this.showToastMessage('error', this.editingReviewId ? 'Review could not be updated.' : 'Review could not be saved.');
      }
    });
  }

  deleteReview(review: Review) {
    if (!this.specialist) return;
    const specialistMongoId = this.getSpecialistMongoId();
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        if (specialistMongoId) {
          this.loadReviews(specialistMongoId);
          this.refreshReviewEligibility(specialistMongoId);
        }
        this.showToastMessage('success', 'Review deleted successfully.');
      },
      error: () => {
        this.showToastMessage('error', 'Review could not be deleted.');
      }
    });
  }

  selectEvaluation(score: number) {
    if (!this.canEvaluate || !this.specialist) return;

    const specialistId = this.getSpecialistMongoId();
    const entrepreneurId = this.authService.currentUser?.id;
    if (!specialistId || !entrepreneurId || this.evaluationRequestInFlight) {
      return;
    }

    if (this.hasEvaluation && this.selectedEvaluationScore === score) {
      this.deleteEvaluation();
      return;
    }

    this.evaluationRequestInFlight = true;
    const isUpdate = this.hasEvaluation;
    const assignmentId = this.currentEvaluationAssignment?.assignmentId || this.currentEvaluationAssignment?.id;
    const request$ = isUpdate
      ? this.evaluationService.updateEvaluation(entrepreneurId, specialistId, score)
      : this.evaluationService.createEvaluation({
          specialistId,
          entrepreneurId,
          score,
          comment: '',
          assignmentId: assignmentId || undefined
        });

    request$.subscribe({
      next: () => {
        this.selectedEvaluationScore = score;
        this.hasEvaluation = true;
        this.refreshEvaluationData(specialistId, entrepreneurId);
        this.showEvaluationMessage('success', isUpdate ? 'Your evaluation was updated.' : 'Your evaluation was saved.');
        this.evaluationRequestInFlight = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.evaluationRequestInFlight = false;
        this.showEvaluationMessage('error', 'The evaluation could not be saved.');
        this.cdr.markForCheck();
      }
    });
  }

  deleteEvaluation() {
    if (!this.canEvaluate || !this.specialist || !this.hasEvaluation) return;

    const specialistId = this.getSpecialistMongoId();
    const entrepreneurId = this.authService.currentUser?.id;
    if (!specialistId || !entrepreneurId || this.evaluationRequestInFlight) {
      return;
    }

    this.evaluationRequestInFlight = true;
    this.evaluationService.deleteEvaluationByPair(entrepreneurId, specialistId).subscribe({
      next: () => {
        this.selectedEvaluationScore = 0;
        this.hasEvaluation = false;
        this.refreshEvaluationData(specialistId, entrepreneurId);
        this.showEvaluationMessage('success', 'Your evaluation was removed.');
        this.evaluationRequestInFlight = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.evaluationRequestInFlight = false;
        this.showEvaluationMessage('error', 'The evaluation could not be removed.');
        this.cdr.markForCheck();
      }
    });
  }

  canManageReview(review: Review): boolean {
    return this.authService.currentUser?.id === review.entrepreneurId;
  }

  reviewerDisplay(review: Review): string {
    return review.reviewerName || 'Anonymous';
  }

  createdAtDisplay(review: Review): string {
    return review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '';
  }

  private refreshReviewEligibility(specialistId: string) {
    const currentUser = this.authService.currentUser;
    if (currentUser?.role !== 'entrepreneur') {
      this.canSubmitReview = false;
      this.editingReviewId = null;
      this.reviewForm.reset({ comment: '' });
      this.cdr.markForCheck();
      return;
    }

    const currentUserId = currentUser.id;
    if (!currentUserId) {
      this.canSubmitReview = false;
      this.editingReviewId = null;
      this.reviewForm.reset({ comment: '' });
      this.cdr.markForCheck();
      return;
    }

    this.assignmentService.getDoneAssignments(currentUserId).subscribe({
      next: assignments => {
        const eligible = assignments.some(assignment => assignment.specialistId === specialistId && assignment['canReview'] === true);
        this.canSubmitReview = eligible;

        if (!eligible) {
          this.editingReviewId = null;
          this.reviewForm.reset({ comment: '' });
          this.cdr.markForCheck();
          return;
        }

        this.reviewService.getEntrepreneurReviews(currentUserId).subscribe({
          next: entrepreneurReviews => {
            const existingReview = entrepreneurReviews.find(review => review.specialistId === specialistId);
            if (existingReview) {
              this.editingReviewId = existingReview.id;
              this.reviewForm.patchValue({ comment: existingReview.comment });
            } else {
              this.editingReviewId = null;
              this.reviewForm.reset({ comment: '' });
            }
            this.cdr.markForCheck();
          },
          error: () => {
            this.editingReviewId = null;
            this.reviewForm.reset({ comment: '' });
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.canSubmitReview = false;
        this.editingReviewId = null;
        this.reviewForm.reset({ comment: '' });
        this.cdr.markForCheck();
      }
    });
  }

  private loadEvaluationSummary(specialistId: string) {
    this.evaluationService.getSpecialistEvaluations(specialistId).subscribe({
      next: evaluations => {
        this.averageEvaluationScore = this.evaluationService.computeAverageScore(evaluations);
        this.evaluationCount = evaluations.length;
        this.cdr.markForCheck();
      },
      error: () => {
        this.averageEvaluationScore = 0;
        this.evaluationCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  private loadCompletedAssignmentsAndEvaluation(specialistId: string) {
    const currentUser = this.authService.currentUser;
    if (currentUser?.role !== 'entrepreneur' || !currentUser.id) {
      this.canEvaluate = false;
      this.selectedEvaluationScore = 0;
      this.hasEvaluation = false;
      this.completedAssignments = [];
      this.currentEvaluationAssignment = null;
      this.cdr.markForCheck();
      return;
    }

    this.assignmentService.getDoneAssignments(currentUser.id).subscribe({
      next: assignments => {
        this.completedAssignments = assignments.filter(assignment => this.isEvaluationEligibleAssignment(assignment, specialistId));
        this.currentEvaluationAssignment = this.completedAssignments.find(assignment => this.matchesSpecialist(assignment, specialistId)) || null;
        this.canEvaluate = !!this.currentEvaluationAssignment;

        this.evaluationService.getEvaluation(currentUser.id, specialistId).subscribe({
          next: evaluation => {
            if (evaluation) {
              this.selectedEvaluationScore = evaluation.score || 0;
              this.hasEvaluation = true;
            } else {
              this.selectedEvaluationScore = 0;
              this.hasEvaluation = false;
            }
            this.cdr.markForCheck();
          },
          error: () => {
            this.selectedEvaluationScore = 0;
            this.hasEvaluation = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.canEvaluate = false;
        this.selectedEvaluationScore = 0;
        this.hasEvaluation = false;
        this.cdr.markForCheck();
      }
    });
  }

  private refreshEvaluationData(specialistId: string, entrepreneurId?: string) {
    const currentEntrepreneurId = entrepreneurId || this.authService.currentUser?.id;
    if (!currentEntrepreneurId) {
      this.loadEvaluationSummary(specialistId);
      return;
    }

    this.loadEvaluationSummary(specialistId);
    this.loadCompletedAssignmentsAndEvaluation(specialistId);
  }

  private showEvaluationMessage(type: 'success' | 'error', message: string) {
    this.evaluationMessageType = type;
    this.evaluationMessage = message;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.evaluationMessage = '';
      this.evaluationMessageType = '';
      this.cdr.markForCheck();
    }, 3000);
    this.cdr.markForCheck();
  }

  private showToastMessage(type: 'success' | 'error', message: string) {
    this.evaluationSuccess = type === 'success' ? message : '';
    this.evaluationError = type === 'error' ? message : '';
    this.reviewToast = message;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.evaluationSuccess = '';
      this.evaluationError = '';
      this.reviewToast = '';
      this.cdr.markForCheck();
    }, 3000);
    this.cdr.markForCheck();
  }

  private getSpecialistMongoId(): string {
    return this.specialist?.mongoId || this.specialist?.specialistId || '';
  }

  private matchesSpecialist(assignment: ProjectAssignmentResponse, specialistId: string): boolean {
    const assignmentSpecialistId = String(assignment.specialistId || '');
    return assignmentSpecialistId === specialistId;
  }

  private isEvaluationEligibleAssignment(assignment: ProjectAssignmentResponse, specialistId: string): boolean {
    return this.matchesSpecialist(assignment, specialistId) && assignment.canEvaluate === true;
  }

  startConversation() {
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
        this.router.navigate(['/dashboard/entrepreneur/conversations', conversation.id]);
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

  startConversation() {
    if (!this.specialist || this.isStartingConversation) {
      return;
    }

    this.isStartingConversation = true;
    this.contactError = '';
    this.router.navigate(['/conversations']).finally(() => {
      this.isStartingConversation = false;
      this.cdr.markForCheck();
    });
  }
}
