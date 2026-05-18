import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
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
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'dashboard/entrepreneur', loadComponent: () => import('./pages/dashboard/entrepreneur/entrepreneur-dashboard').then(m => m.EntrepreneurDashboard) },
      { path: 'dashboard/specialist', loadComponent: () => import('./pages/dashboard/specialist/specialist-dashboard').then(m => m.SpecialistDashboard) },

      { path: 'marketplace', loadComponent: () => import('./pages/marketplace/marketplace').then(m => m.Marketplace) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },

      { path: 'specialists', loadComponent: () => import('./pages/specialists/specialist-list/specialist-list').then(m => m.SpecialistList) },
      { path: 'specialists/new', loadComponent: () => import('./pages/specialists/specialist-form/specialist-form').then(m => m.SpecialistForm) },
      { path: 'specialists/:id', loadComponent: () => import('./pages/specialists/specialist-details/specialist-details').then(m => m.SpecialistDetails) },
      { path: 'specialists/:id/edit', loadComponent: () => import('./pages/specialists/specialist-form/specialist-form').then(m => m.SpecialistForm) },

      { path: 'projects', loadComponent: () => import('./pages/projects/project-list/project-list').then(m => m.ProjectList) },
      { path: 'projects/create', loadComponent: () => import('./pages/projects/project-form/project-form').then(m => m.ProjectForm) },
      { path: 'projects/:id', loadComponent: () => import('./pages/projects/project-details/project-details').then(m => m.ProjectDetails) },
      { path: 'projects/:id/edit', loadComponent: () => import('./pages/projects/project-form/project-form').then(m => m.ProjectForm) },

      { path: 'profile/entrepreneur', loadComponent: () => import('./pages/profile/entrepreneur-profile/entrepreneur-profile').then(m => m.EntrepreneurProfile) },
      { path: 'profile/specialist', loadComponent: () => import('./pages/profile/specialist-profile/specialist-profile').then(m => m.SpecialistProfile) }
    ]
  }
];
