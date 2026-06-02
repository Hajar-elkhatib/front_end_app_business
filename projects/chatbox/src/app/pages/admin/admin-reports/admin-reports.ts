import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminReport, AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div><p class="admin-kicker">Admin</p><h1>Reports</h1><p class="admin-copy">Review saved report metadata and download generated PDFs.</p></div>
        <button class="admin-refresh" type="button" (click)="loadReports()">Refresh</button>
      </header>
      <p *ngIf="errorMessage" class="admin-error">{{errorMessage}}</p>
      <div *ngIf="isLoading" class="table-empty">Loading reports...</div>
      <div *ngIf="!isLoading && !reports.length" class="table-empty">No reports have been generated.</div>
      <div *ngIf="!isLoading && reports.length" class="table-scroll">
        <table class="admin-table">
          <thead><tr><th>Report Title</th><th>Project</th><th>Entrepreneur</th><th>Generated Date</th><th>Report Type</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let report of reports">
              <td>{{report.title}}</td>
              <td>{{report.project || report.projectId}}</td>
              <td>{{report.entrepreneur?.fullName || '-'}}</td>
              <td>{{report.createdAt | date:'mediumDate'}}</td>
              <td><span class="badge-pill badge-neutral">{{report.reportType || 'REPORT'}}</span></td>
              <td class="actions"><a class="admin-action" [href]="downloadUrl(report.id)" target="_blank">Download PDF</a></td>
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
  isLoading = true;
  errorMessage = '';

  ngOnInit() { this.loadReports(); }

  loadReports() {
    this.isLoading = true;
    this.adminService.getReports().subscribe({
      next: reports => { this.reports = reports; this.isLoading = false; },
      error: () => { this.errorMessage = 'Reports could not be loaded.'; this.isLoading = false; }
    });
  }

  downloadUrl(reportId: string) {
    return this.adminService.downloadReportUrl(reportId);
  }
}
