import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { AssignmentService } from '../../../services/assignment.service';
import { AuthService } from '../../../services/auth.service';
import { AvailabilityService } from '../../../services/availability.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { HumChat } from '../../../services/hum-chat';
import { ProjectService } from '../../../services/project.service';
import { Review, ReviewService } from '../../../services/review.service';
import { SpecialistService } from '../../../services/specialist.service';
import { ProjectAssignmentResponse } from '../../../models/assignment.model';
import { Conversation, ConversationMessage, SendMessageRequest } from '../../../models/chat.model';
import { Evaluation } from '../../../models/evaluation.model';
import { Project } from '../../../models/project.model';
import { Availability, Specialist } from '../../../models/specialist.model';

type DashboardTab = 'overview' | 'assignments' | 'availability' | 'messaging' | 'completed';

interface EnrichedAssignment extends ProjectAssignmentResponse {
  projectTitle: string;
  entrepreneurName: string;
  slotLabel: string;
}

interface SpecialistFeedbackView {
  id: string;
  reviewerName: string;
  comment: string;
  rating: number;
  createdAt?: Date | string;
}

interface AvailabilityCalendarDay {
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  slots: Availability[];
}

@Component({
  selector: 'app-specialist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './specialist-dashboard.html',
  styleUrls: ['./specialist-dashboard.css']
})
export class SpecialistDashboard implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageScroll') private messageScroll?: ElementRef<HTMLDivElement>;

  private assignmentService = inject(AssignmentService);
  private availabilityService = inject(AvailabilityService);
  private evaluationService = inject(EvaluationService);
  private specialistService = inject(SpecialistService);
  private humChat = inject(HumChat);
  private projectService = inject(ProjectService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  activeTab: DashboardTab = 'overview';
  specialist: Specialist | null = null;
  specialistId = '';
  userId = '';

  pendingAssignments: EnrichedAssignment[] = [];
  activeAssignments: EnrichedAssignment[] = [];
  completedAssignments: EnrichedAssignment[] = [];
  evaluations: Evaluation[] = [];
  reviews: SpecialistFeedbackView[] = [];
  availabilitySlots: Availability[] = [];
  availabilityCalendar: AvailabilityCalendarDay[] = [];
  conversations: Conversation[] = [];
  messages: ConversationMessage[] = [];
  activeConversation: Conversation | null = null;

  newMessage = '';
  rejectMessage = '';
  errorMessage = '';
  successMessage = '';
  isLoading = true;
  isSavingSlot = false;
  isSending = false;
  connectionReady = false;
  availabilityMonthLabel = '';
  selectedAvailabilityDateKey = '';
  readonly weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private availabilityMonthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  slotForm = this.fb.group({
    availableDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    maxSessions: [1, [Validators.required, Validators.min(1)]]
  });

  private messageSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  private conversationsSubscription?: Subscription;
  private shouldScrollMessages = false;

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const tab = data['tab'] as DashboardTab | undefined;
      if (tab) this.activeTab = tab;
    });

    this.route.queryParamMap.subscribe(params => {
      const section = params.get('section') as DashboardTab | null;
      if (section && ['overview', 'assignments', 'availability', 'messaging', 'completed'].includes(section)) {
        this.activeTab = section;
      }
    });

    this.slotForm.controls.availableDate.valueChanges.subscribe(value => {
      this.selectedAvailabilityDateKey = String(value || '');
      if (this.selectedAvailabilityDateKey) {
        const selectedDate = this.toDate(this.selectedAvailabilityDateKey);
        this.availabilityMonthCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      }
      this.buildAvailabilityCalendar();
      this.cdr.markForCheck();
    });

    this.resolveIdentity();
    if (!this.userId && !this.specialistId) {
      this.isLoading = false;
      this.errorMessage = 'Specialist session is missing. Please log in again.';
      return;
    }

    this.humChat.setCurrentUser(this.specialistId || this.userId, 'SPECIALIST');

    this.messageSubscription = this.humChat.onMessage().subscribe(message => {
      if (message.conversationId !== this.activeConversation?.id) return;
      this.messages = [...this.messages.filter(existing => existing.id !== message.id), message];
      this.updateConversationPreview(message);
      this.isSending = false;
      this.shouldScrollMessages = true;
      this.cdr.markForCheck();
    });

    this.connectionSubscription = this.humChat.isConnected().subscribe(isConnected => {
      this.connectionReady = isConnected;
      this.cdr.markForCheck();
    });

    this.conversationsSubscription = this.humChat.conversations$.subscribe(conversations => {
      this.conversations = conversations;
      if (this.activeConversation) {
        this.activeConversation = conversations.find(conversation => conversation.id === this.activeConversation?.id) || this.activeConversation;
      }
      this.cdr.markForCheck();
    });

    this.loadDashboard();
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollMessages) return;
    this.scrollMessagesToBottom();
    this.shouldScrollMessages = false;
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.conversationsSubscription?.unsubscribe();
    this.humChat.disconnect();
  }

  setTab(tab: DashboardTab): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge'
    });
  }

  acceptAssignment(assignment: EnrichedAssignment): void {
    this.assignmentService.respondToAssignment(assignment.id, { status: 'ACCEPTED' }).subscribe({
      next: () => {
        this.successMessage = 'Assignment accepted. The conversation is ready.';
        this.setTab('messaging');
        this.loadDashboard(false);
      },
      error: () => this.errorMessage = 'Assignment could not be accepted.'
    });
  }

  rejectAssignment(assignment: EnrichedAssignment): void {
    this.assignmentService.respondToAssignment(assignment.id, {
      status: 'REJECTED',
      responseMessage: this.rejectMessage || 'Request rejected.'
    }).subscribe({
      next: () => {
        this.successMessage = 'Assignment rejected and the slot stayed open.';
        this.rejectMessage = '';
        this.loadDashboard(false);
      },
      error: () => this.errorMessage = 'Assignment could not be rejected.'
    });
  }

  markDone(assignment: EnrichedAssignment): void {
    this.assignmentService.markAsDone(assignment.id).subscribe({
      next: () => {
        this.successMessage = 'Assignment marked as done.';
        this.loadDashboard(false);
      },
      error: () => this.errorMessage = 'Assignment could not be marked as done.'
    });
  }

  addSlot(): void {
    if (!this.specialistId) {
      this.errorMessage = 'Specialist identifier is missing.';
      return;
    }

    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      return;
    }

    const value = this.slotForm.getRawValue();
    const availableDate = String(value.availableDate || '');
    if (!availableDate || this.isPastDateKey(availableDate)) {
      this.errorMessage = 'Availability slots can only be opened for today or future dates.';
      return;
    }

    this.isSavingSlot = true;
    this.availabilityService.addSlot({
      specialistId: this.specialistId,
      availableDate,
      startTime: String(value.startTime || ''),
      endTime: String(value.endTime || ''),
      maxSessions: Number(value.maxSessions || 1)
    }).pipe(finalize(() => this.isSavingSlot = false)).subscribe({
      next: () => {
        this.successMessage = 'Availability slot added.';
        this.slotForm.reset({ availableDate: '', startTime: '', endTime: '', maxSessions: 1 });
        this.loadAvailability();
      },
      error: () => this.errorMessage = 'Availability slot could not be added.'
    });
  }

  cancelSlot(slot: Availability): void {
    if (slot.status !== 'OPEN') return;
    this.availabilityService.cancelSlot(slot.id).subscribe({
      next: () => {
        this.successMessage = 'Slot cancelled.';
        this.loadAvailability();
      },
      error: () => this.errorMessage = 'Slot could not be cancelled.'
    });
  }

  deleteSlot(slot: Availability): void {
    if (!['OPEN', 'CANCELLED'].includes(String(slot.status || '').toUpperCase())) return;
    this.availabilityService.deleteSlot(slot.id).subscribe({
      next: () => {
        this.successMessage = 'Slot deleted.';
        this.loadAvailability();
      },
      error: () => this.errorMessage = 'Slot could not be deleted.'
    });
  }

  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
    this.markConversationAsRead(conversation.id);
    this.humChat.connect(conversation.id);
    this.humChat.getMessages(conversation.id).subscribe({
      next: messages => {
        this.messages = messages;
        this.shouldScrollMessages = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messages = [];
        this.errorMessage = 'Messages could not be loaded.';
        this.cdr.markForCheck();
      }
    });
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content || !this.activeConversation || !this.specialistId || this.isSending) return;

    const request: SendMessageRequest = {
      conversationId: this.activeConversation.id,
      senderId: this.specialistId,
      role: 'SPECIALIST',
      senderType: 'SPECIALIST',
      content
    };

    this.isSending = true;
    this.newMessage = '';
    if (!this.connectionReady) {
      this.isSending = false;
      this.errorMessage = 'Chat is still connecting. Try again in a moment.';
      return;
    }
    this.humChat.sendMessageWS(request);
  }

  openConversationPage(): void {
    const queryParams = this.activeConversation ? { conversationId: this.activeConversation.id } : {};
    this.router.navigate(['/conversations'], { queryParams });
  }

  get ratingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get completedCount(): number {
    return this.specialist?.completedProjects || this.completedAssignments.length;
  }

  get reviewCount(): number {
    return this.reviews.length;
  }

  get averageScore(): number {
    return this.evaluationService.computeAverageScore(this.evaluations);
  }

  get showOverviewChrome(): boolean {
    return this.activeTab === 'overview';
  }

  get currentSectionTitle(): string {
    switch (this.activeTab) {
      case 'assignments': return 'Assignments';
      case 'availability': return 'Availability Calendar';
      case 'messaging': return 'Conversations';
      case 'completed': return 'Evaluations & Reviews';
      default: return 'Specialist Dashboard';
    }
  }

  get currentSectionDescription(): string {
    switch (this.activeTab) {
      case 'assignments': return 'Review incoming project requests and close active work when it is finished.';
      case 'availability': return 'Open new days from the calendar and manage your published time slots.';
      case 'messaging': return 'Stay connected with entrepreneurs and keep project conversations moving.';
      case 'completed': return 'See the feedback, scores, and completed work history attached to your profile.';
      default: return 'Manage requests, active consulting work, availability, and conversations.';
    }
  }

  get selectedAvailabilityDateLabel(): string {
    if (!this.selectedAvailabilityDateKey) {
      return 'Choose a day in the calendar, then set the time window and save the slot.';
    }

    return `Selected day: ${this.formatDate(this.selectedAvailabilityDateKey)}`;
  }

  get minAvailabilityDate(): string {
    return this.dayKey(new Date());
  }

  isStarFilled(star: number): boolean {
    return Number(this.specialist?.averageRating || 0) >= star;
  }

  badgeClass(status?: string): string {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'AVAILABLE' || normalized === 'OPEN' || normalized === 'DONE' || normalized === 'ACCEPTED') return 'status-good';
    if (normalized === 'BOOKED' || normalized === 'PENDING') return 'status-warn';
    if (normalized === 'BUSY' || normalized === 'CANCELLED' || normalized === 'REJECTED') return 'status-bad';
    return 'status-neutral';
  }

  formatDate(value?: Date | string): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  }

  formatDateTime(value?: Date | string): string {
    if (!value) return '';
    return new Date(value).toLocaleString();
  }

  changeAvailabilityMonth(offset: number): void {
    const nextMonth = new Date(this.availabilityMonthCursor);
    nextMonth.setMonth(nextMonth.getMonth() + offset);
    this.availabilityMonthCursor = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    this.buildAvailabilityCalendar();
    this.cdr.markForCheck();
  }

  selectAvailabilityDay(day: AvailabilityCalendarDay): void {
    if (day.isPast) {
      return;
    }

    this.slotForm.patchValue({ availableDate: day.dateKey });
    this.selectedAvailabilityDateKey = day.dateKey;
    this.buildAvailabilityCalendar();
    this.cdr.markForCheck();
  }

  private loadDashboard(showLoading = true): void {
    if (showLoading) this.isLoading = true;
    this.errorMessage = '';

    this.loadProfile().pipe(
      switchMap(() => forkJoin({
        pending: this.assignmentService.getPendingAssignments(this.specialistId).pipe(catchError(() => of([]))),
        active: this.assignmentService.getActiveAssignments(this.specialistId).pipe(catchError(() => of([]))),
        allAssignments: this.assignmentService.getSpecialistAssignments(this.specialistId).pipe(catchError(() => of([]))),
        evaluations: this.evaluationService.getSpecialistEvaluations(this.specialistId).pipe(catchError(() => of([]))),
        writtenReviews: this.reviewService.getSpecialistReviews(this.specialistId).pipe(catchError(() => of([]))),
        slots: this.availabilityService.getBySpecialist(this.specialistId).pipe(catchError(() => of([]))),
        conversations: this.humChat.getConversationsBySpecialist(this.specialistId).pipe(catchError(() => of([])))
      })),
      switchMap(result => {
        this.availabilitySlots = result.slots;
        this.buildAvailabilityCalendar();
        this.conversations = result.conversations;
        this.evaluations = result.evaluations;
        this.reviews = this.buildFeedbackViews(result.writtenReviews, result.evaluations).sort((a, b) => {
          const left = new Date(a.createdAt || 0).getTime();
          const right = new Date(b.createdAt || 0).getTime();
          return right - left;
        });
        return forkJoin({
          pending: this.enrichAssignments(result.pending, result.slots),
          active: this.enrichAssignments(result.active, result.slots),
          completed: this.enrichAssignments(result.allAssignments.filter(item => item.status === 'DONE'), result.slots)
        });
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: result => {
        this.pendingAssignments = result.pending;
        this.activeAssignments = result.active;
        this.completedAssignments = result.completed;
        if (!this.activeConversation && this.conversations.length > 0) {
          this.selectConversation(this.conversations[0]);
        }
      },
      error: () => {
        this.errorMessage = 'Specialist dashboard could not be loaded.';
      }
    });
  }

  private loadProfile() {
    const preferredId = this.specialistId || this.userId;
    const fallbackUserId = this.userId || preferredId;

    return this.specialistService.getSpecialist(preferredId).pipe(
      catchError(() => this.specialistService.getProfile(fallbackUserId)),
      switchMap(specialist => {
        this.specialist = specialist;
        this.specialistId = specialist.mongoId || specialist.specialistId || specialist.id || this.specialistId;
        if (!this.userId) this.userId = specialist.userId || specialist.id || '';
        this.humChat.setCurrentUser(this.specialistId || this.userId, 'SPECIALIST');
        return of(specialist);
      })
    );
  }

  private loadAvailability(): void {
    if (!this.specialistId) return;
    this.availabilityService.getBySpecialist(this.specialistId).subscribe({
      next: slots => {
        this.availabilitySlots = slots;
        this.buildAvailabilityCalendar();
        this.cdr.markForCheck();
      },
      error: () => this.errorMessage = 'Availability could not be refreshed.'
    });
  }

  private enrichAssignments(assignments: ProjectAssignmentResponse[], slots: Availability[]) {
    if (!assignments.length) return of([] as EnrichedAssignment[]);

    const projectCalls = assignments.map(assignment =>
      this.projectService.getProjectById(assignment.projectId).pipe(catchError(() => of(undefined)))
    );

    return forkJoin(projectCalls).pipe(
      switchMap(projects => of(assignments.map((assignment, index) => {
        const project = projects[index];
        return this.toEnrichedAssignment(assignment, project, slots);
      })))
    );
  }

  private toEnrichedAssignment(assignment: ProjectAssignmentResponse, project: Project | undefined, slots: Availability[]): EnrichedAssignment {
    const assignmentProject = assignment.project;
    const entrepreneur = assignment.entrepreneur;
    const availabilityId = String(assignment['availabilityId'] || '');
    const slot = slots.find(item => item.id === availabilityId);

    return {
      ...assignment,
      projectTitle: project?.title || assignmentProject?.title || `Project ${this.shortId(assignment.projectId)}`,
      entrepreneurName: entrepreneur?.fullName || `Entrepreneur ${this.shortId(assignment.entrepreneurId)}`,
      slotLabel: this.slotLabel(slot, assignment)
    };
  }

  private slotLabel(slot: Availability | undefined, assignment: ProjectAssignmentResponse): string {
    if (slot) return `${this.formatDate(slot.availableDate)} · ${slot.startTime} - ${slot.endTime}`;

    const date = assignment['availableDate'];
    const start = assignment['startTime'];
    const end = assignment['endTime'];
    if (date || start || end) return `${this.formatDate(date as string)} · ${start || '-'} - ${end || '-'}`;

    return 'Slot selected';
  }

  private resolveIdentity(): void {
    const rawUser = localStorage.getItem('nexus_user');
    const directUserId = localStorage.getItem('userId') || localStorage.getItem('user_id') || '';
    const directSpecialistId = localStorage.getItem('specialistId') || localStorage.getItem('specialist_id') || '';

    this.userId = this.authService.currentUser?.id || directUserId;
    this.specialistId = directSpecialistId;

    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as { id?: string; userId?: string; specialistId?: string; mongoId?: string };
        this.userId = this.userId || user.id || user.userId || '';
        this.specialistId = this.specialistId || user.specialistId || user.mongoId || '';
      } catch {
        this.userId = this.userId || '';
      }
    }
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

  private markConversationAsRead(conversationId: string): void {
    this.humChat.markConversationAsRead(conversationId).subscribe();
  }

  private buildAvailabilityCalendar(): void {
    const today = new Date();
    const todayKey = this.dayKey(today);
    const slotMap = new Map<string, Availability[]>();

    this.availabilitySlots.forEach(slot => {
      const key = this.dayKey(this.toDate(slot.availableDate));
      slotMap.set(key, [...(slotMap.get(key) || []), slot]);
    });

    const selectedDate = this.selectedAvailabilityDateKey ? this.toDate(this.selectedAvailabilityDateKey) : null;
    if (selectedDate) {
      this.availabilityMonthCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }

    const monthStart = new Date(this.availabilityMonthCursor.getFullYear(), this.availabilityMonthCursor.getMonth(), 1);
    const monthEnd = new Date(this.availabilityMonthCursor.getFullYear(), this.availabilityMonthCursor.getMonth() + 1, 0);
    const startOffset = (monthStart.getDay() + 6) % 7;
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - startOffset);

    const endOffset = 6 - ((monthEnd.getDay() + 6) % 7);
    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(monthEnd.getDate() + endOffset);

    const cells: AvailabilityCalendarDay[] = [];
    const cursor = new Date(calendarStart);

    while (cursor <= calendarEnd) {
      const dateKey = this.dayKey(cursor);
      const currentDate = new Date(cursor);
      const isPast = currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      cells.push({
        dateKey,
        dayNumber: currentDate.getDate(),
        inCurrentMonth: currentDate.getMonth() === monthStart.getMonth(),
        isToday: dateKey === todayKey,
        isPast,
        slots: slotMap.get(dateKey) || []
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    this.availabilityCalendar = cells;
    this.availabilityMonthLabel = monthStart.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });
  }

  private scrollMessagesToBottom(): void {
    const element = this.messageScroll?.nativeElement;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }

  private dayKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isPastDateKey(value: string): boolean {
    return value < this.dayKey(new Date());
  }

  private toDate(value: Date | string): Date {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private shortId(id?: string): string {
    return id ? id.slice(0, 8) : '';
  }

  private buildFeedbackViews(writtenReviews: Review[], evaluations: Evaluation[]): SpecialistFeedbackView[] {
    const byEntrepreneur = new Map<string, SpecialistFeedbackView>();

    writtenReviews.forEach(review => {
      byEntrepreneur.set(review.entrepreneurId, {
        id: review.id,
        reviewerName: review.reviewerName || `Entrepreneur ${this.shortId(review.entrepreneurId)}`,
        comment: review.comment || '',
        rating: 0,
        createdAt: review.createdAt
      });
    });

    evaluations.forEach(evaluation => {
      const existing = byEntrepreneur.get(evaluation.entrepreneurId);
      const base: SpecialistFeedbackView = existing || {
        id: evaluation.id,
        reviewerName: evaluation.entrepreneurName || `Entrepreneur ${this.shortId(evaluation.entrepreneurId)}`,
        comment: '',
        rating: 0,
        createdAt: evaluation.createdAt
      };

      byEntrepreneur.set(evaluation.entrepreneurId, {
        ...base,
        rating: Number(evaluation.score || 0),
        createdAt: base.createdAt || evaluation.createdAt
      });
    });

    return [...byEntrepreneur.values()];
  }
}
