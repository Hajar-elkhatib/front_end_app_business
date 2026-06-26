import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrls: ['./project-form.css']
})
export class ProjectForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);

  projectForm!: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  submitError = '';
  requiredFieldLabels: Record<string, string> = {
    title: 'Project title',
    summary: 'Project summary',
    sector: 'Project sector'
  };

  competitionLevels = ['Low', 'Medium', 'High'];
  countries = ['Morocco', 'France', 'Spain', 'Canada', 'United States'];
  sectors = ['Technology', 'Finance', 'Health', 'Education', 'Retail', 'Energy', 'Other'];
  regionsByCountry: Record<string, string[]> = {
    Morocco: ['Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Marrakech-Safi', 'Tanger-Tétouan-Al Hoceïma'],
    France: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur'],
    Spain: ['Madrid', 'Catalonia', 'Andalusia'],
    Canada: ['Ontario', 'Quebec', 'British Columbia'],
    'United States': ['California', 'New York', 'Texas', 'Washington']
  };

  ngOnInit() {
    this.initForm();
    this.checkMode();
    this.projectForm.get('country')?.valueChanges.subscribe(country => {
      const region = this.projectForm.get('region');
      if (!this.availableRegions.includes(region?.value)) {
        region?.setValue('');
      }
    });
  }

  initForm() {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      summary: ['', [Validators.required, Validators.minLength(20)]],
      sector: ['', Validators.required],
      country: [''],
      countryCode: [''],
      region: [''],
      keyword: [''],
      founderExperienceYears: [0],
      fundingRounds: [0],
      teamSize: [0],
      marketSizeBillion: [0],
      marketGrowthRatePercent: [0],
      productTractionUsers: [0],
      burnRateMillion: [0],
      revenueMillion: [0],
      runwayMonths: [0],
      founderBackground: [''],
      competitionLevel: [''],
      searchTrendScore: [0],
      viewsWorldRank: [0],
      opinions: ['']
    });
  }

  get availableRegions(): string[] {
    const country = this.projectForm?.get('country')?.value;
    return this.regionsByCountry[country] || [];
  }

  checkMode() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.projectId = id;
        this.loadProjectForEdit(id);
      }
    });
  }

  loadProjectForEdit(id: string) {
    this.isLoading = true;
    this.projectService.getProjectById(id).subscribe(project => {
      if (project) {
        this.projectForm.patchValue({
          title: project.title,
          summary: project.summary || project.description,
          sector: project.sector,
          country: project.country,
          countryCode: project.countryCode,
          region: project.region,
          keyword: project.keyword,
          founderExperienceYears: project.founderExperienceYears,
          fundingRounds: project.fundingRounds,
          teamSize: project.teamSize,
          marketSizeBillion: project.marketSizeBillion,
          marketGrowthRatePercent: project.marketGrowthRatePercent,
          productTractionUsers: project.productTractionUsers,
          burnRateMillion: project.burnRateMillion,
          revenueMillion: project.revenueMillion,
          runwayMonths: project.runwayMonths,
          founderBackground: project.founderBackground,
          competitionLevel: project.competitionLevel,
          searchTrendScore: project.searchTrendScore,
          viewsWorldRank: project.viewsWorldRank,
          opinions: project.opinions
        });
      } else {
        this.router.navigate(['/projects']);
      }
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  onSubmit() {
    this.submitError = '';

    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      const invalidFields = Object.keys(this.projectForm.controls)
        .filter(fieldName => this.projectForm.get(fieldName)?.invalid)
        .map(fieldName => this.requiredFieldLabels[fieldName] || fieldName);

      this.submitError = `Please complete or correct: ${invalidFields.join(', ')}.`;
      setTimeout(() => {
        document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    const formData = this.projectForm.value;

    if (this.isEditMode && this.projectId) {
      this.projectService.updateProject(this.projectId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/projects', this.projectId]);
        },
        error: () => this.handleSubmitError('Project update failed. Please check the backend connection and try again.')
      });
    } else {
      this.projectService.createProject(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/projects']);
        },
        error: () => this.handleSubmitError('Project creation failed. Please check the backend connection and try again.')
      });
    }
  }

  private handleSubmitError(message: string) {
    this.isSubmitting = false;
    this.submitError = message;
    this.cdr.markForCheck();
  }

  // Helpers for validation styling
  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: string, label: string): string {
    const field = this.projectForm.get(fieldName);
    if (!field || !field.errors || !(field.dirty || field.touched)) {
      return '';
    }

    if (field.errors['required']) {
      return `* ${label} is required.`;
    }

    if (field.errors['minlength']) {
      return `* ${label} must be at least ${field.errors['minlength'].requiredLength} characters.`;
    }

    if (field.errors['min']) {
      return `* ${label} must be greater than or equal to ${field.errors['min'].min}.`;
    }

    if (field.errors['max']) {
      return `* ${label} must be less than or equal to ${field.errors['max'].max}.`;
    }

    return `* ${label} is invalid.`;
  }
}
