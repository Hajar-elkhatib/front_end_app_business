import { Routes } from '@angular/router';
import { authGuard, dashboardRedirectGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingPage)
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
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', canActivate: [dashboardRedirectGuard], loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'dashboard/entrepreneur/specialist-recommendations', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-recommendation/specialist-recommendation').then(m => m.SpecialistRecommendation) },
      { path: 'dashboard/entrepreneur/specialists', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-list/specialist-list').then(m => m.SpecialistList) },
      { path: 'dashboard/entrepreneur/specialists/:id', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-details/specialist-details').then(m => m.SpecialistDetails) },
      { path: 'dashboard/entrepreneur/conversations', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      { path: 'dashboard/entrepreneur/conversations/:conversationId', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      { path: 'dashboard/specialist/conversations', canActivate: [roleGuard], data: { roles: ['specialist'] }, loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      { path: 'dashboard/specialist/conversations/:conversationId', canActivate: [roleGuard], data: { roles: ['specialist'] }, loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      { path: 'dashboard/entrepreneur', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/dashboard/entrepreneur/entrepreneur-dashboard').then(m => m.EntrepreneurDashboard) },
      { path: 'dashboard/specialist', canActivate: [roleGuard], data: { roles: ['specialist'] }, loadComponent: () => import('./pages/dashboard/specialist/specialist-dashboard').then(m => m.SpecialistDashboard) },
      { path: 'entrepreneur/dashboard', redirectTo: 'dashboard/entrepreneur', pathMatch: 'full' },
      { path: 'specialist/dashboard', redirectTo: 'dashboard/specialist', pathMatch: 'full' },
      { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
      { path: 'admin/dashboard', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'admin/users', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-users/admin-users').then(m => m.AdminUsers) },
      { path: 'admin/projects', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-projects/admin-projects').then(m => m.AdminProjects) },
      { path: 'admin/projects/:id', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-project-details/admin-project-details').then(m => m.AdminProjectDetails) },
      { path: 'admin/specialists', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-specialists/admin-specialists').then(m => m.AdminSpecialists) },
      { path: 'admin/support-requests', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-support-requests/admin-support-requests').then(m => m.AdminSupportRequests) },
      { path: 'admin/entrepreneurs', redirectTo: 'admin/users', pathMatch: 'full' },
      { path: 'admin/complaints', canActivate: [roleGuard], data: { roles: ['admin'], collection: 'complaints' }, loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'admin/reports', canActivate: [roleGuard], data: { roles: ['admin'] }, loadComponent: () => import('./pages/admin/admin-reports/admin-reports').then(m => m.AdminReports) },
      { path: 'admin/ai-models', canActivate: [roleGuard], data: { roles: ['admin'], collection: 'ml_models' }, loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },

      { path: 'marketplace', redirectTo: 'specialists', pathMatch: 'full' },
      { path: 'chat', redirectTo: 'conversations', pathMatch: 'full' },
      { path: 'conversations', canActivate: [roleGuard], data: { roles: ['entrepreneur', 'specialist'] }, loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      { path: 'conversations/:conversationId', canActivate: [roleGuard], data: { roles: ['entrepreneur', 'specialist'] }, loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      { path: 'entrepreneur/conversations', redirectTo: 'conversations', pathMatch: 'full' },
      { path: 'entrepreneur/conversations/:conversationId', redirectTo: 'conversations/:conversationId', pathMatch: 'full' },

      { path: 'specialists', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-list/specialist-list').then(m => m.SpecialistList) },
      { path: 'specialists/:id', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-details/specialist-details').then(m => m.SpecialistDetails) },

      { path: 'projects', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/projects/project-list/project-list').then(m => m.ProjectList) },
      { path: 'projects/create', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/projects/project-form/project-form').then(m => m.ProjectForm) },
      { path: 'projects/:id', canActivate: [roleGuard], data: { roles: ['entrepreneur', 'specialist'] }, loadComponent: () => import('./pages/projects/project-details/project-details').then(m => m.ProjectDetails) },
      { path: 'projects/:id/edit', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/projects/project-form/project-form').then(m => m.ProjectForm) },
      { path: 'projects/:id/reports', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/reports/report-list/report-list').then(m => m.ReportList) },
      { path: 'projects/:id/specialist-recommendations', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-recommendation/specialist-recommendation').then(m => m.SpecialistRecommendation) },
      { path: 'projects/:id/analysis/business-idea', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/analysis/business-idea-analysis/business-idea-analysis').then(m => m.BusinessIdeaAnalysis) },

      { path: 'analysis/business-idea', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/analysis/business-idea-analysis/business-idea-analysis').then(m => m.BusinessIdeaAnalysis) },
      { path: 'analysis/business-idea/new', redirectTo: 'analysis/business-idea', pathMatch: 'full' },
      { path: 'analysis/business-idea/:id/edit', redirectTo: 'analysis/business-idea', pathMatch: 'full' },
      { path: 'analysis/market', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/market/market-research/market-research').then(m => m.MarketResearch) },
      { path: 'analysis/competitors', canActivate: [roleGuard], data: { roles: ['entrepreneur'], title: 'Competitor Analysis', kicker: 'AI Analysis', description: 'Competitor strength, weakness, share, and pricing position outputs.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },
      { path: 'analysis/sentiment', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/market/market-feedback/market-feedback').then(m => m.MarketFeedback) },
      { path: 'recommendations', canActivate: [roleGuard], data: { roles: ['entrepreneur'], title: 'Recommendations', kicker: 'AI Recommendations', description: 'AI-generated recommendations and priorities will appear here.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },
      { path: 'reports', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/reports/report-list/report-list').then(m => m.ReportList) },
      { path: 'reports/new', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'reports/:id/edit', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'chatbot', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/chatbot/ai-chatbot/ai-chatbot').then(m => m.AiChatbot) },
      { path: 'chatbot/new', redirectTo: 'chatbot', pathMatch: 'full' },
      { path: 'chatbot/:id/edit', redirectTo: 'chatbot', pathMatch: 'full' },
      { path: 'knowledge-documents', canActivate: [roleGuard], data: { roles: ['entrepreneur'], title: 'Knowledge Documents', kicker: 'RAG', description: 'Knowledge documents for retrieval augmented generation.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },
      { path: 'specialist-recommendations', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/specialists/specialist-recommendation/specialist-recommendation').then(m => m.SpecialistRecommendation) },
      { path: 'complaints', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/complaints/complaint-list/complaint-list').then(m => m.ComplaintList) },
      { path: 'complaints/new', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/complaints/complaint-form/complaint-form').then(m => m.ComplaintForm) },
      { path: 'complaints/:id/edit', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/complaints/complaint-form/complaint-form').then(m => m.ComplaintForm) },

      { path: 'specialist/profile', canActivate: [roleGuard], data: { roles: ['specialist'] }, loadComponent: () => import('./pages/profile/specialist-profile/specialist-profile').then(m => m.SpecialistProfile) },
      { path: 'specialist/availability', canActivate: [roleGuard], data: { roles: ['specialist'], title: 'Availability Management', kicker: 'Specialist', description: 'Manage available dates, time windows, session limits, and status.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },
      { path: 'specialist/assigned-projects', canActivate: [roleGuard], data: { roles: ['specialist'] }, loadComponent: () => import('./pages/dashboard/specialist/specialist-dashboard').then(m => m.SpecialistDashboard) },
      { path: 'specialist/conversations', redirectTo: 'conversations', pathMatch: 'full' },
      { path: 'specialist/conversations/:conversationId', redirectTo: 'conversations/:conversationId', pathMatch: 'full' },
      { path: 'specialist/evaluations', canActivate: [roleGuard], data: { roles: ['specialist'], title: 'Evaluations', kicker: 'Specialist', description: 'Entrepreneur evaluations and review history.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },

      { path: 'profile/entrepreneur', canActivate: [roleGuard], data: { roles: ['entrepreneur'] }, loadComponent: () => import('./pages/profile/entrepreneur-profile/entrepreneur-profile').then(m => m.EntrepreneurProfile) },
      { path: 'profile/specialist', canActivate: [roleGuard], data: { roles: ['specialist'] }, loadComponent: () => import('./pages/profile/specialist-profile/specialist-profile').then(m => m.SpecialistProfile) },
      { path: 'profile', data: { title: 'Profile', kicker: 'User', description: 'General profile space for users without a role-specific dashboard.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },
      { path: 'settings', data: { title: 'Settings', kicker: 'User', description: 'Account settings will appear here.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) },
      { path: 'notifications', data: { title: 'Notifications', kicker: 'User', description: 'Your notifications will appear here.' }, loadComponent: () => import('./pages/workspace/empty-workspace-page').then(m => m.EmptyWorkspacePage) }
    ]
  },
  { path: '**', loadComponent: () => import('./pages/errors/not-found').then(m => m.NotFound) }
];

