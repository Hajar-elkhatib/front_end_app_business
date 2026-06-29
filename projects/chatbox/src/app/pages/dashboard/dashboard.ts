import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  projects: Project[] = [];
  recentProjects: Project[] = [];
  spotlightProject: Project | undefined;
  isLoading = true;

  totalProjects = 0;
  submittedProjects = 0;
  draftProjects = 0;
  sectorsTracked = 0;
  averageGrowth = 0;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.recentProjects = data.slice(0, 5);
        this.spotlightProject = data.find(project => project.projectStatus === 'SUBMITTED') || data[0];
        this.totalProjects = data.length;
        this.submittedProjects = data.filter(project => project.projectStatus === 'SUBMITTED').length;
        this.draftProjects = data.filter(project => project.projectStatus !== 'SUBMITTED').length;
        this.sectorsTracked = new Set(data.map(project => project.sector).filter(Boolean)).size;
        this.averageGrowth = data.length
          ? Math.round(data.reduce((sum, project) => sum + (project.marketGrowthRatePercent || 0), 0) / data.length)
          : 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openSpecialists() {
    this.router.navigate(['/specialists']);
  }

  openConversations() {
    this.router.navigate(['/conversations']);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'active': return 'badge-progress';
      case 'planning': return 'badge-idea';
      case 'completed': return 'badge-launched';
      case 'on-hold': return 'badge-improving';
      case 'pending': return 'badge-idea';
      default: return 'badge-idea';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'active': return 'In Progress';
      case 'planning': return 'Planning';
      case 'completed': return 'Completed';
      case 'on-hold': return 'On Hold';
      case 'pending': return 'Pending';
      default: return status || 'Draft';
    }
  }
}
