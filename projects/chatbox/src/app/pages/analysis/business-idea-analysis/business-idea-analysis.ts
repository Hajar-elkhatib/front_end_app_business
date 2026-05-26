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
import { Project } from '../../../models/project.model';

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

  isBusinessLoading = false;
  isStartupLoading = false;
  isMarketLoading = false;
  isSentimentLoading = false;
  isSpecialistsLoading = false;
  errorMessage = '';
  isProjectsLoading = false;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
    this.loadProjects();
    if (this.projectId) {
      this.runBusinessValidation();
    }
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
    this.errorMessage = '';
  }

  runBusinessValidation() {
    if (!this.projectId) return;
    this.errorMessage = '';
    this.isBusinessLoading = true;
    this.analysisService.analyzeBusinessValidation(this.projectId, this.feedbackText).subscribe({
      next: result => {
        this.businessValidation = this.normalizeBusinessValidation(result);
        this.isBusinessLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.fail('The analysis could not be started. Please try again.', 'business')
    });
  }

  runStartupSuccess() {
    if (!this.projectId) return;
    this.errorMessage = '';
    this.isStartupLoading = true;
    this.analysisService.predictStartupSuccess(this.projectId).subscribe({
      next: result => {
        this.startupSuccess = result;
        this.isStartupLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.fail('The analysis could not be started. Please try again.', 'startup')
    });
  }

  runMarketAnalysis() {
    if (!this.projectId) return;
    this.errorMessage = '';
    this.isMarketLoading = true;
    this.analysisService.analyzeMarket(this.projectId).subscribe({
      next: result => {
        this.marketAnalysis = result;
        this.isMarketLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.fail('The analysis could not be started. Please try again.', 'market')
    });
  }

  runSentimentAnalysis() {
    if (!this.projectId || !this.feedbackText.trim()) {
      this.errorMessage = 'Add customer or market feedback before running sentiment analysis.';
      return;
    }
    this.errorMessage = '';
    this.isSentimentLoading = true;
    this.analysisService.analyzeSentiment(this.projectId, this.feedbackText.trim(), this.feedbackSource || 'manual_feedback').subscribe({
      next: result => {
        this.sentimentAnalysis = result;
        this.isSentimentLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.fail('The analysis could not be started. Please try again.', 'sentiment')
    });
  }

  runSpecialistRecommendations() {
    if (!this.projectId) return;
    this.errorMessage = '';
    this.isSpecialistsLoading = true;
    this.analysisService.recommendSpecialists(this.projectId).subscribe({
      next: result => {
        this.specialistRecommendations = result || [];
        this.isSpecialistsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => this.fail('The analysis could not be started. Please try again.', 'specialists')
    });
  }

  runAll() {
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
    const parts = this.scoreParts();
    if (parts.length === 0) {
      return this.businessValidation?.finalScore || 0;
    }
    const weights: Record<string, number> = {
      'Startup Success': 0.35,
      'Market Analysis': 0.25,
      'Customer Feedback': 0.25,
      'Other AI Signals': 0.15
    };
    let weighted = 0;
    let totalWeight = 0;
    for (const part of parts) {
      const weight = weights[part.label] || 0;
      weighted += part.value * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? weighted / totalWeight : (this.businessValidation?.finalScore || 0);
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
      || this.businessValidation?.sentimentScore
      || (this.businessValidation as any)?.marketSentimentScore
      || 0;
  }

  private normalizeBusinessValidation(result: any): BusinessIdeaAnalysisModel {
    return {
      ...result,
      finalLabel: result.finalLabel || result.predictionLabel || 'Generated',
      startupSuccessScore: result.startupSuccessScore || result.predictionScore || 0,
      sentimentScore: result.sentimentScore || result.marketSentimentScore || 0,
      specialistScore: result.specialistScore || result.specialistOrRiskScore || 0,
      recommendationsSummary: result.recommendationsSummary || result.recommendations || '',
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
}
