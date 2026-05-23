import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section style="display:grid; place-items:center; min-height:55vh; text-align:center; gap:1rem;">
      <div>
        <p style="color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:.08em;">404</p>
        <h1 style="font-size:2rem; margin:.25rem 0 .5rem;">Page not found</h1>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">This route is not part of the current workspace.</p>
        <a routerLink="/dashboard" class="btn btn-indigo">Go to dashboard</a>
      </div>
    </section>
  `
})
export class NotFound {}
