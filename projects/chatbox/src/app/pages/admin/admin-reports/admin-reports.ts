import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminReport, AdminService, DashboardSummary } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div>
          <p class="admin-kicker">Admin</p>
          <h1>Reports</h1>
          <p class="admin-copy">Review generated reports and platform summaries.</p>
        </div>
        <button class="admin-refresh" type="button" (click)="loadReports()" [disabled]="isLoading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </header>

      <!-- Stat Cards from Summary -->
      <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1.5rem;" *ngIf="summary">
        <article class="stat-card" data-accent="indigo">
          <div class="stat-card-top">
            <span class="stat-icon" data-accent="indigo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
            <span class="stat-label">Projects</span>
          </div>
          <strong class="stat-value">{{summary.totalProjects}}</strong>
        </article>
        
        <article class="stat-card" data-accent="orange">
          <div class="stat-card-top">
            <span class="stat-icon" data-accent="orange"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
            <span class="stat-label">Complaints</span>
          </div>
          <strong class="stat-value">{{summary.totalComplaints || 0}}</strong>
        </article>

        <article class="stat-card" data-accent="teal">
          <div class="stat-card-top">
            <span class="stat-icon" data-accent="teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
            <span class="stat-label">Reviews</span>
          </div>
          <strong class="stat-value">{{summary.totalReviews || 0}}</strong>
        </article>

        <article class="stat-card" data-accent="purple">
          <div class="stat-card-top">
            <span class="stat-icon" data-accent="purple"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg></span>
            <span class="stat-label">Evaluations</span>
          </div>
          <strong class="stat-value">{{summary.totalEvaluations || 0}}</strong>
        </article>
      </div>

      <div class="panel-header-row" style="margin-bottom: 1rem">
        <h2 style="font-size:1.1rem;font-weight:700">Project Reports</h2>
        <div class="actions">
          <button class="admin-action" type="button" (click)="exportToExcel()">Export Excel</button>
        </div>
      </div>

      <div *ngIf="errorMessage" class="admin-error">
        <span>{{errorMessage}}</span>
        <button type="button" class="error-retry" (click)="loadReports()">Retry</button>
      </div>

      <div *ngIf="isLoading" class="skeleton-grid skeleton-grid-sm">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
      </div>

      <div *ngIf="!isLoading && !reports.length" class="table-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.75rem;display:block;opacity:.35"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        No reports have been generated yet.
      </div>

      <div *ngIf="!isLoading && reports.length" class="table-scroll">
        <table class="admin-table" id="reportsTable">
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Project</th>
              <th>Entrepreneur</th>
              <th>Generated Date</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let report of reports">
              <td style="font-weight:600">{{report.title}}</td>
              <td>{{report.project || report.projectId}}</td>
              <td>{{report.entrepreneur?.fullName || '—'}}</td>
              <td>{{report.createdAt | date:'mediumDate'}}</td>
              <td><span class="badge-pill badge-neutral">{{report.reportType || 'REPORT'}}</span></td>
              <td class="actions">
                <a class="admin-action" [href]="downloadUrl(report.id)" target="_blank" style="text-decoration:none">Export PDF</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminReports implements OnInit {
  private adminService = inject(AdminService);
  
  reports: AdminReport[] = [];
  summary?: DashboardSummary;
  
  isLoading = true;
  errorMessage = '';

  ngOnInit() { 
    this.loadReports(); 
    this.loadSummary();
  }

  loadReports() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getReports().subscribe({
      next: reports => { this.reports = reports; this.isLoading = false; },
      error: () => { this.errorMessage = 'Reports could not be loaded.'; this.isLoading = false; }
    });
  }

  loadSummary() {
    this.adminService.getDashboardStatistics().subscribe({
      next: s => this.summary = s,
      error: () => console.warn('Could not load summary for reports page')
    });
  }

  downloadUrl(reportId: string) {
    return this.adminService.downloadReportUrl(reportId);
  }

  exportToExcel() {
    // Basic CSV/Excel fallback export
    if (!this.reports.length) return;
    
    let csv = 'Report Title,Project,Entrepreneur,Generated Date,Type\n';
    const pipe = new DatePipe('en-US');
    
    this.reports.forEach(r => {
      const title = `"${(r.title || '').replace(/"/g, '""')}"`;
      const proj = `"${(r.project || r.projectId || '').replace(/"/g, '""')}"`;
      const user = `"${(r.entrepreneur?.fullName || '').replace(/"/g, '""')}"`;
      const date = pipe.transform(r.createdAt, 'mediumDate') || '';
      const type = r.reportType || 'REPORT';
      
      csv += `${title},${proj},${user},${date},${type}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'admin_reports.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
