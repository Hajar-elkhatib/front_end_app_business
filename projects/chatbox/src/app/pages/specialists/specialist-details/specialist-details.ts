import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { SpecialistService } from '../../../services/specialist.service';
import { AvailabilityService } from '../../../services/availability.service';
import { ProjectService } from '../../../services/project.service';
import { Specialist, Availability } from '../../../models/specialist.model';
import { AuthService } from '../../../services/auth.service';
import { AssignmentService } from '../../../services/assignment.service';
import { ProjectAssignmentResponse } from '../../../models/assignment.model';
import { Review, ReviewService } from '../../../services/review.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { HumChat } from '../../../services/hum-chat';
import { Project } from '../../../models/project.model';

interface AvailabilityDayCell {
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  slots: Availability[];
}

interface RelationshipHistoryItem extends ProjectAssignmentResponse {
  projectTitle: string;
}

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
  availabilitySlots: Availability[] = [];
  availabilityCalendar: AvailabilityDayCell[] = [];
  relationshipHistory: RelationshipHistoryItem[] = [];
  entrepreneurProjects: Project[] = [];
  availabilityMonthLabel = '';
  selectedAvailabilityDateKey = '';
  selectedAvailabilitySlotId: string | null = null;
  currentReviewAssignmentId: string | null = null;
  readonly weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private availabilityMonthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  reviewForm = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(3)]]
  });
  slotRequestForm = this.fb.group({
    projectId: ['', Validators.required]
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
  isRequestingSlot = false;
  slotRequestMessage = '';
  slotRequestMessageType: 'success' | 'error' | '' = '';
  private toastTimer: number | undefined;
  private evaluationRequestInFlight = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialistService: SpecialistService,
    private availabilityService: AvailabilityService,
    private projectService: ProjectService,
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

    this.loadEntrepreneurProjects();
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
          this.loadAvailabilitySlots(specialistMongoId);
          this.loadReviews(specialistMongoId);
          this.loadRelationshipHistory(specialistMongoId);
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

  get upcomingAvailability(): Availability[] {
    const now = Date.now();
    return this.availabilitySlots
      .filter(slot => this.slotTimestamp(slot) >= now)
      .slice(0, 6);
  }

  get hasRelationshipHistory(): boolean {
    return this.relationshipHistory.length > 0;
  }

  get isEntrepreneurViewer(): boolean {
    return this.authService.userRole === 'entrepreneur';
  }

  get assignableProjects(): Project[] {
    const relatedProjectIds = new Set(
      this.relationshipHistory
        .filter(item => (item.status || '').toUpperCase() !== 'CANCELLED')
        .map(item => item.projectId)
    );

    return this.entrepreneurProjects.filter(project =>
      String(project.projectStatus || '').toUpperCase() === 'VALIDATED'
      && !relatedProjectIds.has(project.id)
    );
  }

  get selectedAvailabilityDaySlots(): Availability[] {
    if (!this.selectedAvailabilityDateKey) {
      return [];
    }

    return this.availabilitySlots.filter(slot => this.slotDayKey(slot) === this.selectedAvailabilityDateKey);
  }

  get selectedAvailabilityDayLabel(): string {
    return this.selectedAvailabilityDateKey
      ? this.formatCalendarDate(this.selectedAvailabilityDateKey)
      : 'Select an open day';
  }

  get selectedAvailabilitySlot(): Availability | undefined {
    return this.selectedAvailabilitySlotId
      ? this.availabilitySlots.find(slot => slot.id === this.selectedAvailabilitySlotId)
      : undefined;
  }

  get hasSingleAssignableProject(): boolean {
    return this.assignableProjects.length === 1;
  }

  get selectedReservationProject(): Project | undefined {
    const selectedProjectId = String(this.slotRequestForm.controls.projectId.value || '');
    return this.assignableProjects.find(project => project.id === selectedProjectId);
  }

  get canRequestSelectedSlot(): boolean {
    return !!this.selectedAvailabilitySlotId
      && !!this.selectedReservationProject
      && !this.isRequestingSlot;
  }

  get slotReservationHint(): string {
    if (!this.isEntrepreneurViewer) {
      return 'Sign in as an entrepreneur to request an availability slot.';
    }

    if (!this.availabilitySlots.length) {
      return 'No open slots are available right now for this specialist.';
    }

    if (!this.entrepreneurProjects.some(project => String(project.projectStatus || '').toUpperCase() === 'VALIDATED')) {
      return 'Validate one of your projects first, then you can reserve one of these open slots.';
    }

    if (!this.assignableProjects.length) {
      return 'Your validated projects already have assignment history with this specialist.';
    }

    if (!this.selectedAvailabilitySlot) {
      return 'Select an open slot, then attach one of your validated projects.';
    }

    if (!this.selectedReservationProject) {
      return this.hasSingleAssignableProject
        ? `Selected slot: ${this.availabilitySummary(this.selectedAvailabilitySlot)}.`
        : 'Select the validated project you want to attach to this slot, then reserve it.';
    }

    return `Selected slot: ${this.availabilitySummary(this.selectedAvailabilitySlot)}. Project: ${this.selectedReservationProject.title}.`;
  }

  changeAvailabilityMonth(offset: number): void {
    const nextMonth = new Date(this.availabilityMonthCursor);
    nextMonth.setMonth(nextMonth.getMonth() + offset);
    this.availabilityMonthCursor = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    this.buildAvailabilityCalendar();
    this.cdr.markForCheck();
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
      assignmentId: this.currentReviewAssignmentId || undefined,
      comment: value.comment || ''
    };

    const isEditing = !!this.editingReviewId;
    const request$ = this.editingReviewId
      ? this.reviewService.updateReview(this.editingReviewId, { comment: payload.comment })
      : this.reviewService.createReview(payload);

    request$.subscribe({
      next: () => {
        this.loadReviews(specialistId);
        this.refreshReviewEligibility(specialistId);
        this.showToastMessage('success', isEditing ? 'Review updated successfully.' : 'Review saved successfully.');
      },
      error: () => {
        this.showToastMessage('error', isEditing ? 'Review could not be updated.' : 'Review could not be saved.');
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

  availabilitySummary(slot: Availability): string {
    return `${this.formatCalendarDate(slot.availableDate)} · ${slot.startTime} - ${slot.endTime}`;
  }

  selectAvailabilityDay(day: AvailabilityDayCell): void {
    if (!day.slots.length) {
      return;
    }

    this.selectedAvailabilityDateKey = day.dateKey;
    const stillSelectedOnDay = day.slots.some(slot => slot.id === this.selectedAvailabilitySlotId);
    if (!stillSelectedOnDay) {
      this.selectedAvailabilitySlotId = day.slots[0].id;
    }
    this.clearSlotRequestMessage();
    this.cdr.markForCheck();
  }

  selectAvailabilitySlot(slot: Availability): void {
    this.selectedAvailabilityDateKey = this.slotDayKey(slot);
    this.selectedAvailabilitySlotId = slot.id;
    this.clearSlotRequestMessage();
    this.cdr.markForCheck();
  }

  requestSelectedSlot(): void {
    if (!this.isEntrepreneurViewer) {
      this.showSlotRequestMessage('error', 'Only entrepreneurs can request a slot.');
      return;
    }

    const specialistId = this.getSpecialistMongoId();
    const entrepreneurId = this.authService.currentUser?.id;
    const { projectId } = this.slotRequestForm.getRawValue();

    if (!specialistId || !entrepreneurId) {
      this.showSlotRequestMessage('error', 'A required identifier is missing for this assignment request.');
      return;
    }

    if (!this.selectedAvailabilitySlotId) {
      this.showSlotRequestMessage('error', 'Select an open slot first.');
      return;
    }

    if (!projectId || !this.assignableProjects.some(project => project.id === projectId)) {
      this.slotRequestForm.controls.projectId.markAsTouched();
      this.showSlotRequestMessage('error', 'Choose one of your validated projects for this reservation.');
      return;
    }

    this.isRequestingSlot = true;
    this.clearSlotRequestMessage();

    this.assignmentService.assignProject({
      projectId,
      entrepreneurId,
      specialistId,
      availabilityId: this.selectedAvailabilitySlotId
    }).subscribe({
      next: () => {
        this.isRequestingSlot = false;
        this.slotRequestForm.reset({ projectId: '' });
        this.showSlotRequestMessage('success', 'Slot request sent. The specialist can now accept it from the dashboard.');
        this.loadRelationshipHistory(specialistId);
        this.loadEntrepreneurProjects();
        this.cdr.markForCheck();
      },
      error: error => {
        this.isRequestingSlot = false;
        this.showSlotRequestMessage('error', this.slotRequestErrorMessage(error));
        this.cdr.markForCheck();
      }
    });
  }

  historyStatusLabel(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'DONE': return 'Completed';
      case 'ACCEPTED': return 'Active';
      case 'PENDING': return 'Pending';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Unknown';
    }
  }

  historyStatusClass(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'DONE': return 'done';
      case 'ACCEPTED': return 'accepted';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'rejected';
      case 'CANCELLED': return 'cancelled';
      default: return 'neutral';
    }
  }

  historyTimeline(item: ProjectAssignmentResponse): string {
    const completedAt = item['completedAt'] || item.doneAt;
    if (completedAt) {
      return `Completed on ${this.formatCalendarDate(completedAt)}`;
    }
    if (item.respondedAt) {
      return `Responded on ${this.formatCalendarDate(item.respondedAt)}`;
    }
    if (item['assignedAt'] || item.createdAt) {
      return `Assigned on ${this.formatCalendarDate(item['assignedAt'] || item.createdAt || '')}`;
    }
    return 'Assignment history';
  }

  private refreshReviewEligibility(specialistId: string) {
    const currentUser = this.authService.currentUser;
    if (currentUser?.role !== 'entrepreneur') {
      this.canSubmitReview = false;
      this.currentReviewAssignmentId = null;
      this.editingReviewId = null;
      this.reviewForm.reset({ comment: '' });
      this.cdr.markForCheck();
      return;
    }

    const currentUserId = currentUser.id;
    if (!currentUserId) {
      this.canSubmitReview = false;
      this.currentReviewAssignmentId = null;
      this.editingReviewId = null;
      this.reviewForm.reset({ comment: '' });
      this.cdr.markForCheck();
      return;
    }

    forkJoin({
      assignments: this.assignmentService.getDoneAssignments(currentUserId),
      entrepreneurReviews: this.reviewService.getEntrepreneurReviews(currentUserId)
    }).subscribe({
      next: ({ assignments, entrepreneurReviews }) => {
        const relatedAssignments = assignments.filter(assignment => this.matchesSpecialist(assignment, specialistId));
        const reviewAssignment = relatedAssignments.find(assignment => assignment.canReview === true) || relatedAssignments[0] || null;
        const existingReview = entrepreneurReviews.find(review => review.specialistId === specialistId) || null;

        this.currentReviewAssignmentId = reviewAssignment?.assignmentId || reviewAssignment?.id || null;
        this.canSubmitReview = !!reviewAssignment || !!existingReview;

        if (existingReview) {
          this.editingReviewId = existingReview.id;
          this.reviewForm.patchValue({ comment: existingReview.comment });
        } else {
          this.editingReviewId = null;
          this.reviewForm.reset({ comment: '' });
        }

        if (!this.canSubmitReview) {
          this.currentReviewAssignmentId = null;
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.canSubmitReview = false;
        this.currentReviewAssignmentId = null;
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
        const relatedAssignments = assignments.filter(assignment => this.matchesSpecialist(assignment, specialistId));
        const evaluationAssignment = relatedAssignments.find(assignment => assignment.canEvaluate === true) || relatedAssignments[0] || null;
        this.completedAssignments = relatedAssignments;
        this.currentEvaluationAssignment = evaluationAssignment;

        this.evaluationService.getEvaluation(currentUser.id, specialistId).subscribe({
          next: evaluation => {
            if (evaluation) {
              this.selectedEvaluationScore = evaluation.score || 0;
              this.hasEvaluation = true;
              this.canEvaluate = true;
            } else {
              this.selectedEvaluationScore = 0;
              this.hasEvaluation = false;
              this.canEvaluate = !!evaluationAssignment;
            }
            this.cdr.markForCheck();
          },
          error: () => {
            this.selectedEvaluationScore = 0;
            this.hasEvaluation = false;
            this.canEvaluate = !!evaluationAssignment;
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

  private loadAvailabilitySlots(specialistId: string): void {
    this.availabilityService.getOpenBySpecialist(specialistId).subscribe({
      next: slots => {
        this.availabilitySlots = [...slots].sort((left, right) => this.slotTimestamp(left) - this.slotTimestamp(right));
        if (this.availabilitySlots.length) {
          const firstOpenDate = this.toDate(this.availabilitySlots[0].availableDate);
          this.availabilityMonthCursor = new Date(firstOpenDate.getFullYear(), firstOpenDate.getMonth(), 1);
        }
        this.syncSelectedAvailabilitySelection();
        this.buildAvailabilityCalendar();
        this.cdr.markForCheck();
      },
      error: () => {
        this.availabilitySlots = [];
        this.selectedAvailabilityDateKey = '';
        this.selectedAvailabilitySlotId = null;
        this.buildAvailabilityCalendar();
        this.cdr.markForCheck();
      }
    });
  }

  private loadRelationshipHistory(specialistId: string): void {
    const entrepreneurId = this.authService.currentUser?.id;
    if (!entrepreneurId) {
      this.relationshipHistory = [];
      this.cdr.markForCheck();
      return;
    }

    this.assignmentService.getEntrepreneurAssignments(entrepreneurId).subscribe({
      next: assignments => {
        const relatedAssignments = assignments.filter(assignment => this.matchesSpecialist(assignment, specialistId));
        if (!relatedAssignments.length) {
          this.relationshipHistory = [];
          this.cdr.markForCheck();
          return;
        }

        const projectRequests = relatedAssignments.map(assignment =>
          this.projectService.getProjectById(assignment.projectId).pipe(catchError(() => of(undefined)))
        );

        forkJoin(projectRequests).subscribe({
          next: projects => {
            this.relationshipHistory = relatedAssignments
              .map((assignment, index) => ({
                ...assignment,
                projectTitle: projects[index]?.title || assignment.project?.title || `Project ${this.shortId(assignment.projectId)}`
              }))
              .sort((left, right) => this.historyTimestamp(right) - this.historyTimestamp(left));
            this.syncSelectedProjectSelection();
            this.cdr.markForCheck();
          },
          error: () => {
            this.relationshipHistory = relatedAssignments
              .map(assignment => ({
                ...assignment,
                projectTitle: assignment.project?.title || `Project ${this.shortId(assignment.projectId)}`
              }))
              .sort((left, right) => this.historyTimestamp(right) - this.historyTimestamp(left));
            this.syncSelectedProjectSelection();
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.relationshipHistory = [];
        this.syncSelectedProjectSelection();
        this.cdr.markForCheck();
      }
    });
  }

  private loadEntrepreneurProjects(): void {
    const currentUser = this.authService.currentUser;
    if (currentUser?.role !== 'entrepreneur' || !currentUser.id) {
      this.entrepreneurProjects = [];
      this.syncSelectedProjectSelection();
      this.cdr.markForCheck();
      return;
    }

    this.projectService.refreshProjects().pipe(
      catchError(() => of([] as Project[]))
    ).subscribe(projects => {
      this.entrepreneurProjects = projects;
      this.syncSelectedProjectSelection();
      this.cdr.markForCheck();
    });
  }

  private getSpecialistMongoId(): string {
    return this.specialist?.mongoId || this.specialist?.specialistId || '';
  }

  private buildAvailabilityCalendar(): void {
    const slotMap = new Map<string, Availability[]>();
    this.availabilitySlots.forEach(slot => {
      const key = this.slotDayKey(slot);
      if (!key) return;
      slotMap.set(key, [...(slotMap.get(key) || []), slot]);
    });

    const monthStart = new Date(this.availabilityMonthCursor.getFullYear(), this.availabilityMonthCursor.getMonth(), 1);
    const monthEnd = new Date(this.availabilityMonthCursor.getFullYear(), this.availabilityMonthCursor.getMonth() + 1, 0);
    const startOffset = (monthStart.getDay() + 6) % 7;
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - startOffset);

    const endOffset = 6 - ((monthEnd.getDay() + 6) % 7);
    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(monthEnd.getDate() + endOffset);

    const todayKey = this.dayKey(new Date());
    const cells: AvailabilityDayCell[] = [];
    const cursor = new Date(calendarStart);

    while (cursor <= calendarEnd) {
      const key = this.dayKey(cursor);
      cells.push({
        dateKey: key,
        dayNumber: cursor.getDate(),
        inCurrentMonth: cursor.getMonth() === monthStart.getMonth(),
        isToday: key === todayKey,
        slots: slotMap.get(key) || []
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    this.availabilityCalendar = cells;
    this.availabilityMonthLabel = monthStart.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });
  }

  private syncSelectedAvailabilitySelection(): void {
    if (!this.availabilitySlots.length) {
      this.selectedAvailabilityDateKey = '';
      this.selectedAvailabilitySlotId = null;
      return;
    }

    const selectedSlotStillExists = this.selectedAvailabilitySlotId
      ? this.availabilitySlots.some(slot => slot.id === this.selectedAvailabilitySlotId)
      : false;

    if (selectedSlotStillExists) {
      const selectedSlot = this.availabilitySlots.find(slot => slot.id === this.selectedAvailabilitySlotId);
      if (selectedSlot) {
        this.selectedAvailabilityDateKey = this.slotDayKey(selectedSlot);
      }
      return;
    }

    const selectedDateStillExists = this.selectedAvailabilityDateKey
      ? this.availabilitySlots.some(slot => this.slotDayKey(slot) === this.selectedAvailabilityDateKey)
      : false;

    if (selectedDateStillExists) {
      const firstSlotOnDate = this.availabilitySlots.find(slot => this.slotDayKey(slot) === this.selectedAvailabilityDateKey);
      this.selectedAvailabilitySlotId = firstSlotOnDate?.id || null;
      return;
    }

    this.selectedAvailabilityDateKey = this.slotDayKey(this.availabilitySlots[0]);
    this.selectedAvailabilitySlotId = this.availabilitySlots[0].id;
  }

  private matchesSpecialist(assignment: ProjectAssignmentResponse, specialistId: string): boolean {
    const assignmentSpecialistId = String(assignment.specialistId || '');
    return assignmentSpecialistId === specialistId;
  }

  private isEvaluationEligibleAssignment(assignment: ProjectAssignmentResponse, specialistId: string): boolean {
    return this.matchesSpecialist(assignment, specialistId) && assignment.canEvaluate === true;
  }

  private slotTimestamp(slot: Availability): number {
    const date = this.toDate(slot.availableDate);
    const [hours, minutes] = String(slot.startTime || '00:00').split(':').map(Number);
    date.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
    return date.getTime();
  }

  private slotDayKey(slot: Availability): string {
    return this.dayKey(this.toDate(slot.availableDate));
  }

  private dayKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDate(value: Date | string): Date {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private formatCalendarDate(value: Date | string): string {
    return this.toDate(value).toLocaleDateString();
  }

  private historyTimestamp(item: ProjectAssignmentResponse): number {
    return new Date(
      item['completedAt'] ||
      item.doneAt ||
      item.respondedAt ||
      item['assignedAt'] ||
      item.createdAt ||
      0
    ).getTime();
  }

  private shortId(id?: string): string {
    return id ? id.slice(0, 8) : '';
  }

  private syncSelectedProjectSelection(): void {
    const selectedProjectId = String(this.slotRequestForm.controls.projectId.value || '');

    if (this.assignableProjects.length === 1) {
      const onlyProjectId = this.assignableProjects[0].id;
      if (selectedProjectId !== onlyProjectId) {
        this.slotRequestForm.patchValue({ projectId: onlyProjectId }, { emitEvent: false });
      }
      return;
    }

    if (selectedProjectId && !this.assignableProjects.some(project => project.id === selectedProjectId)) {
      this.slotRequestForm.patchValue({ projectId: '' }, { emitEvent: false });
    }
  }

  private showSlotRequestMessage(type: 'success' | 'error', message: string): void {
    this.slotRequestMessageType = type;
    this.slotRequestMessage = message;
  }

  private clearSlotRequestMessage(): void {
    this.slotRequestMessage = '';
    this.slotRequestMessageType = '';
  }

  private slotRequestErrorMessage(error: any): string {
    const backendMessage = String(error?.error?.message || error?.message || '').trim();

    if (backendMessage.includes('Project must be VALIDATED before assignment')) {
      return 'Only validated projects can request a slot.';
    }

    if (backendMessage.includes('Already assigned to this specialist')) {
      return 'This project already has assignment history with this specialist.';
    }

    if (backendMessage.includes('Specialist is not available')) {
      return 'This specialist is not available right now.';
    }

    return 'The slot request could not be created. Please try again.';
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
}
