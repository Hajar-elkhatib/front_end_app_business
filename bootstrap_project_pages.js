const fs = require('fs');
const path = require('path');

const writeComponent = (relPath, tsCode, htmlCode) => {
    const compDir = path.join(__dirname, 'projects/chatbox/src/app', relPath);
    const name = path.basename(relPath);
    const tsPath = path.join(compDir, \`\${name}.ts\`);
  
  // Update ts to point to inline template for simplicity, or we can write the .html file
  const isInline = !htmlCode;
  
  if (isInline) {
    fs.writeFileSync(tsPath, tsCode);
  } else {
    fs.writeFileSync(tsPath, tsCode);
    const htmlPath = path.join(compDir, \`\${name}.html\`);
    fs.writeFileSync(htmlPath, htmlCode);
  }
  console.log('Updated ' + name);
};

// 1. Project Form
const projectFormTs = `import { Component, OnInit, inject } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
    import { ActivatedRoute, Router, RouterModule } from '@angular/router';
    import { ProjectService } from '../../../services/project.service';

    @Component({
        selector: 'app-project-form',
        standalone: true,
        imports: [CommonModule, RouterModule, ReactiveFormsModule],
        templateUrl: './project-form.html',
        styles: [\`
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s-4); }
    @media(max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
    .form-group { margin-bottom: var(--s-4); }
    .label { display: block; font-weight: 500; margin-bottom: var(--s-2); font-size: 0.875rem; color: var(--text-secondary); }
    .page-header { margin-bottom: var(--s-6); border-bottom: 1px solid var(--border-color); padding-bottom: var(--s-4); }
  \`]
})
export class ProjectForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectForm!: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  isLoading = false;
  isSubmitting = false;

  sectors = ['Technology', 'E-commerce', 'Health', 'Finance', 'Education', 'Other'];
  statuses = ['IDEA', 'IN_PROGRESS', 'LAUNCHED'];

  ngOnInit() {
    this.initForm();
    this.checkMode();
  }

  initForm() {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      sector: ['Technology', Validators.required],
      country: [''],
      countryCode: [''],
      keyword: [''],
      projectStatus: ['IDEA', Validators.required],
      founderExperienceYears: [0],
      fundingRounds: [0],
      teamSize: [1],
      marketSizeBillion: [0],
      marketGrowthRatePercent: [0],
      productTractionUsers: [0],
      burnRateMillion: [0],
      revenueMillion: [0],
      investorType: ['Business Angel'],
      founderBackground: ['Technical'],
      competitionLevel: ['Medium'],
      searchTrendScore: [50],
      useWorldBank: [true]
    });
  }

  checkMode() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.projectId = id;
        // Mock load
      }
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    
    // Simulating save then redirect
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/projects']);
    }, 1000);
  }
}
`;

        const projectFormHtml = `<div class="container py-8">
  <div class="page-header flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold">{{ isEditMode ? 'Modifier Projet' : 'Créer un Projet' }}</h1>
      <p class="text-secondary">Renseignez les détails pour l'analyse IA</p>
    </div>
  </div>

  <div class="card">
    <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
      
      <h3 class="font-semibold text-lg mb-4 text-indigo">Informations Générales</h3>
      <div class="form-group">
        <label class="label">Nom du Projet</label>
        <input type="text" class="input" formControlName="title" placeholder="Ex: NexaCorp">
      </div>
      
      <div class="form-group">
        <label class="label">Description</label>
        <textarea class="input" rows="3" formControlName="description"></textarea>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="label">Secteur</label>
          <select class="input" formControlName="sector">
            <option *ngFor="let s of sectors" [value]="s">{{s}}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Statut</label>
          <select class="input" formControlName="projectStatus">
            <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Pays</label>
          <input type="text" class="input" formControlName="country">
        </div>
        <div class="form-group">
          <label class="label">Code Pays (ex: FR, US)</label>
          <input type="text" class="input" formControlName="countryCode">
        </div>
        <div class="form-group">
          <label class="label">Mot-clé principal</label>
          <input type="text" class="input" formControlName="keyword">
        </div>
      </div>

      <hr class="my-6" style="border-color: var(--border-color); margin: 2rem 0;">

      <h3 class="font-semibold text-lg mb-4 text-indigo">Données Fondateur & Marché</h3>
      <div class="form-grid">
        <div class="form-group">
          <label class="label">Expérience du fondateur (années)</label>
          <input type="number" class="input" formControlName="founderExperienceYears">
        </div>
        <div class="form-group">
          <label class="label">Taille de l'équipe</label>
          <input type="number" class="input" formControlName="teamSize">
        </div>
        <div class="form-group">
          <label class="label">Taille Marché (Milliards)</label>
          <input type="number" class="input" formControlName="marketSizeBillion">
        </div>
        <div class="form-group">
          <label class="label">Croissance Marché (%)</label>
          <input type="number" class="input" formControlName="marketGrowthRatePercent">
        </div>
        <div class="form-group">
          <label class="label">Niveau de Concurrence</label>
          <select class="input" formControlName="competitionLevel">
            <option value="Low">Faible</option>
            <option value="Medium">Moyen</option>
            <option value="High">Élevé</option>
          </select>
        </div>
      </div>

      <hr class="my-6" style="border-color: var(--border-color); margin: 2rem 0;">
      
      <h3 class="font-semibold text-lg mb-4 text-indigo">Données Financières</h3>
      <div class="form-grid">
        <div class="form-group">
          <label class="label">Tours de financement</label>
          <input type="number" class="input" formControlName="fundingRounds">
        </div>
        <div class="form-group">
          <label class="label">Utilisateurs actuels</label>
          <input type="number" class="input" formControlName="productTractionUsers">
        </div>
        <div class="form-group">
          <label class="label">Revenu (Millions)</label>
          <input type="number" class="input" formControlName="revenueMillion">
        </div>
        <div class="form-group">
          <label class="label">Burn rate (Millions)</label>
          <input type="number" class="input" formControlName="burnRateMillion">
        </div>
      </div>

      <div class="form-group mt-4 flex items-center gap-2">
        <input type="checkbox" formControlName="useWorldBank" id="wb">
        <label for="wb" class="text-sm font-medium">Utiliser les données World Bank lors de l'analyse</label>
      </div>

      <div class="mt-8 flex gap-4 justify-end">
        <button type="button" routerLink="/dashboard" class="btn btn-secondary">Annuler</button>
        <button type="submit" class="btn btn-indigo" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer Projet' }}
        </button>
      </div>
    </form>
  </div>
</div>
`;

        // 2. Project Details Page
        const projectDetailsTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: \`
    <div class="container py-8">
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold">NexTGen AI Dashboard</h1>
            <span class="badge badge-idea">IN_PROGRESS</span>
          </div>
          <p class="text-secondary w-2/3">Une plateforme IA d'aide à la décision pour les managers.</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="edit" class="btn btn-secondary">Modifier projet</a>
          <button class="btn btn-indigo">Lancer analyse IA</button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="card col-span-2">
          <h3 class="font-semibold mb-4 text-lg border-b pb-2">Infos Métier & Marché</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-muted block">Secteur</span><span class="font-medium">Technology</span></div>
            <div><span class="text-muted block">Pays</span><span class="font-medium">France (FR)</span></div>
            <div><span class="text-muted block">Concurrence</span><span class="font-medium">Medium</span></div>
            <div><span class="text-muted block">Taille Marché</span><span class="font-medium">1.5 Milliards</span></div>
          </div>
        </div>
        <div class="card">
          <h3 class="font-semibold mb-4 text-lg border-b pb-2">Dernière Synthèse IA</h3>
          <div class="flex flex-col gap-3">
             <div class="flex justify-between"><span class="text-muted">Score global</span> <span class="font-bold text-indigo">84/100</span></div>
             <div class="flex justify-between"><span class="text-muted">Prédiction</span> <span class="badge badge-launched">Success</span></div>
             <a routerLink="analysis" class="btn btn-secondary text-sm flex justify-center mt-2">Détails de l'analyse</a>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-bold mb-4">Fonctionnalités avancées</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="card hover:border-indigo-300 cursor-pointer" routerLink="market">
          <h3 class="font-semibold text-lg flex items-center gap-2">📊 Analyse du Marché</h3>
          <p class="text-sm text-secondary mt-2">Explorer la croissance, les tendances World Bank, etc.</p>
        </div>
        <div class="card hover:border-indigo-300 cursor-pointer" routerLink="feedback">
          <h3 class="font-semibold text-lg flex items-center gap-2">💬 Opinions Utilisateurs</h3>
          <p class="text-sm text-secondary mt-2">Analyse de sentiment sur les retours publics.</p>
        </div>
        <div class="card hover:border-indigo-300 cursor-pointer" routerLink="specialists">
          <h3 class="font-semibold text-lg flex items-center gap-2">👥 Spécialistes Recommandés</h3>
          <p class="text-sm text-secondary mt-2">Trouvez des experts (Dev, Marketing, Finance).</p>
        </div>
        <div class="card hover:border-indigo-300 cursor-pointer" routerLink="/chatbot">
          <h3 class="font-semibold text-lg flex items-center gap-2">🤖 Chatbot Advisor</h3>
          <p class="text-sm text-secondary mt-2">Discutez avec l'IA en contexte de ce projet.</p>
        </div>
      </div>
    </div>
  \`
})
export class ProjectDetails {}
`;

        // 3. Business Idea Analysis
        const businessIdeaAnalysisTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-business-idea-analysis',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="container py-8">
      <h1 class="text-3xl font-bold mb-2">Résultats de Validation IA</h1>
      <p class="text-secondary mb-6">Analyse complète basée sur notre modèle prédictif Startup Success.</p>
      
      <div class="grid grid-cols-3 gap-6 mb-6">
        <div class="card flex flex-col justify-center items-center text-center p-8 bg-indigo-50 border-indigo-100">
          <div class="text-sm font-semibold text-indigo-700 mb-1 uppercase tracking-wider">Business Validation Score</div>
          <div class="text-5xl font-bold text-indigo-600 mb-2">87<span class="text-2xl text-indigo-400">/100</span></div>
          <div class="badge badge-launched text-sm">PROBABILITÉ: SUCCÈS</div>
        </div>
        <div class="card col-span-2">
          <h3 class="font-semibold mb-4 text-lg">Scores détaillés</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-32 text-sm font-medium text-secondary">Startup Success</div>
              <div class="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden"><div class="bg-indigo h-full" style="width: 85%"></div></div>
              <div class="w-10 text-sm font-bold text-right">85</div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-32 text-sm font-medium text-secondary">Market Analysis</div>
              <div class="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden"><div class="bg-emerald-500 h-full bg-success" style="width: 92%"></div></div>
              <div class="w-10 text-sm font-bold text-right">92</div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-32 text-sm font-medium text-secondary">Market Opinion</div>
              <div class="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden"><div class="bg-warning h-full" style="width: 78%"></div></div>
              <div class="w-10 text-sm font-bold text-right">78</div>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
             <button class="btn btn-primary">Générer Rapport PDF</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="card relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-success"></div>
          <h3 class="font-semibold mb-3">Forces du projet</h3>
          <ul class="space-y-2 text-sm text-secondary">
            <li class="flex gap-2"><span>✅</span> Le marché est en forte croissance globale (+14%).</li>
            <li class="flex gap-2"><span>✅</span> L'expérience du fondateur (8 ans) est un fort indicateur de succès.</li>
            <li class="flex gap-2"><span>✅</span> Traction précoce intéressante (1000 utilisateurs).</li>
          </ul>
        </div>
        <div class="card relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-danger"></div>
          <h3 class="font-semibold mb-3">Faiblesses & Limites</h3>
          <ul class="space-y-2 text-sm text-secondary">
            <li class="flex gap-2"><span>⚠️</span> Le Burn Rate est élevé comparativement aux revenus.</li>
            <li class="flex gap-2"><span>⚠️</span> Le secteur visé est fortement concurrentiel.</li>
          </ul>
        </div>
      </div>

      <div class="card mt-6 border-indigo-200">
        <h3 class="font-semibold mb-3 text-indigo-700 flex items-center gap-2">🤖 Recommandations IA</h3>
        <p class="text-sm mb-3">Pour optimiser vos chances de réussite, nous suggérons les actions suivantes:</p>
        <div class="bg-indigo-50 p-4 rounded-md text-sm text-indigo-900 mb-4">
          1. Rationaliser le burn rate immédiatement en différant certains recrutements.<br><br>
          2. Trouver une différenciation de niche pour contourner la concurrence "High".<br><br>
          3. S'engager avec un conseiller marketing pour améliorer l'opinion du marché.
        </div>
      </div>
    </div>
  \`
})
export class BusinessIdeaAnalysis {}
`;

        writeComponent('pages/projects/project-form', projectFormTs, projectFormHtml);
writeComponent('pages/projects/project-details', projectDetailsTs, '');
writeComponent('pages/analysis/business-idea-analysis', businessIdeaAnalysisTs, '');
