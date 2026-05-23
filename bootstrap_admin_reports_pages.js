const fs = require('fs');
const path = require('path');

const writeComponent = (relPath, tsCode) => {
    const compDir = path.join(__dirname, 'projects/chatbox/src/app', relPath);
    const name = path.basename(relPath);
    const tsPath = path.join(compDir, \`\${name}.ts\`);
  fs.writeFileSync(tsPath, tsCode);
  console.log('Updated ' + name);
};

// 14. Reports Page
const reportListTs = `import { Component } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { RouterModule } from '@angular/router';

    @Component({
        selector: 'app-report-list',
        standalone: true,
        imports: [CommonModule, RouterModule],
        template: \`
    <div class="container py-8">
      <h1 class="text-3xl font-bold mb-6">Generated Reports</h1>
      
      <div class="grid grid-cols-1 gap-4">
        <div class="card p-6 flex justify-between items-center bg-white" *ngFor="let rep of [1,2]">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-50 rounded text-indigo text-2xl flex items-center justify-center">📄</div>
            <div>
              <h3 class="font-bold text-lg">Business Validation Report (NexTGen AI)</h3>
              <p class="text-sm text-secondary">business_validation_report • 12 Jan 2026</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" routerLink="/reports/1">Voir</button>
            <button class="btn btn-indigo">Télécharger PDF</button>
          </div>
        </div>
      </div>
    </div>
  \`
})
export class ReportList {}
`;

    // 15. Report Details Page
    const reportDetailsTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8 max-w-4xl mx-auto">
      <div class="flex justify-between items-start mb-6">
        <button class="btn btn-secondary text-sm">← Retour aux rapports</button>
        <button class="btn btn-indigo text-sm">Télécharger PDF</button>
      </div>
      
      <div class="card bg-white shadow-xl min-h-[800px] p-12 relative overflow-hidden">
        <div class="absolute top-0 w-full h-8 bg-indigo-600 left-0"></div>
        
        <h1 class="text-4xl font-bold mt-4 mb-2 text-center text-gray-900">Rapport de Validation de Projet</h1>
        <p class="text-center text-secondary mb-12">NexTGen AI Dashboard • Généré le 12 Jan 2026</p>
        
        <h2 class="text-2xl font-bold mb-4 border-b pb-2">1. Résumé Exécutif</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-8">
          Le projet NexTGen AI présente un profil de réussite particulièrement fort (Score de 87/100).
          La taille du marché estimée à 1.5 Mds avec une forte croissance indique un potentiel significatif.
        </p>
        
        <h2 class="text-2xl font-bold mb-4 border-b pb-2">2. Scores de Performance</h2>
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-gray-50 p-4 rounded text-center"><div class="uppercase text-xs text-muted mb-1 font-bold">Business Score</div><div class="text-3xl font-bold text-indigo">87</div></div>
          <div class="bg-gray-50 p-4 rounded text-center"><div class="uppercase text-xs text-muted mb-1 font-bold">Market Score</div><div class="text-3xl font-bold text-success">92</div></div>
        </div>
        
        <h2 class="text-2xl font-bold mb-4 border-b pb-2">3. Analyse Détaillée</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-4">
          La concurrence est forte mais la croissance (12%) absorbe les nouveaux entrants.
        </p>

        <h2 class="text-2xl font-bold mb-4 border-b pb-2 mt-8">4. Recommandations</h2>
        <ul class="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Optimiser le burn rate.</li>
          <li>Améliorer le SEO avec des experts recommandés.</li>
        </ul>
        
        <div class="text-center text-xs text-muted mt-24">Document généré automatiquement par IntelliVal AI</div>
      </div>
    </div>
  \`
})
export class ReportDetails {}
`;

    // 16. Help Center Page
    const helpCenterTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8 max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Centre d'Aide & Réclamations</h1>
      
      <div class="grid grid-cols-2 gap-8">
        <div class="card bg-white">
           <h2 class="text-xl font-bold mb-4">Ouvrir un ticket</h2>
           <div class="space-y-4">
             <div><label class="block text-sm font-medium mb-1 text-secondary">Sujet</label><input type="text" class="input"></div>
             <div><label class="block text-sm font-medium mb-1 text-secondary">Catégorie</label><select class="input"><option>Bug</option><option>Facturation</option><option>Autre</option></select></div>
             <div><label class="block text-sm font-medium mb-1 text-secondary">Priorité</label><select class="input"><option>Basse</option><option>Moyenne</option><option>Haute</option></select></div>
             <div><label class="block text-sm font-medium mb-1 text-secondary">Description</label><textarea class="input" rows="4"></textarea></div>
             <button class="btn btn-indigo w-full">Envoyer au support</button>
           </div>
        </div>

        <div>
          <h2 class="text-xl font-bold mb-4">Vos Réclamations Récentes</h2>
          <div class="card p-4 mb-4" *ngFor="let i of [1]">
             <div class="flex justify-between items-center mb-2">
               <h3 class="font-bold">Facturation - Doublon</h3>
               <span class="badge badge-idea bg-warning-bg text-warning border-warning">IN PROGRESS</span>
             </div>
             <p class="text-sm text-secondary mb-2">J'ai été facturé deux fois pour le plan Pro.</p>
             <div class="text-xs text-muted">Créé hier</div>
          </div>
        </div>
      </div>
    </div>
  \`
})
export class HelpCenter {}
`;

    // 17. Admin Dashboard
    const adminDashboardTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8">
      <h1 class="text-3xl font-bold mb-6">Admin Overview</h1>
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="card bg-gray-900 text-white p-6"><div class="text-xs uppercase text-gray-400 font-bold mb-2">Utilisateurs</div><div class="text-3xl font-bold">12,456</div></div>
        <div class="card bg-indigo-600 text-white p-6"><div class="text-xs uppercase text-indigo-200 font-bold mb-2">Projets</div><div class="text-3xl font-bold">4,092</div></div>
        <div class="card bg-emerald-600 text-white p-6"><div class="text-xs uppercase text-emerald-200 font-bold mb-2">Spécialistes</div><div class="text-3xl font-bold">842</div></div>
        <div class="card bg-orange-600 text-white p-6"><div class="text-xs uppercase text-orange-200 font-bold mb-2">Réclamations</div><div class="text-3xl font-bold">14</div></div>
      </div>
    </div>
  \`
})
export class AdminDashboard {}
`;

    // 18. Admin Users
    const adminUsersTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8">
      <h1 class="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1>
      <div class="card p-0 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b"><tr><th class="p-4 font-semibold">Nom</th><th class="p-4 font-semibold">Email</th><th class="p-4 font-semibold">Role</th><th class="p-4 font-semibold">Actions</th></tr></thead>
          <tbody>
            <tr class="border-b"><td class="p-4">John Doe</td><td class="p-4 text-muted">john@e.com</td><td class="p-4"><span class="badge">Entrepreneur</span></td><td class="p-4"><button class="text-indigo-600 font-medium">Ban</button></td></tr>
            <tr class="border-b"><td class="p-4">Sarah Parker</td><td class="p-4 text-muted">sarah@e.com</td><td class="p-4"><span class="badge bg-purple-100 text-purple-700 border-purple-200">Specialist</span></td><td class="p-4"><button class="text-indigo-600 font-medium">Ban</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  \`
})
export class AdminUsers {}
`;

    // 19. Admin Projects
    const adminProjectsTs = `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule],
  template: \`<div class="container py-8"><h1 class="text-2xl font-bold mb-4">Admin Projets</h1><div class="card">Tableau des projets...</div></div>\`
})
export class AdminProjects {}
`;

    // 20. Admin Specialists
    const adminSpecialistsTs = `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-specialists',
  standalone: true,
  imports: [CommonModule],
  template: \`<div class="container py-8"><h1 class="text-2xl font-bold mb-4">Admin Spécialistes</h1><div class="card">Tableau des spécialistes...</div></div>\`
})
export class AdminSpecialists {}
`;

    // 21. Admin Complaints
    const adminComplaintsTs = `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule],
  template: \`<div class="container py-8"><h1 class="text-2xl font-bold mb-4">Admin Réclamations</h1><div class="card">En attente (14) - En cours (2)...</div></div>\`
})
export class AdminComplaints {}
`;

    // 22. Admin Config
    const adminConfigTs = `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8">
      <h1 class="text-3xl font-bold mb-6">Configuration Système</h1>
      <div class="card max-w-2xl">
         <h3 class="font-bold mb-4">Modèles IA Connectés</h3>
         <div class="flex justify-between items-center border-b pb-2 mb-4">
           <div><div class="font-medium">Startup Success LLM</div><div class="text-xs text-muted">v2.4 - FastAPI (Port 8000)</div></div>
           <span class="badge badge-launched">Actif</span>
         </div>
         <div class="flex justify-between items-center border-b pb-2 mb-4">
           <div><div class="font-medium">Sentiment Analysis HuggingFace</div><div class="text-xs text-muted">v1.0</div></div>
           <span class="badge badge-launched">Actif</span>
         </div>
      </div>
    </div>
  \`
})
export class AdminConfig {}
`;


    writeComponent('pages/reports/report-list', reportListTs);
    writeComponent('pages/reports/report-details', reportDetailsTs);
    writeComponent('pages/help/help-center', helpCenterTs);
    writeComponent('pages/admin/admin-dashboard', adminDashboardTs);
    writeComponent('pages/admin/admin-users', adminUsersTs);
    writeComponent('pages/admin/admin-projects', adminProjectsTs);
    writeComponent('pages/admin/admin-specialists', adminSpecialistsTs);
    writeComponent('pages/admin/admin-complaints', adminComplaintsTs);
    writeComponent('pages/admin/admin-config', adminConfigTs);

