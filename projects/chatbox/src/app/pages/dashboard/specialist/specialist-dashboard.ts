import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project } from '../../../models/project.model';
import { AssignmentService } from '../../../services/assignment.service';
import { AuthService } from '../../../services/auth.service';
import { SpecialistService } from '../../../services/specialist.service';

@Component({
  selector: 'app-specialist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './specialist-dashboard.html',
  styleUrls: ['./specialist-dashboard.css']
})
export class SpecialistDashboard implements OnInit {
  private assignmentService = inject(AssignmentService);
  private specialistService = inject(SpecialistService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  assignedProjects: Project[] = [];
  isLoading = true;

  ngOnInit() {
    const currentUserId = this.authService.currentUser?.id;
    if (!currentUserId) {
      this.isLoading = false;
      this.assignedProjects = [];
      return;
    }

    this.specialistService.getProfile(currentUserId).subscribe({
      next: specialist => {
        const specialistId = specialist.mongoId || specialist.specialistId || specialist.id;
        if (!specialistId) {
          this.assignedProjects = [];
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }

        this.assignmentService.getActiveAssignments(specialistId).subscribe({
          next: assignments => {
            this.assignedProjects = assignments.map(assignment => this.assignmentService.toProjectLike(assignment) as Project);
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.assignedProjects = [];
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.assignedProjects = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
