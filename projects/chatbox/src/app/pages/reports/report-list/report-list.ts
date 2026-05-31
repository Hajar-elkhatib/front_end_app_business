import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Report } from '../../../models/report.model';
import { Project } from '../../../models/project.model';
import { ReportService } from '../../../services/report.service';
import { ProjectService } from '../../../services/project.service';

interface ReportRow {
  project: Project;
  report?: Report;
  isGenerating: boolean;
  isDownloading: boolean;
}

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})
export class ReportList implements OnInit {
  private reportService = inject(ReportService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  rows: ReportRow[] = [];
  projectId = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.projectId) {
      this.projectService.getProjectById(this.projectId).pipe(
        catchError(() => of(undefined))
      ).subscribe(project => {
        if (!project) {
          this.rows = [];
          this.isLoading = false;
          this.errorMessage = 'The selected project could not be loaded.';
          this.cdr.markForCheck();
          return;
        }
        this.reportService.getReports(project.id).pipe(
          catchError(() => of([] as Report[]))
        ).subscribe(reports => {
          this.rows = [{
            project,
            report: this.latestAutomaticReport(reports),
            isGenerating: false,
            isDownloading: false
          }];
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      });
      return;
    }

    this.projectService.getProjects().subscribe({
      next: projects => {
        if (!projects.length) {
          this.rows = [];
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }

        forkJoin(projects.map(project =>
          this.reportService.getReports(project.id).pipe(
            map(reports => ({
              project,
              report: this.latestAutomaticReport(reports),
              isGenerating: false,
              isDownloading: false
            })),
            catchError(() => of({
              project,
              report: undefined,
              isGenerating: false,
              isDownloading: false
            }))
          )
        )).subscribe(rows => {
          this.rows = rows;
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.rows = [];
        this.isLoading = false;
        this.errorMessage = 'Reports could not be loaded. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  generateReport(row: ReportRow) {
    if (!row.project.id || row.isGenerating) return;
    row.isGenerating = true;
    this.errorMessage = '';
    this.reportService.generateProjectReport(row.project.id).subscribe({
      next: report => {
        row.report = report;
        row.isGenerating = false;
        this.cdr.markForCheck();
      },
      error: () => {
        row.isGenerating = false;
        this.errorMessage = 'The report could not be generated. Run the project analysis first, then try again.';
        this.cdr.markForCheck();
      }
    });
  }

  downloadReport(row: ReportRow) {
    if (!row.report?.id || row.isDownloading) return;
    row.isDownloading = true;
    this.reportService.downloadReport(row.report.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.fileName(row)}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        row.isDownloading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        row.isDownloading = false;
        this.errorMessage = 'The report could not be downloaded. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  reportTitle(report?: Report): string {
    return report?.title || 'Business Validation Report';
  }

  reportDate(report?: Report): Date | string | undefined {
    return report?.createdAt;
  }

  reportStatus(report?: Report): string {
    return report?.pdfUrl ? 'PDF ready' : (report ? 'Ready to download' : 'Not generated yet');
  }

  hasAnyReport(): boolean {
    return this.rows.some(row => !!row.report);
  }

  private latestAutomaticReport(reports: Report[]): Report | undefined {
    return [...(reports || [])]
      .filter(report => this.isAutomaticReport(report))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
  }

  private isAutomaticReport(report: Report): boolean {
    const type = (report.reportType || '').toUpperCase();
    const title = (report.title || '').toLowerCase();
    return type.includes('AI') || type.includes('GENERATED') || title.includes('business validation');
  }

  private fileName(row: ReportRow): string {
    const project = (row.project.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `business-validation-report-${project || 'project'}`;
  }
}
