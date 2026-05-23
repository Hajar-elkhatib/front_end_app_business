import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-entrepreneur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './entrepreneur-dashboard.html',
  styleUrls: ['./entrepreneur-dashboard.css']
})
export class EntrepreneurDashboard implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  projects: Project[] = [];
  recentProjects: Project[] = [];
  isLoading = true;
  showReadiness = true;
  totalProjects = 0;
  submittedProjects = 0;
  draftProjects = 0;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.recentProjects = projects.slice(0, 5);
        this.totalProjects = projects.length;
        this.submittedProjects = projects.filter(project => project.projectStatus === 'SUBMITTED').length;
        this.draftProjects = projects.filter(project => project.projectStatus !== 'SUBMITTED').length;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openProjects() {
    this.router.navigate(['/projects']);
  }

  createProject() {
    this.router.navigate(['/projects/create']);
  }

  dismissReadiness() {
    this.showReadiness = false;
  }

  getStatusClass(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 'badge-progress';
      case 'COMPLETED': return 'badge-launched';
      case 'ON_HOLD': return 'badge-improving';
      default: return 'badge-idea';
    }
  }

  getStatusLabel(status?: string): string {
    return (status || 'DRAFT').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }
}
