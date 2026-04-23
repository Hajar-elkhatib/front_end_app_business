import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome').then(m => m.Welcome)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'marketplace', loadComponent: () => import('./pages/marketplace/marketplace').then(m => m.Marketplace) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) }
    ]
  }
];
