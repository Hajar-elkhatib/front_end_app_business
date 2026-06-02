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
          <div class="detail-block"><h3>Owner</h3><p>{{item.entrepreneur?.fullName || item.entrepreneurId}}</p><p class="muted">{{item.entrepreneur?.email}}</p></div>
          <div class="detail-block"><h3>Status</h3><span class="badge-pill badge-neutral">{{item.analysisStatus}}</span></div>
          <div class="detail-block"><h3>Business Context</h3><p>{{item['description'] || 'No description available.'}}</p></div>
          <div class="detail-block"><h3>Market</h3><p>{{item.sector || '-'}} · {{item.country || '-'}} · {{item['region'] || '-'}}</p></div>
          <div class="detail-block"><h3>Metrics</h3><p>Team: {{item['teamSize'] || 0}} · Revenue: {{item['revenueMillion'] || 0}}M · Burn: {{item['burnRateMillion'] || 0}}M</p></div>
        </section>

        <aside class="admin-panel">
          <div class="panel-title">AI Summary</div>
          <div class="detail-block"><h3>Final Score</h3><p>{{item.finalScore ?? '-'}}</p><span *ngIf="item.riskLevel" class="badge-pill badge-neutral">{{item.riskLevel}}</span></div>
          <div class="detail-block"><h3>Prediction</h3><p>{{item.latestAnalysis?.predictionLabel || '-'}}</p></div>
          <div class="detail-block"><h3>Support Request</h3><p>{{item.supportRequest?.status || 'Not requested'}}</p></div>
        </aside>

        <section class="admin-panel">
          <div class="panel-title">Saved Analysis</div>
          <div *ngIf="!item.latestAnalysis" class="table-empty compact">No saved analysis for this project.</div>
          <ng-container *ngIf="item.latestAnalysis as analysis">
            <div class="detail-block"><h3>Strengths</h3><p>{{analysis.strengths || '-'}}</p></div>
            <div class="detail-block"><h3>Weaknesses</h3><p>{{analysis.weaknesses || '-'}}</p></div>
            <div class="detail-block"><h3>Recommendations</h3><p>{{analysis.recommendations || '-'}}</p></div>
            <div class="detail-block"><h3>Warnings</h3><p>{{analysis.warnings || '-'}}</p></div>
          </ng-container>
        </section>

        <section class="admin-panel">
          <div class="panel-title">Reports</div>
          <div *ngIf="!item.reports?.length" class="table-empty compact">No reports generated for this project.</div>
          <div *ngFor="let report of item.reports" class="summary-row">
            <span>{{report.title}}</span>
            <a class="admin-action" [href]="downloadUrl(report.id)" target="_blank">Download</a>
          </div>
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
