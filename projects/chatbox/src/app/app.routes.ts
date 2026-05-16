import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome').then(m => m.Welcome)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then(m => m.MainLayout),
    children: [
      // Legacy dashboard redirect
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      
      // Role-based dashboards
      { path: 'dashboard/entrepreneur', loadComponent: () => import('./pages/dashboard/entrepreneur/entrepreneur-dashboard').then(m => m.EntrepreneurDashboard) },
      { path: 'dashboard/specialist', loadComponent: () => import('./pages/dashboard/specialist/specialist-dashboard').then(m => m.SpecialistDashboard) },
      
      { path: 'marketplace', loadComponent: () => import('./pages/marketplace/marketplace').then(m => m.Marketplace) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      
      { path: 'specialists', loadComponent: () => import('./pages/specialists/specialist-list/specialist-list').then(m => m.SpecialistList) },
      { path: 'specialists/new', loadComponent: () => import('./pages/specialists/specialist-form/specialist-form').then(m => m.SpecialistForm) },
      { path: 'specialists/:id', loadComponent: () => import('./pages/specialists/specialist-details/specialist-details').then(m => m.SpecialistDetails) },
      { path: 'specialists/:id/edit', loadComponent: () => import('./pages/specialists/specialist-form/specialist-form').then(m => m.SpecialistForm) },
      
      { path: 'profile/entrepreneur', loadComponent: () => import('./pages/profile/entrepreneur-profile/entrepreneur-profile').then(m => m.EntrepreneurProfile) },
      { path: 'profile/specialist', loadComponent: () => import('./pages/profile/specialist-profile/specialist-profile').then(m => m.SpecialistProfile) }
    ]
  }
];
