import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  BusinessIdeaAnalysis as BusinessIdeaAnalysisModel,
  AiSpecialistRecommendation,
  MarketAnalysis,
  SentimentAnalysis,
  StartupSuccessAnalysis
} from '../../../models/analysis.model';
import { AnalysisService } from '../../../services/analysis.service';
import { ProjectService } from '../../../services/project.service';
import { ReportService } from '../../../services/report.service';
import { Project } from '../../../models/project.model';
import { Report } from '../../../models/report.model';

@Component({
  selector: 'app-business-idea-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './business-idea-analysis.html',
  styleUrls: ['./business-idea-analysis.css']
})
export class BusinessIdeaAnalysis implements OnInit {
  private analysisService = inject(AnalysisService);
  private projectService = inject(ProjectService);
  private reportService = inject(ReportService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  projectId = '';
  projects: Project[] = [];
  feedbackText = '';
  feedbackSource = 'customer_feedback';

  businessValidation?: BusinessIdeaAnalysisModel;
  startupSuccess?: StartupSuccessAnalysis;
  marketAnalysis?: MarketAnalysis;
  sentimentAnalysis?: SentimentAnalysis;
  specialistRecommendations: AiSpecialistRecommendation[] = [];
  feedbacks: any[] = [];
  latestReport?: Report;

  isBusinessLoading = false;
  isStartupLoading = false;
  isMarketLoading = false;
  isSentimentLoading = false;
  isSpecialistsLoading = false;
  isReportLoading = false;
  errorMessage = '';
  secondaryWarning = '';
  isProjectsLoading = false;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
    this.loadProjects();
    if (this.projectId) {
      this.loadLatestAnalysis();
      this.loadFeedbacks();
      this.loadLatestReport();
    }
  }

