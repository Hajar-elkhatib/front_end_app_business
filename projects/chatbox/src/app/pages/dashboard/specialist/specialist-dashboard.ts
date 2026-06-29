import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectAssignmentResponse } from '../../../models/assignment.model';
import { AssignmentService } from '../../../services/assignment.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-specialist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './specialist-dashboard.html',
  styleUrls: ['./specialist-dashboard.css']
})
export class SpecialistDashboard implements OnInit, OnDestroy {
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  pendingAssignments: ProjectAssignmentResponse[] = [];
  activeAssignments: ProjectAssignmentResponse[] = [];
  isLoading = true;
  isUpdatingAssignmentId: string | null = null;
  showToast = false;
  toastMessage = '';
  private toastTimer: number | undefined;

  ngOnInit() {
    this.loadAssignments();
  }

  ngOnDestroy() {
    window.clearTimeout(this.toastTimer);
  }

  private loadAssignments() {
    const specialistId = this.authService.currentUser?.id;
    if (!specialistId) {
      this.isLoading = false;
      this.pendingAssignments = [];
      this.activeAssignments = [];
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.assignmentService.getPendingAssignments(specialistId).subscribe({
      next: pending => {
        this.pendingAssignments = pending;
        this.assignmentService.getActiveAssignments(specialistId).subscribe({
          next: active => {
            this.activeAssignments = active;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.activeAssignments = [];
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.pendingAssignments = [];
        this.assignmentService.getActiveAssignments(specialistId).subscribe({
          next: active => {
            this.activeAssignments = active;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.activeAssignments = [];
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  respondToAssignment(assignment: ProjectAssignmentResponse, response: 'ACCEPTED' | 'REJECTED') {
    this.isUpdatingAssignmentId = assignment.id;
    this.assignmentService.respondToAssignment(assignment.id, { response }).subscribe({
      next: () => {
        this.isUpdatingAssignmentId = null;
        this.showToastMessage(response === 'ACCEPTED' ? 'Assignment accepted.' : 'Assignment rejected.');
        this.loadAssignments();
      },
      error: () => {
        this.isUpdatingAssignmentId = null;
        this.showToastMessage('Unable to update the assignment right now.');
      }
    });
  }

  markAsDone(assignment: ProjectAssignmentResponse) {
    this.isUpdatingAssignmentId = assignment.id;
    this.assignmentService.markAsDone(assignment.id).subscribe({
      next: () => {
        this.isUpdatingAssignmentId = null;
        this.showToastMessage('Assignment marked as done.');
        this.loadAssignments();
      },
      error: () => {
        this.isUpdatingAssignmentId = null;
        this.showToastMessage('Unable to mark the assignment as done.');
      }
    });
  }

  getProjectTitle(assignment: ProjectAssignmentResponse) {
    return assignment.project?.title || 'Untitled project';
  }

  getEntrepreneurName(assignment: ProjectAssignmentResponse) {
    return assignment.entrepreneur?.fullName || 'Unknown entrepreneur';
  }

  formatDate(value?: Date | string) {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  }

  getStatusLabel(status?: string) {
    switch (status) {
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      case 'DONE':
        return 'Done';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'ACCEPTED':
        return 'status-badge accepted';
      case 'REJECTED':
        return 'status-badge rejected';
      case 'DONE':
        return 'status-badge done';
      case 'CANCELLED':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.showToast = false;
    }, 2400);
  }
}
