import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-details.html',
  styleUrls: ['./project-details.css']
})
export class ProjectDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  project: Project | undefined;
  isLoading = true;
  showDeleteModal = false;
  isDeleting = false;
  isGeneratingReport = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProjectDetails(id);
      }
    });
  }

  loadProjectDetails(id: string) {
    this.isLoading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/projects']);
      }
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.project) return;
    this.isDeleting = true;
    this.projectService.deleteProject(this.project.id).subscribe(() => {
      this.isDeleting = false;
      this.showDeleteModal = false;
      this.router.navigate(['/projects']);
    });
  }

  generateReport() {
    if (!this.project) return;
    this.isGeneratingReport = true;
    setTimeout(() => {
      this.isGeneratingReport = false;
      alert(`AI Cryptographic Report successfully generated for "${this.project?.title}". Check your system downloads.`);
    }, 1500);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'planning': return 'status-planning';
      case 'completed': return 'status-completed';
      case 'on-hold': return 'status-hold';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'In Progress';
      case 'planning': return 'Planning';
      case 'completed': return 'Completed';
      case 'on-hold': return 'On Hold';
      case 'pending': return 'Pending';
      default: return status;
    }
  }

  getPriorityClass(priority?: string): string {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  // Get active timeline index based on status
  getTimelineStepStatus(stepIndex: number): 'completed' | 'active' | 'pending' {
    if (!this.project) return 'pending';
    const status = this.project.status;
    
    // Step index: 0 = created, 1 = analysis, 2 = specialist, 3 = development, 4 = review, 5 = deployed
    let currentStep = 0;
    if (status === 'planning') currentStep = 1;
    else if (status === 'pending') currentStep = 2;
    else if (status === 'active') currentStep = 3;
    else if (status === 'completed') currentStep = 5; // All done!
    else if (status === 'on-hold') currentStep = 3; // Kept at dev

    // If specialist is assigned, step 2 is definitely completed
    if (this.project.assignedSpecialistId && currentStep < 3) {
      currentStep = 3;
    }

    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  }
}
