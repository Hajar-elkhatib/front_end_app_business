import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Report } from '../../../models/report.model';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})
export class ReportList implements OnInit {
  private reportService = inject(ReportService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  reports: Report[] = [];
  filteredReports: Report[] = [];
  isLoading = true;
  query = '';
  typeFilter = 'all';
  projectId = '';

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
    this.loadReports();
    this.route.queryParamMap.subscribe(params => {
      this.query = (params.get('search') || '').toLowerCase();
      this.applyFilters();
    });
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getReports(this.projectId || undefined).subscribe({
      next: reports => {
        this.reports = reports;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.reports = [];
        this.filteredReports = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters() {
    let results = [...this.reports];
    if (this.typeFilter !== 'all') {
      results = results.filter(report => report.reportType === this.typeFilter);
    }
    if (this.query) {
      results = results.filter(report =>
        report.title.toLowerCase().includes(this.query) ||
        report.summary.toLowerCase().includes(this.query) ||
        report.reportType.toLowerCase().includes(this.query) ||
        report.content.toLowerCase().includes(this.query) ||
        report.generatedBy.toLowerCase().includes(this.query)
      );
    }
    this.filteredReports = results;
  }

  deleteReport(report: Report) {
    if (!confirm(`Delete report "${report.title}"?`)) {
      return;
    }
    this.reportService.deleteReport(report.id).subscribe(() => {
      this.reports = this.reports.filter(item => item.id !== report.id);
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  get createRoute(): string {
    return this.projectId ? `/reports/new?projectId=${this.projectId}` : '/reports/new';
  }
}
