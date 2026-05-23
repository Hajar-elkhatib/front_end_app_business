const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'projects/chatbox/src/app/components');

const components = {
    'sidebar/sidebar.ts': `import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: \`
    <aside class="sidebar">
      <div class="logo-area">
        <h3>IntelliVal</h3>
      </div>
      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="icon">📊</span> Dashboard
        </a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-item">
          <span class="icon">📁</span> My Projects
        </a>
        <a routerLink="/chatbot" routerLinkActive="active" class="nav-item">
          <span class="icon">🤖</span> AI Advisor
        </a>
        <a routerLink="/specialists" routerLinkActive="active" class="nav-item">
          <span class="icon">👥</span> Specialists
        </a>
        <a routerLink="/reports" routerLinkActive="active" class="nav-item">
          <span class="icon">📑</span> Reports
        </a>
        <a routerLink="/help" routerLinkActive="active" class="nav-item">
          <span class="icon">❓</span> Help Center
        </a>
      </nav>
      <div class="bottom-area">
        <a routerLink="/profile" class="nav-item"><span class="icon">⚙️</span> Settings</a>
      </div>
    </aside>
  \`,
  styles: [\`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--bg-primary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0;
      z-index: 100;
    }
    .logo-area {
      padding: var(--s-6);
      border-bottom: 1px solid var(--border-color);
      color: var(--indigo-600);
      font-size: 1.25rem;
      font-weight: 700;
    }
    .nav-links {
      flex: 1;
      padding: var(--s-4) 0;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      padding: var(--s-3) var(--s-6);
      color: var(--text-secondary);
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
      gap: var(--s-3);
    }
    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--indigo-50);
      color: var(--indigo-700);
      border-right: 3px solid var(--indigo-600);
    }
    .bottom-area {
      padding: var(--s-4);
      border-top: 1px solid var(--border-color);
    }
  \`]
})
export class Sidebar {}
`,
    'navbar/navbar.ts': `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: \`
    <header class="navbar flex items-center justify-between">
      <div class="search-area">
        <input type="text" class="input search-input" placeholder="Search...">
      </div>
      <div class="flex items-center gap-4">
        <button class="btn notification-btn">🔔</button>
        <div class="avatar" style="width: 40px; height: 40px; cursor: pointer;">User</div>
      </div>
    </header>
  \`,
  styles: [\`
    .navbar {
      height: 72px;
      padding: 0 var(--s-6);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .search-input { width: 300px; border-radius: var(--r-full); background: var(--bg-secondary); }
    .notification-btn { font-size: 1.25rem; }
  \`]
})
export class Navbar {}
`,
    'project-card/project-card.ts': `import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink],
  template: \`
    <div class="card project-card flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="badge" [class.badge-idea]="status === 'IDEA'" [class.badge-launched]="status === 'LAUNCHED'" [class.badge-progress]="status === 'IN_PROGRESS'">{{status}}</span>
          <span class="score badge-progress">{{score || 'N/A'}}/100</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">{{name}}</h3>
        <p class="text-secondary text-sm mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">{{description}}</p>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted">{{sector}}</span>
        <a [routerLink]="['/projects', id]" class="btn btn-secondary text-sm">View Details</a>
      </div>
    </div>
  \`,
  styles: [\`
    .project-card { height: 100%; min-height: 220px; }
    .score { font-weight: bold; background: var(--indigo-50); color: var(--indigo-700); padding: 4px 8px; border-radius: 4px; }
  \`]
})
export class ProjectCard {
  @Input() id!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() status!: string;
  @Input() sector!: string;
  @Input() score?: number;
}
`,
    'kpi-card/kpi-card.ts': `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: \`
    <div class="card p-6 flex flex-col justify-center">
      <div class="flex items-center justify-between mb-2">
        <span class="text-secondary font-medium">{{title}}</span>
        <span class="icon">{{icon}}</span>
      </div>
      <div class="text-3xl font-bold">{{value}}</div>
      <div class="text-sm mt-2" [class.text-indigo]="trend > 0" [class.text-danger]="trend < 0" *ngIf="trend !== undefined">
        {{trend > 0 ? '+' : ''}}{{trend}}% from last month
      </div>
    </div>
  \`,
  styles: [\` .icon { font-size: 1.5rem; opacity: 0.5; } \`]
})
export class KpiCard {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() icon: string = '';
  @Input() trend?: number;
}
`,
    'badge/badge.ts': `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: \`<span class="badge" [class]="'badge-' + type">{{text}}</span>\`,
  styles: []
})
export class Badge {
  @Input() text!: string;
  @Input() type: 'idea' | 'progress' | 'launched' | 'improving' | 'success' | 'danger' = 'idea';
}
`
};

for (const [relativePath, content] of Object.entries(components)) {
    const fullPath = path.join(basePath, relativePath);
    if (fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
    } else {
        // try to find where it is since we generated them via ang cli
        // might be in chatbox/src/app/components/xyz/xyz.ts
        const altPath = fullPath;
        fs.writeFileSync(altPath, content);
    }
}
