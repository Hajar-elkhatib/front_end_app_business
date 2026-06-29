import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiSpecialistRecommendation } from '../../../models/analysis.model';
import { Project } from '../../../models/project.model';
import { AnalysisService } from '../../../services/analysis.service';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { HumChat } from '../../../services/hum-chat';

@Component({
  selector: 'app-specialist-recommendation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="mini-page">
      <header>
        <p class="kicker">Specialists</p>
        <h1>Specialist Recommendations</h1>
        <p>Find the most relevant profiles to support your validation, market work, or strategy.</p>
      </header>
      <div class="toolbar">
        <select class="input" [(ngModel)]="projectId">
          <option value="">Select a project</option>
          <option *ngFor="let project of projects" [value]="project.id">{{project.title}}</option>
        </select>
        <button class="btn btn-indigo" (click)="run()" [disabled]="!projectId || isLoading">{{isLoading ? 'Searching...' : 'View Recommendations'}}</button>
      </div>
      <div class="state" *ngIf="!projectId">Select a project to run the analysis.</div>
      <div class="state" *ngIf="error">{{error}}</div>
      <div class="state" *ngIf="projectId && !isLoading && !error && results.length === 0">No recommendation is available for this project yet.</div>
      <div class="list" *ngIf="results.length > 0">
        <article *ngFor="let item of results">
          <div>
            <strong>{{item.specialistName || ('Recommended specialist #' + item.rank)}}</strong>
            <span>{{item.expertiseDomain || 'Entrepreneurial support'}}</span>
          </div>
          <p>{{item.reason || 'This profile matches the project priorities.'}}</p>
          <small>Skills: {{formatSkills(item.skills)}}</small>
          <small>Availability: {{item.availability || 'To confirm'}}</small>
          <strong class="match">{{item.recommendedScore | number:'1.0-1'}}% match</strong>
          <div class="actions">
            <a class="btn btn-secondary" [routerLink]="['/specialists', item.specialistId]">View Profile</a>
            <button class="btn btn-indigo" type="button" (click)="startConversation(item)" [disabled]="startingSpecialistId === item.specialistId">
              {{startingSpecialistId === item.specialistId ? 'Opening...' : 'Contact'}}
            </button>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .mini-page{display:grid;gap:1rem}.kicker{color:var(--indigo-600);font-weight:800;text-transform:uppercase;font-size:.72rem}.toolbar{display:flex;gap:.75rem}.toolbar .input{max-width:360px}.state,article{border:1px solid var(--border-color);background:var(--bg-primary);border-radius:var(--r-md);padding:1rem}.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.75rem}article{display:grid;gap:.7rem}article span,article small{display:block;color:var(--text-muted)}.match{color:var(--indigo-600)}.actions{display:flex;gap:.5rem;flex-wrap:wrap}@media(max-width:760px){.toolbar{display:grid}}
  `]
})
export class SpecialistRecommendation implements OnInit {
  private route = inject(ActivatedRoute);
  private analysisService = inject(AnalysisService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private humChat = inject(HumChat);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  projectId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('projectId') || '';
  projects: Project[] = [];
  results: AiSpecialistRecommendation[] = [];
  isLoading = false;
  error = '';
  startingSpecialistId = '';

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
    this.analysisService.recommendSpecialists(this.projectId).subscribe({
      next: result => { this.results = result || []; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Recommendations could not be loaded. Please try again.'; this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  formatSkills(skills?: string[] | string): string {
    if (Array.isArray(skills)) return skills.join(', ');
    return skills || 'Project expertise, strategy, market';
  }

  startConversation(item: AiSpecialistRecommendation) {
    const entrepreneurId = this.authService.currentUser?.id || '';
    const specialistId = item.specialistId || '';

    if (!entrepreneurId || !specialistId) {
      this.error = 'Conversation could not be started because an identifier is missing.';
      return;
    }

    this.error = '';
    this.startingSpecialistId = specialistId;
    this.humChat.setCurrentUser(entrepreneurId, this.authService.userRole);
    this.humChat.startConversation(entrepreneurId, specialistId, this.projectId || undefined).subscribe({
      next: conversation => {
        this.startingSpecialistId = '';
        this.router.navigate(['/conversations'], {
          queryParams: { conversationId: conversation.id }
        });
      },
      error: () => {
        this.startingSpecialistId = '';
        this.error = 'Conversation could not be started. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}
