import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-specialist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './specialist-dashboard.html',
  styleUrls: ['./specialist-dashboard.css']
})
export class SpecialistDashboard implements OnInit {
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);

  assignedProjects: Project[] = [];
  isLoading = true;

  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: projects => {
        this.assignedProjects = projects;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.assignedProjects = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
