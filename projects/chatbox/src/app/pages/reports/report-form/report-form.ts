import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './report-form.html',
  styleUrls: ['./report-form.css']
})
export class ReportForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  reportId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;

  form = this.fb.group({
    projectId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    summary: [''],
    reportType: ['General', Validators.required],
    content: ['', Validators.required],
    pdfUrl: [''],
    generatedBy: ['manual'],
    modelVersion: ['']
  });

  ngOnInit() {
    const projectId = this.route.snapshot.queryParamMap.get('projectId');
    if (projectId) {
      this.form.patchValue({ projectId });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.reportId = id;
      this.loadReport(id);
    }
  }

  loadReport(id: string) {
    this.isLoading = true;
    this.reportService.getReportById(id).subscribe({
      next: report => {
        this.form.patchValue({
          projectId: report.projectId,
          title: report.title,
          summary: report.summary,
          reportType: report.reportType,
          content: report.content,
          pdfUrl: report.pdfUrl || '',
          generatedBy: report.generatedBy || 'manual',
          modelVersion: report.modelVersion || ''
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/reports']);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const value = this.form.getRawValue();
    const payload = {
      projectId: value.projectId || '',
      title: value.title || '',
      summary: value.summary || '',
      reportType: value.reportType || 'General',
      content: value.content || '',
      pdfUrl: value.pdfUrl || '',
      generatedBy: value.generatedBy || 'manual',
      modelVersion: value.modelVersion || ''
    };

    const request = this.isEditMode
      ? this.reportService.updateReport(this.reportId, payload)
      : this.reportService.createReport(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/reports'], {
          queryParams: payload.projectId ? { projectId: payload.projectId } : undefined
        });
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
        alert('Report could not be saved.');
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
