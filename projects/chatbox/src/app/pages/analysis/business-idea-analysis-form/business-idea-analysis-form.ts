import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnalysisService } from '../../../services/analysis.service';

@Component({
  selector: 'app-business-idea-analysis-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './business-idea-analysis-form.html',
  styleUrls: ['./business-idea-analysis-form.css']
})
export class BusinessIdeaAnalysisForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analysisService = inject(AnalysisService);
  private cdr = inject(ChangeDetectorRef);

  analysisId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;

  form = this.fb.group({
    projectId: ['', Validators.required],
    successProbability: [0],
    predictionLabel: ['Unknown'],
    confidenceScore: [0],
    finalScore: [0],
    finalLabel: ['Unknown'],
    startupSuccessScore: [0],
    marketAnalysisScore: [0],
    sentimentScore: [0],
    specialistScore: [0],
    modelName: [''],
    modelVersion: [''],
    strengths: [''],
    weaknesses: [''],
    recommendationsSummary: [''],
    warnings: ['']
  });

  ngOnInit() {
    const projectId = this.route.snapshot.queryParamMap.get('projectId');
    if (projectId) {
      this.form.patchValue({ projectId });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.analysisId = id;
      this.loadAnalysis(id);
    }
  }

  loadAnalysis(id: string) {
    this.isLoading = true;
    this.analysisService.getBusinessIdeaAnalysisById(id).subscribe({
      next: analysis => {
        this.form.patchValue({
          projectId: analysis.projectId,
          successProbability: analysis.successProbability || 0,
          predictionLabel: analysis.predictionLabel || 'Unknown',
          confidenceScore: analysis.confidenceScore || 0,
          finalScore: analysis.finalScore || 0,
          finalLabel: analysis.finalLabel || 'Unknown',
          startupSuccessScore: analysis.startupSuccessScore || 0,
          marketAnalysisScore: analysis.marketAnalysisScore || 0,
          sentimentScore: analysis.sentimentScore || 0,
          specialistScore: analysis.specialistScore || 0,
          modelName: analysis.modelName || '',
          modelVersion: analysis.modelVersion || '',
          strengths: analysis.strengths || '',
          weaknesses: analysis.weaknesses || '',
          recommendationsSummary: analysis.recommendationsSummary || '',
          warnings: analysis.warnings || ''
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/analysis/business-idea']);
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
      successProbability: Number(value.successProbability || 0),
      predictionLabel: value.predictionLabel || 'Unknown',
      confidenceScore: Number(value.confidenceScore || 0),
      finalScore: Number(value.finalScore || 0),
      finalLabel: value.finalLabel || 'Unknown',
      startupSuccessScore: Number(value.startupSuccessScore || 0),
      marketAnalysisScore: Number(value.marketAnalysisScore || 0),
      sentimentScore: Number(value.sentimentScore || 0),
      specialistScore: Number(value.specialistScore || 0),
      modelName: value.modelName || '',
      modelVersion: value.modelVersion || '',
      strengths: value.strengths || '',
      weaknesses: value.weaknesses || '',
      recommendationsSummary: value.recommendationsSummary || '',
      warnings: value.warnings || ''
    };

    const request = this.isEditMode
      ? this.analysisService.updateBusinessIdeaAnalysis(this.analysisId, payload)
      : this.analysisService.createBusinessIdeaAnalysis(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/analysis/business-idea'], {
          queryParams: payload.projectId ? { projectId: payload.projectId } : undefined
        });
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
        alert('Business idea analysis could not be saved.');
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
