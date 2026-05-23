import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-workspace-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="workspace-page">
      <header class="workspace-header">
        <div>
          <p class="workspace-kicker">{{kicker}}</p>
          <h1>{{title}}</h1>
          <p>{{description}}</p>
        </div>
        <a *ngIf="backLink" [routerLink]="backLink" class="btn btn-secondary text-sm">Back</a>
      </header>

      <div class="workspace-card">
        <div class="workspace-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h2>{{emptyTitle}}</h2>
        <p>{{emptyMessage}}</p>
        <p *ngIf="searchQuery" class="workspace-search-note">No results for "{{searchQuery}}".</p>
      </div>
    </section>
  `,
  styles: `
    .workspace-page { display: grid; gap: 1.5rem; }
    .workspace-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
    .workspace-kicker { color: var(--indigo-600); font-size: .75rem; text-transform: uppercase; font-weight: 700; letter-spacing: .08em; margin-bottom: .35rem; }
    .workspace-header h1 { font-size: 2rem; margin-bottom: .5rem; }
    .workspace-header p { color: var(--text-secondary); max-width: 54rem; }
    .workspace-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--r-md); padding: 3rem 2rem; text-align: center; box-shadow: var(--sh-sm); }
    .workspace-icon { width: 4rem; height: 4rem; margin: 0 auto 1rem; border-radius: 50%; background: var(--bg-tertiary); color: var(--text-secondary); display: grid; place-items: center; }
    .workspace-card h2 { font-size: 1.1rem; margin-bottom: .5rem; }
    .workspace-card p { color: var(--text-secondary); max-width: 36rem; margin: 0 auto; }
    .workspace-search-note { margin-top: .75rem !important; color: var(--text-muted) !important; }
  `
})
export class EmptyWorkspacePage implements OnInit {
  private route = inject(ActivatedRoute);

  title = 'Workspace';
  kicker = 'Workspace';
  description = 'This page is prepared for backend-driven data.';
  emptyTitle = 'No data available';
  emptyMessage = 'The frontend route, layout, and service boundary are ready. Data will appear when the matching backend endpoint is exposed.';
  backLink = '';
  searchQuery = '';

  ngOnInit() {
    const data = this.route.snapshot.data;
    this.title = data['title'] || this.title;
    this.kicker = data['kicker'] || this.kicker;
    this.description = data['description'] || this.description;
    this.emptyTitle = data['emptyTitle'] || this.emptyTitle;
    this.emptyMessage = data['emptyMessage'] || this.emptyMessage;
    this.backLink = data['backLink'] || '';
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery = params.get('search') || '';
    });
  }
}
