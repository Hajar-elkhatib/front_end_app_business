import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminProject, AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div><p class="admin-kicker">Admin</p><h1>{{project?.title || 'Project Details'}}</h1><p class="admin-copy">Read-only project, saved AI analysis, reports, and support request context.</p></div>
        <a class="admin-action" routerLink="/admin/projects">Back to Projects</a>
      </header>
      <p *ngIf="errorMessage" class="admin-error">{{errorMessage}}</p>
      <div *ngIf="isLoading" class="table-empty">Loading project...</div>
      <div *ngIf="!isLoading && project as item" class="detail-grid">
        <section class="admin-panel">
          <div class="panel-title">Project Information</div>
          <div class="detail-block"><h3>Owner ID</h3><p>{{item.entrepreneurId}}</p></div>
          <div class="detail-block"><h3>Status</h3><span class="badge-pill badge-neutral">{{item.projectStatus}}</span></div>
          <div class="detail-block"><h3>Description</h3><p>{{item.description || 'No description available.'}}</p></div>
          <div class="detail-block"><h3>Market</h3><p>{{item.sector || '-'}} · {{item.country || '-'}} · {{item.region || '-'}}</p></div>
          <div class="detail-block"><h3>Metrics</h3><p>Team: {{item.teamSize}} · Revenue: {{item.revenueMillion}}M · Burn: {{item.burnRateMillion}}M</p></div>
          <div class="detail-block"><h3>Created</h3><p>{{item.createdAt}}</p></div>
        </section>
      </div>
    </section>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminProjectDetails implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  project?: AdminProject;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.adminService.getProject(id).subscribe({
      next: project => { this.project = project; this.isLoading = false; },
      error: () => { this.errorMessage = 'Project details could not be loaded.'; this.isLoading = false; }
    });
  }

  downloadUrl(reportId: string) {
    return this.adminService.downloadReportUrl(reportId);
  }
}
