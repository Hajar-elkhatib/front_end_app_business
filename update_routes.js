const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'projects/chatbox/src/app/app.routes.ts');

const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public Routes
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
    path: 'public-feedback/:projectId',
    loadComponent: () => import('./pages/market/public-feedback/public-feedback').then(m => m.PublicFeedback)
  },

  // Protected / Dashboard Layout
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then(m => m.MainLayout),
    children: [
      // Dashboards
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      
      // Projects Flow
      { path: 'projects', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) }, // Fallback to dash for list
      { path: 'projects/create', loadComponent: () => import('./pages/projects/project-form/project-form').then(m => m.ProjectForm) },
      { path: 'projects/:id', loadComponent: () => import('./pages/projects/project-details/project-details').then(m => m.ProjectDetails) },
      { path: 'projects/:id/edit', loadComponent: () => import('./pages/projects/project-form/project-form').then(m => m.ProjectForm) },
      { path: 'projects/:id/analysis', loadComponent: () => import('./pages/analysis/business-idea-analysis/business-idea-analysis').then(m => m.BusinessIdeaAnalysis) },
      { path: 'projects/:id/market', loadComponent: () => import('./pages/market/market-research/market-research').then(m => m.MarketResearch) },
      { path: 'projects/:id/feedback', loadComponent: () => import('./pages/market/market-feedback/market-feedback').then(m => m.MarketFeedback) },
      { path: 'projects/:id/specialists', loadComponent: () => import('./pages/specialists/specialist-recommendation/specialist-recommendation').then(m => m.SpecialistRecommendation) },
      
      // Specialists & Profile
      { path: 'specialists', loadComponent: () => import('./pages/specialists/specialist-list/specialist-list').then(m => m.SpecialistList) },
      { path: 'specialists/:id', loadComponent: () => import('./pages/specialists/specialist-details/specialist-details').then(m => m.SpecialistDetails) },
      
      // Chat & Chatbot
      { path: 'chatbot', loadComponent: () => import('./pages/chatbot/ai-chatbot/ai-chatbot').then(m => m.AiChatbot) },
      { path: 'conversations/:id', loadComponent: () => import('./pages/chat/chat-conversation/chat-conversation').then(m => m.ChatConversation) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat').then(m => m.Chat) },
      
      // Reports
      { path: 'reports', loadComponent: () => import('./pages/reports/report-list/report-list').then(m => m.ReportList) },
      { path: 'reports/:id', loadComponent: () => import('./pages/reports/report-details/report-details').then(m => m.ReportDetails) },
      
      // Help
      { path: 'help', loadComponent: () => import('./pages/help/help-center/help-center').then(m => m.HelpCenter) },

      // Admin Interface
      { path: 'admin', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'admin/users', loadComponent: () => import('./pages/admin/admin-users/admin-users').then(m => m.AdminUsers) },
      { path: 'admin/projects', loadComponent: () => import('./pages/admin/admin-projects/admin-projects').then(m => m.AdminProjects) },
      { path: 'admin/specialists', loadComponent: () => import('./pages/admin/admin-specialists/admin-specialists').then(m => m.AdminSpecialists) },
      { path: 'admin/complaints', loadComponent: () => import('./pages/admin/admin-complaints/admin-complaints').then(m => m.AdminComplaints) },
      { path: 'admin/config', loadComponent: () => import('./pages/admin/admin-config/admin-config').then(m => m.AdminConfig) }
    ]
  }
];
`;

fs.writeFileSync(routesPath, routesContent);
console.log('Routes Updated');
