import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  project: Project | undefined;
  isLoading = true;
  showDeleteModal = false;
  isDeleting = false;

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
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
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
      this.cdr.markForCheck();
      this.router.navigate(['/projects']);
    });
  }

  getStatusClass(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 'status-active';
      case 'DRAFT': return 'status-planning';
      case 'COMPLETED': return 'status-completed';
      case 'ON_HOLD': return 'status-hold';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }

  getStatusLabel(status?: string): string {
    return (status || 'DRAFT').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }
}
