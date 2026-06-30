import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminProject, AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div><p class="admin-kicker">Admin</p><h1>Projects</h1><p class="admin-copy">Monitor saved projects, analysis state, scores, risks, and reports.</p></div>
        <button class="admin-refresh" type="button" (click)="loadProjects()">Refresh</button>
      </header>
      <div class="filters">
        <input class="input" placeholder="Search projects" [(ngModel)]="search" (ngModelChange)="loadProjects()" />
        <select class="input" [(ngModel)]="status" (ngModelChange)="loadProjects()"><option value="">All statuses</option><option>DRAFT</option><option>SUBMITTED</option><option>ANALYZING</option><option>VALIDATED</option><option>COMPLETED</option><option>REJECTED</option></select>
        <input class="input" placeholder="Sector" [(ngModel)]="sector" (ngModelChange)="loadProjects()" />
      </div>
      <p *ngIf="errorMessage" class="admin-error">{{errorMessage}}</p>
      <div *ngIf="isLoading" class="table-empty">Loading projects...</div>
      <div *ngIf="!isLoading && !projects.length" class="table-empty">No projects match these filters.</div>
      <div *ngIf="!isLoading && projects.length" class="table-scroll">
        <table class="admin-table">
          <thead><tr><th>Project Name</th><th>Entrepreneur ID</th><th>Sector</th><th>Created At</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let project of projects">
              <td>{{project.title || 'Untitled project'}}</td>
              <td>{{project.entrepreneurId}}</td>
              <td>{{project.sector || '-'}}</td>
              <td>{{project.createdAt | date:'mediumDate'}}</td>
              <td><span class="badge-pill badge-neutral">{{project.projectStatus}}</span></td>
              <td class="actions"><a class="admin-action" [routerLink]="['/admin/projects', project.id]">View</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminProjects implements OnInit {
  private adminService = inject(AdminService);
  projects: AdminProject[] = [];
  search = '';
  status = '';
  sector = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit() { this.loadProjects(); }

  loadProjects() {
    this.isLoading = true;
    this.adminService.getProjects({ search: this.search, status: this.status, sector: this.sector }).subscribe({
      next: projects => { this.projects = projects; this.isLoading = false; },
      error: () => { this.errorMessage = 'Projects could not be loaded.'; this.isLoading = false; }
    });
  }
}
