import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusinessIdeaAnalysis as BusinessIdeaAnalysisModel } from '../../../models/analysis.model';
import { AnalysisService } from '../../../services/analysis.service';

@Component({
  selector: 'app-business-idea-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './business-idea-analysis.html',
  styleUrls: ['./business-idea-analysis.css']
})
export class BusinessIdeaAnalysis implements OnInit {
  private analysisService = inject(AnalysisService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  analyses: BusinessIdeaAnalysisModel[] = [];
  filteredAnalyses: BusinessIdeaAnalysisModel[] = [];
  isLoading = true;
  query = '';
  labelFilter = 'all';
  projectId = '';

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
    this.loadAnalyses();
    this.route.queryParamMap.subscribe(params => {
      this.query = (params.get('search') || '').toLowerCase();
      this.applyFilters();
    });
  }

  loadAnalyses() {
    this.isLoading = true;
    this.analysisService.getBusinessIdeaAnalyses(this.projectId || undefined).subscribe({
      next: analyses => {
        this.analyses = analyses;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.analyses = [];
        this.filteredAnalyses = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters() {
    let results = [...this.analyses];
    if (this.labelFilter !== 'all') {
      results = results.filter(analysis => analysis.finalLabel === this.labelFilter || analysis.predictionLabel === this.labelFilter);
    }
    if (this.query) {
      results = results.filter(analysis =>
        analysis.projectId.toLowerCase().includes(this.query) ||
        (analysis.finalLabel || '').toLowerCase().includes(this.query) ||
        (analysis.predictionLabel || '').toLowerCase().includes(this.query) ||
        (analysis.modelName || '').toLowerCase().includes(this.query) ||
        (analysis.recommendationsSummary || '').toLowerCase().includes(this.query) ||
        (analysis.strengths || '').toLowerCase().includes(this.query) ||
        (analysis.weaknesses || '').toLowerCase().includes(this.query)
      );
    }
    this.filteredAnalyses = results;
  }

  deleteAnalysis(analysis: BusinessIdeaAnalysisModel) {
    if (!confirm(`Delete business idea analysis for project "${analysis.projectId}"?`)) {
      return;
    }
    this.analysisService.deleteBusinessIdeaAnalysis(analysis.id).subscribe(() => {
      this.analyses = this.analyses.filter(item => item.id !== analysis.id);
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }
}
