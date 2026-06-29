import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiSpecialistRecommendation } from '../../../models/analysis.model';
import { ProjectAssignmentResponse } from '../../../models/assignment.model';
import { Project } from '../../../models/project.model';
import { Specialist } from '../../../models/specialist.model';
import { AnalysisService } from '../../../services/analysis.service';
import { AssignmentService } from '../../../services/assignment.service';
import { AuthService } from '../../../services/auth.service';
import { ProjectService } from '../../../services/project.service';
import { SpecialistService } from '../../../services/specialist.service';

@Component({
  selector: 'app-specialist-recommendation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './specialist-recommendation.html',
  styleUrls: ['./specialist-recommendation.css']
})
export class SpecialistRecommendation implements OnInit {
  private route = inject(ActivatedRoute);
  private analysisService = inject(AnalysisService);
  private projectService = inject(ProjectService);
  private specialistService = inject(SpecialistService);
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
  projects: Project[] = [];
  results: AiSpecialistRecommendation[] = [];
  specialists: Specialist[] = [];
  assignments: ProjectAssignmentResponse[] = [];
  doneAssignments: ProjectAssignmentResponse[] = [];
  isLoading = false;
  isLoadingAssignments = false;
  isLoadingDoneAssignments = false;
  isAssigning = false;
  error = '';
  showAssignModal = false;
  showToast = false;
  toastMessage = '';
  assignmentMessage = '';
  selectedRecommendation: { specialistId: string; fullName: string; profession: string; averageRating: number; hourlyRate: number; availability: string; reason: string; skills?: string[] | string; recommendedScore: number; isAssigned: boolean } | null = null;

  ngOnInit() {
    this.projectService.refreshProjects().subscribe({
      next: projects => {
        this.projects = projects || [];
        this.cdr.markForCheck();
        if (this.projectId) {
          this.run();
          this.loadAssignments();
          this.loadDoneAssignments();
        }
      },
      error: () => {
        this.projects = [];
        this.cdr.markForCheck();
      }
    });

    this.specialistService.getSpecialists().subscribe({
      next: specialists => {
        this.specialists = specialists || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.specialists = [];
        this.cdr.markForCheck();
      }
    });
  }

  onProjectChange(value: string) {
    this.projectId = value;
    if (this.projectId) {
      this.run();
      this.loadAssignments();
      this.loadDoneAssignments();
    } else {
      this.results = [];
      this.error = '';
      this.assignments = [];
      this.doneAssignments = [];
    }
  }

  run() {
    if (!this.projectId) return;
    this.error = '';
    this.isLoading = true;
    this.analysisService.recommendSpecialists(this.projectId).subscribe({
      next: result => {
        this.results = result || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Recommendations could not be loaded. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAssignModal(item: { specialistId: string; fullName: string; profession: string; averageRating: number; hourlyRate: number; availability: string; reason: string; skills?: string[] | string; recommendedScore: number; isAssigned: boolean }) {
    this.selectedRecommendation = item;
    this.assignmentMessage = '';
    this.showAssignModal = true;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedRecommendation = null;
    this.assignmentMessage = '';
  }

  confirmAssign() {
    if (!this.selectedRecommendation || !this.projectId) {
      return;
    }

    const entrepreneurId = this.authService.currentUser?.id;
    if (!entrepreneurId) {
      this.error = 'You need to be signed in to assign a specialist.';
      return;
    }

    this.isAssigning = true;
    this.assignmentService.assignProject({
      projectId: this.projectId,
      entrepreneurId,
      specialistId: this.selectedRecommendation.specialistId,
      message: this.assignmentMessage.trim() || undefined
    }).subscribe({
      next: () => {
        this.isAssigning = false;
        this.closeAssignModal();
        this.showToastMessage('Assignment request sent successfully.');
        this.projectService.refreshProjects().subscribe();
        this.loadAssignments();
        this.loadDoneAssignments();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isAssigning = false;
        this.error = 'The assignment could not be created. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  loadAssignments() {
    const entrepreneurId = this.authService.currentUser?.id;
    if (!entrepreneurId || !this.projectId) {
      this.assignments = [];
      return;
    }

    this.isLoadingAssignments = true;
    this.assignmentService.getEntrepreneurAssignments(entrepreneurId).subscribe({
      next: assignments => {
        this.assignments = assignments.filter(assignment => assignment.projectId === this.projectId || assignment.project?.id === this.projectId);
        this.isLoadingAssignments = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.assignments = [];
        this.isLoadingAssignments = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadDoneAssignments() {
    const entrepreneurId = this.authService.currentUser?.id;
    if (!entrepreneurId || !this.projectId) {
      this.doneAssignments = [];
      return;
    }

    this.isLoadingDoneAssignments = true;
    this.assignmentService.getDoneAssignments(entrepreneurId).subscribe({
      next: assignments => {
        this.doneAssignments = assignments.filter(assignment => assignment.projectId === this.projectId || assignment.project?.id === this.projectId);
        this.isLoadingDoneAssignments = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.doneAssignments = [];
        this.isLoadingDoneAssignments = false;
        this.cdr.markForCheck();
      }
    });
  }

  get recommendationCards() {
    return this.results.map(item => {
      const specialist = this.specialists.find(candidate =>
        candidate.id === item.specialistId ||
        candidate.specialistId === item.specialistId ||
        candidate.fullName === item.specialistName
      );

      const existingAssignment = this.assignments.find(assignment =>
        assignment.projectId === this.projectId &&
        assignment.specialistId === item.specialistId &&
        ['PENDING', 'ACCEPTED'].includes((assignment.status || '').toUpperCase())
      );

      return {
        specialistId: item.specialistId,
        fullName: specialist?.fullName || item.specialistName || ('Recommended specialist #' + item.rank),
        profession: specialist?.profession || item.expertiseDomain || 'Advisor',
        averageRating: specialist?.averageRating || 0,
        hourlyRate: specialist?.hourlyRate || 0,
        availability: this.getAvailabilityLabel(specialist?.availabilityStatus || item.availability),
        availabilityClass: this.getAvailabilityClass(specialist?.availabilityStatus || item.availability),
        reason: item.reason,
        skills: item.skills,
        recommendedScore: item.recommendedScore,
        isAssigned: !!existingAssignment
      };
    });
  }

  getAssignmentStatusLabel(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'Waiting for specialist response';
      case 'ACCEPTED': return 'In Progress';
      case 'REJECTED': return 'Rejected';
      case 'DONE': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Pending';
    }
  }

  getAssignmentStatusClass(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'pending';
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'rejected';
      case 'DONE': return 'done';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  }

  formatSkills(skills?: string[] | string): string {
    if (Array.isArray(skills)) return skills.join(', ');
    return skills || 'Project expertise, strategy, market';
  }

  private getAvailabilityLabel(status?: string): string {
    if (!status) return 'To confirm';
    return status.toUpperCase() === 'AVAILABLE' ? 'Available' : 'Busy';
  }

  private getAvailabilityClass(status?: string): string {
    return (status || '').toUpperCase() === 'AVAILABLE' ? 'available' : 'unavailable';
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    window.clearTimeout(this.toastTimer as any);
    this.toastTimer = window.setTimeout(() => {
      this.showToast = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  private toastTimer: number | undefined;
}
