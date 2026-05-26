import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SentimentAnalysis } from '../../../models/analysis.model';
import { Project } from '../../../models/project.model';
import { AnalysisService } from '../../../services/analysis.service';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-market-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mini-page">
      <header>
        <p class="kicker">AI Analysis</p>
        <h1>Customer Feedback Analysis</h1>
        <p>Turn reviews, field notes, and market signals into a clear sentiment reading.</p>
      </header>
      <div class="form">
        <select class="input" [(ngModel)]="projectId">
          <option value="">Select a project</option>
          <option *ngFor="let project of projects" [value]="project.id">{{project.title}}</option>
        </select>
        <input class="input" [(ngModel)]="textSource" placeholder="Feedback source, e.g. pilot customers">
        <textarea class="input" [(ngModel)]="text" rows="5" placeholder="Paste the feedback to analyze"></textarea>
        <button class="btn btn-indigo" (click)="run()" [disabled]="!projectId || !text.trim() || isLoading">{{isLoading ? 'Analyzing...' : 'Analyze Feedback'}}</button>
      </div>
      <div class="state" *ngIf="!projectId">Select a project to run the analysis.</div>
      <div class="state" *ngIf="error">{{error}}</div>
      <article class="result" *ngIf="result">
        <h2>{{result.sentimentLabel || result.overallLabel || 'Sentiment'}}</h2>
        <p>Score: {{result.sentimentScore || result.averageSentimentScore || 0}}</p>
        <p>Confidence: {{result.confidenceScore || 0}}</p>
      </article>
    </section>
  `,
  styles: [`
    .mini-page{display:grid;gap:1rem}.kicker{color:var(--indigo-600);font-weight:800;text-transform:uppercase;font-size:.72rem}.form{display:grid;gap:.75rem;max-width:760px}.state,.result{border:1px solid var(--border-color);background:var(--bg-primary);border-radius:var(--r-md);padding:1rem}
  `]
})
export class MarketFeedback implements OnInit {
  private route = inject(ActivatedRoute);
  private analysisService = inject(AnalysisService);
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);
  projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
  projects: Project[] = [];
  textSource = 'customer feedback';
  text = '';
  result?: SentimentAnalysis;
  isLoading = false;
  error = '';

  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: projects => { this.projects = projects || []; this.cdr.markForCheck(); },
      error: () => { this.projects = []; this.cdr.markForCheck(); }
    });
  }

  run() {
    if (!this.projectId || !this.text.trim()) return;
    this.error = '';
    this.isLoading = true;
    this.analysisService.analyzeSentiment(this.projectId, this.text, this.textSource).subscribe({
      next: result => { this.result = result; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'The analysis could not be started. Please try again.'; this.isLoading = false; this.cdr.markForCheck(); }
    });
  }
}
