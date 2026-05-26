import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketAnalysis } from '../../../models/analysis.model';
import { Project } from '../../../models/project.model';
import { AnalysisService } from '../../../services/analysis.service';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-market-research',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mini-page">
      <header>
        <p class="kicker">AI Analysis</p>
        <h1>Market Analysis</h1>
        <p>Measure market attractiveness, growth dynamics, and competitive intensity.</p>
      </header>
      <div class="toolbar">
        <select class="input" [(ngModel)]="projectId">
          <option value="">Select a project</option>
          <option *ngFor="let project of projects" [value]="project.id">{{project.title}}</option>
        </select>
        <button class="btn btn-indigo" (click)="run()" [disabled]="!projectId || isLoading">{{isLoading ? 'Analyzing...' : 'Run Analysis'}}</button>
      </div>
      <div class="state" *ngIf="!projectId">Select a project to run the analysis.</div>
      <div class="state" *ngIf="error">{{error}}</div>
      <article class="result" *ngIf="result">
        <h2>{{result.priority || result.marketLabel || 'Market result'}}</h2>
        <div class="grid">
          <span>Sector <strong>{{result.sector || '-'}}</strong></span>
          <span>Estimated size <strong>{{result.marketSize || 0}}B</strong></span>
          <span>Growth <strong>{{result.growthRate || 0}}%</strong></span>
          <span>Competition <strong>{{result.competitionLevel || '-'}}</strong></span>
          <span>Trend <strong>{{result.trendScore || 0}}</strong></span>
          <span>Confidence <strong>{{result.confidenceScore || 0}}</strong></span>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .mini-page{display:grid;gap:1rem}.kicker{color:var(--indigo-600);font-weight:800;text-transform:uppercase;font-size:.72rem}.toolbar{display:flex;gap:.75rem;align-items:center}.toolbar .input{max-width:360px}.state,.result{border:1px solid var(--border-color);background:var(--bg-primary);border-radius:var(--r-md);padding:1rem}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.grid span{display:grid;color:var(--text-secondary)}@media(max-width:760px){.toolbar{display:grid}.grid{grid-template-columns:1fr}}
  `]
})
export class MarketResearch implements OnInit {
  private route = inject(ActivatedRoute);
  private analysisService = inject(AnalysisService);
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);
  projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
  projects: Project[] = [];
  result?: MarketAnalysis;
  isLoading = false;
  error = '';

  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: projects => { this.projects = projects || []; this.cdr.markForCheck(); },
      error: () => { this.projects = []; this.cdr.markForCheck(); }
    });
  }

  run() {
    if (!this.projectId) return;
    this.error = '';
    this.isLoading = true;
    this.analysisService.analyzeMarket(this.projectId).subscribe({
      next: result => { this.result = result; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'The analysis could not be started. Please try again.'; this.isLoading = false; this.cdr.markForCheck(); }
    });
  }
}
