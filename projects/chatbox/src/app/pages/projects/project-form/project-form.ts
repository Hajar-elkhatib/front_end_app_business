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

  sectors = ['Technology', 'Finance', 'Health', 'Education', 'Retail', 'Energy', 'Other'];
  competitionLevels = ['Low', 'Medium', 'High'];

  ngOnInit() {
    this.initForm();
    this.checkMode();
  }

  initForm() {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
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
          description: project.description,
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
      this.submitError = 'Please complete the required fields before creating the project.';
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
}