  loadLatestAnalysis() {
    if (!this.projectId) return;
    this.analysisService.getLatestBusinessValidation(this.projectId).subscribe({
      next: result => {
        this.businessValidation = this.normalizeBusinessValidation(result);
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadFeedbacks() {
    if (!this.projectId) return;
    this.analysisService.getFeedbacks(this.projectId).subscribe({
      next: feedbacks => {
        this.feedbacks = feedbacks || [];
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadLatestReport() {
    if (!this.projectId) return;
    this.reportService.getLatestReport(this.projectId).subscribe({
      next: report => {
        this.latestReport = report;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadProjects() {
    this.isProjectsLoading = true;
    this.projectService.getProjects().subscribe({
      next: projects => {
        this.projects = projects || [];
        this.isProjectsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.projects = [];
        this.isProjectsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onProjectChange() {
    this.businessValidation = undefined;
    this.startupSuccess = undefined;
    this.marketAnalysis = undefined;
    this.sentimentAnalysis = undefined;
    this.specialistRecommendations = [];
    this.latestReport = undefined;
    this.errorMessage = '';
    this.secondaryWarning = '';
    this.loadLatestAnalysis();
    this.loadFeedbacks();
    this.loadLatestReport();
  }

  runBusinessValidation() {
    if (!this.projectId) return;
    this.errorMessage = '';
    this.secondaryWarning = '';
    this.isBusinessLoading = true;
    this.analysisService.analyzeBusinessValidation(this.projectId, this.feedbackText).subscribe({
      next: result => {
        this.businessValidation = this.normalizeBusinessValidation(result);
        this.isBusinessLoading = false;
        this.loadLatestReport();
        this.cdr.markForCheck();
      },
      error: () => this.fail('The analysis could not be started. Please try again.', 'business')
    });
  }

  runStartupSuccess() {
    if (!this.projectId) return;
    this.clearErrorForStandaloneRun('startup');
    this.isStartupLoading = true;
    this.analysisService.predictStartupSuccess(this.projectId).subscribe({
      next: result => {
        this.startupSuccess = result;
        this.isStartupLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.failSecondary('Startup success could not be refreshed.', 'startup')
    });
  }

  runMarketAnalysis() {
    if (!this.projectId) return;
    this.clearErrorForStandaloneRun('market');
    this.isMarketLoading = true;
    this.analysisService.analyzeMarket(this.projectId).subscribe({
      next: result => {
        this.marketAnalysis = result;
        this.isMarketLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.failSecondary('Market analysis could not be refreshed.', 'market')
    });
  }

  runSentimentAnalysis() {
    if (!this.projectId || !this.feedbackText.trim()) {
      this.errorMessage = 'Add customer or market feedback before running sentiment analysis.';
      return;
    }
    this.errorMessage = '';
    this.isSentimentLoading = true;
    this.analysisService.createFeedbacks(this.projectId, this.feedbackText.trim()).subscribe({
      next: () => this.analysisService.analyzeFeedbacks(this.projectId).subscribe({
        next: feedbacks => {
          this.feedbacks = feedbacks || [];
          const scored = this.feedbacks.filter(item => typeof item.sentimentScore === 'number');
          const avg = scored.length ? scored.reduce((sum, item) => sum + item.sentimentScore, 0) / scored.length : 0;
          this.sentimentAnalysis = {
            id: '',
            projectId: this.projectId,
            textSource: this.feedbackSource,
            reviewText: this.feedbackText,
            sentimentLabel: avg >= 50 ? 'positive' : 'negative',
            sentimentScore: avg,
            averageSentimentScore: avg,
            overallLabel: avg >= 50 ? 'positive' : 'negative',
            confidenceScore: 100,
            rating: 0,
            count: scored.length,
            modelName: '',
            modelVersion: '',
            createdAt: new Date().toISOString()
          };
          this.isSentimentLoading = false;
          this.cdr.markForCheck();
        },
        error: () => this.failSecondary('Customer feedback could not be refreshed.', 'sentiment')
      }),
      error: () => this.failSecondary('Customer feedback could not be refreshed.', 'sentiment')
    });
  }

  runSpecialistRecommendations() {
    if (!this.projectId) return;
    this.clearErrorForStandaloneRun('specialists');
    this.isSpecialistsLoading = true;
    this.analysisService.recommendSpecialists(this.projectId).subscribe({
      next: result => {
        this.specialistRecommendations = result || [];
        this.isSpecialistsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.failSecondary('Specialist recommendations could not be refreshed.', 'specialists')
    });
  }

  generateReport() {
    if (!this.projectId || !this.businessValidation) return;
    this.errorMessage = '';
    this.isReportLoading = true;
    this.reportService.generateProjectReport(this.projectId).subscribe({
      next: report => {
        this.latestReport = report;
        this.isReportLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'The report could not be generated. Please try again.';
        this.isReportLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  downloadReport() {
    if (!this.latestReport?.id) return;
    this.reportService.downloadReport(this.latestReport.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.latestReport?.title || 'business-validation-report'}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'The report could not be downloaded. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  runAll() {
    this.errorMessage = '';
    this.secondaryWarning = '';
    this.runBusinessValidation();
    this.runStartupSuccess();
    this.runMarketAnalysis();
    if (this.feedbackText.trim()) {
      this.runSentimentAnalysis();
    }
    this.runSpecialistRecommendations();
  }

  scoreParts() {
    if (!this.businessValidation && !this.startupSuccess && !this.marketAnalysis && !this.sentimentAnalysis) return [];
    return [
      { label: 'Startup Success', value: this.startupScore() },
      { label: 'Market Analysis', value: this.marketScore() },
      { label: 'Customer Feedback', value: this.sentimentScore() },
      { label: 'Other AI Signals', value: this.businessValidation?.specialistScore || 0 }
    ].filter(item => item.value > 0);
  }

  displayedFinalScore(): number {
    const analysis = this.businessValidation as any;
    return this.firstNumeric(
      analysis?.llmReviewedFinalScore,
      analysis?.finalScore,
      analysis?.rawModelFinalScore,
      0
    );
  }

  displayedFinalLabel(): string {
    const score = this.displayedFinalScore();
    if (!score) return 'No analysis available';
    if (score >= 70) return 'Strong validation';
    if (score >= 50) return 'Moderate validation';
    return 'Weak validation';
  }

  startupScore(): number {
    return this.startupSuccess?.successProbability || this.businessValidation?.startupSuccessScore || this.businessValidation?.successProbability || 0;
  }

  marketScore(): number {
    return this.businessValidation?.marketAnalysisScore || (this.marketAnalysis as any)?.marketScore || 0;
  }

  sentimentScore(): number {
    return this.sentimentAnalysis?.sentimentScore
      || this.sentimentAnalysis?.averageSentimentScore
      || this.businessValidation?.marketOpinionScore
      || this.businessValidation?.sentimentScore
      || (this.businessValidation as any)?.marketSentimentScore
      || 0;
  }

  displayText(value: string[] | string | undefined, fallback: string): string {
    if (Array.isArray(value)) {
      return value.length ? value.join('\n') : fallback;
    }
    return value && value.trim() ? value : fallback;
  }

  private normalizeBusinessValidation(result: any): BusinessIdeaAnalysisModel {
    return {
      ...result,
      finalLabel: result.finalLabel || result.predictionLabel || 'Generated',
      startupSuccessScore: result.startupSuccessScore || result.predictionScore || 0,
      sentimentScore: result.sentimentScore || result.marketOpinionScore || result.marketSentimentScore || 0,
      specialistScore: result.specialistScore || result.specialistOrRiskScore || 0,
      recommendationsSummary: result.recommendationsSummary || '',
      modelName: result.modelName || 'Business Validation',
      createdAt: result.createdAt || new Date().toISOString()
    };
  }

  private fail(message: string, area: 'business' | 'startup' | 'market' | 'sentiment' | 'specialists') {
    this.errorMessage = message;
    if (area === 'business') this.isBusinessLoading = false;
    if (area === 'startup') this.isStartupLoading = false;
    if (area === 'market') this.isMarketLoading = false;
    if (area === 'sentiment') this.isSentimentLoading = false;
    if (area === 'specialists') this.isSpecialistsLoading = false;
    this.cdr.markForCheck();
  }

  private failSecondary(message: string, area: 'startup' | 'market' | 'sentiment' | 'specialists') {
    this.secondaryWarning = this.businessValidation
      ? `The project analysis was completed. ${message}`
      : message;
    if (area === 'startup') this.isStartupLoading = false;
    if (area === 'market') this.isMarketLoading = false;
    if (area === 'sentiment') this.isSentimentLoading = false;
    if (area === 'specialists') this.isSpecialistsLoading = false;
    this.cdr.markForCheck();
  }

  private firstNumeric(...values: any[]): number {
    for (const value of values) {
      const numeric = Number(value);
      if (value !== null && value !== undefined && value !== '' && Number.isFinite(numeric)) {
        return numeric;
      }
    }
    return 0;
  }

  private clearErrorForStandaloneRun(area: 'startup' | 'market' | 'specialists') {
    if (!this.isBusinessLoading && !this.businessValidation) {
      this.errorMessage = '';
    }
    this.secondaryWarning = '';
  }
}
