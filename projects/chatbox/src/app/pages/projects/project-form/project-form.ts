import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { COUNTRY_CITY_OPTIONS, SECTOR_OPTIONS } from '../../../data/location-options';

type ProjectStage = 'IDEA_ONLY' | 'ALREADY_LAUNCHED';

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
  currentStep = 1;

  readonly steps = ['Project type', 'Basics', 'Location & market', 'Business validation'];
  readonly projectStages = [
    {
      value: 'IDEA_ONLY' as ProjectStage,
      title: 'Idea only / Not launched yet',
      description: 'You are validating a project idea before launching.'
    },
    {
      value: 'ALREADY_LAUNCHED' as ProjectStage,
      title: 'Already launched project',
      description: 'Your project already has users, customers, revenue, or real market activity.'
    }
  ];
  readonly sectors = SECTOR_OPTIONS;
  readonly countries = COUNTRY_CITY_OPTIONS.map(item => item.country);
  cityOptions: string[] = COUNTRY_CITY_OPTIONS[0].cities;
  readonly marketScopes = ['Local', 'Regional', 'National', 'International'];
  readonly competitionLevels = ['Low', 'Medium', 'High'];
  readonly currencies = ['MAD', 'EUR', 'USD'];
  readonly fundingStatuses = [
    { value: 'NO_FUNDING', label: 'No funding' },
    { value: 'SELF_FUNDED', label: 'Self funded' },
    { value: 'FAMILY_FRIENDS', label: 'Family or friends' },
    { value: 'ANGEL_INVESTOR', label: 'Angel investor' },
    { value: 'INCUBATOR_GRANT', label: 'Incubator or grant' },
    { value: 'VENTURE_CAPITAL', label: 'Venture capital' },
    { value: 'BANK_LOAN', label: 'Bank loan' }
  ];

  ngOnInit() {
    this.initForm();
    this.watchStage();
    this.watchLocationAndSector();
    this.checkMode();
  }

  initForm() {
    this.projectForm = this.fb.group({
      projectStage: ['IDEA_ONLY', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      problem: ['', [Validators.required, Validators.minLength(10)]],
      solution: ['', [Validators.required, Validators.minLength(10)]],
      sector: ['', Validators.required],
      customSector: [''],
      country: ['Morocco', Validators.required],
      customCountry: [''],
      city: ['', Validators.required],
      customCity: [''],
      targetMarketScope: ['Local', Validators.required],
      targetCustomers: ['', Validators.required],
      competitionLevel: ['Medium', Validators.required],
      teamSize: [1, [Validators.required, Validators.min(1)]],
      founderExperienceYears: [0, [Validators.required, Validators.min(0)]],
      hasPrototype: [false],
      estimatedInitialBudget: [0, [Validators.min(0)]],
      expectedMonthlyExpenses: [0, [Validators.min(0)]],
      usersOrCustomers: [0, [Validators.min(0)]],
      monthlyRevenue: [0, [Validators.min(0)]],
      monthlyExpenses: [0, [Validators.min(0)]],
      currency: ['MAD', Validators.required],
      fundingStatus: ['NO_FUNDING'],
      customerFeedbacks: [''],
      mainChallenges: [''],
      expectedSupportNeeds: ['']
    });

    this.applyStageValidators(this.projectStage);
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
        const stage = (project.projectStage || this.inferProjectStage(project)) as ProjectStage;
        const countryValue = this.countryExists(project.country) ? project.country || 'Morocco' : 'Other';
        this.updateCityOptions(countryValue, false);
        const cityValue = this.cityExists(countryValue, project.city || project.region) ? project.city || project.region : 'Other';
        const sectorValue = this.sectorExists(project.sector) ? project.sector : 'Other';
        this.projectForm.patchValue({
          projectStage: stage,
          title: project.title,
          description: project.description || project.summary,
          problem: project.problem,
          solution: project.solution,
          sector: sectorValue,
          customSector: sectorValue === 'Other' ? project.sector : '',
          country: countryValue,
          customCountry: countryValue === 'Other' ? project.country : '',
          city: cityValue,
          customCity: cityValue === 'Other' ? project.city || project.region : '',
          targetMarketScope: project.targetMarketScope || 'Local',
          targetCustomers: project.targetCustomers,
          competitionLevel: project.competitionLevel || 'Medium',
          teamSize: project.teamSize || 1,
          founderExperienceYears: project.founderExperienceYears || 0,
          hasPrototype: !!project.hasPrototype,
          estimatedInitialBudget: project.estimatedInitialBudget || 0,
          expectedMonthlyExpenses: project.expectedMonthlyExpenses || project.burnRateMillion || 0,
          usersOrCustomers: project.usersOrCustomers || project.productTractionUsers || 0,
          monthlyRevenue: project.monthlyRevenue || project.revenueMillion || 0,
          monthlyExpenses: project.monthlyExpenses || project.burnRateMillion || 0,
          currency: project.currency || 'MAD',
          fundingStatus: project.fundingStatus || 'NO_FUNDING',
          customerFeedbacks: project.customerFeedbacks || project.opinions || '',
          mainChallenges: project.mainChallenges,
          expectedSupportNeeds: project.expectedSupportNeeds
        });
        this.applyStageValidators(stage);
      } else {
        this.router.navigate(['/projects']);
      }
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  selectStage(stage: ProjectStage) {
    this.projectForm.get('projectStage')?.setValue(stage);
  }

  goToStep(step: number) {
    if (step < this.currentStep || this.isStepValid(this.currentStep)) {
      this.currentStep = step;
      this.cdr.markForCheck();
    } else {
      this.markStepTouched(this.currentStep);
    }
  }

  nextStep() {
    if (!this.isStepValid(this.currentStep)) {
      this.markStepTouched(this.currentStep);
      return;
    }
    this.currentStep = Math.min(this.currentStep + 1, this.steps.length);
  }

  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  onSubmit() {
    this.submitError = '';

    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.submitError = 'Please complete the required fields before saving your project.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    const formData = this.buildSubmissionData();

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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  get projectStage(): ProjectStage {
    return this.projectForm?.get('projectStage')?.value || 'IDEA_ONLY';
  }

  private watchStage() {
    this.projectForm.get('projectStage')?.valueChanges.subscribe(stage => {
      this.applyStageValidators(stage);
      this.cdr.markForCheck();
    });
  }

  private watchLocationAndSector() {
    this.projectForm.get('country')?.valueChanges.subscribe(country => {
      this.updateCityOptions(country, true);
      this.applyOtherValidators();
      this.cdr.markForCheck();
    });
    this.projectForm.get('city')?.valueChanges.subscribe(() => {
      this.applyOtherValidators();
      this.cdr.markForCheck();
    });
    this.projectForm.get('sector')?.valueChanges.subscribe(() => {
      this.applyOtherValidators();
      this.cdr.markForCheck();
    });
    this.applyOtherValidators();
  }

  private applyStageValidators(stage: ProjectStage) {
    const ideaRequired = ['expectedMonthlyExpenses'];
    const launchedRequired = ['usersOrCustomers', 'monthlyRevenue', 'monthlyExpenses', 'fundingStatus'];

    ideaRequired.forEach(field => this.projectForm.get(field)?.clearValidators());
    launchedRequired.forEach(field => this.projectForm.get(field)?.clearValidators());

    if (stage === 'IDEA_ONLY') {
      this.projectForm.get('expectedMonthlyExpenses')?.setValidators([Validators.required, Validators.min(0)]);
      this.projectForm.patchValue({ usersOrCustomers: 0, monthlyRevenue: 0 }, { emitEvent: false });
    } else {
      this.projectForm.get('usersOrCustomers')?.setValidators([Validators.required, Validators.min(0)]);
      this.projectForm.get('monthlyRevenue')?.setValidators([Validators.required, Validators.min(0)]);
      this.projectForm.get('monthlyExpenses')?.setValidators([Validators.required, Validators.min(0)]);
      this.projectForm.get('fundingStatus')?.setValidators([Validators.required]);
    }

    [...ideaRequired, ...launchedRequired].forEach(field => {
      this.projectForm.get(field)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private updateCityOptions(country: string, resetCity: boolean) {
    const option = COUNTRY_CITY_OPTIONS.find(item => item.country === country) || COUNTRY_CITY_OPTIONS[0];
    this.cityOptions = option.cities;
    if (resetCity) {
      this.projectForm.patchValue({ city: option.cities[0] || 'Other', customCity: '' }, { emitEvent: false });
    }
  }

  private applyOtherValidators() {
    this.setOtherValidator('customCountry', this.projectForm.get('country')?.value === 'Other');
    this.setOtherValidator('customCity', this.projectForm.get('city')?.value === 'Other');
    this.setOtherValidator('customSector', this.projectForm.get('sector')?.value === 'Other');
  }

  private setOtherValidator(field: string, required: boolean) {
    const control = this.projectForm.get(field);
    if (!control) return;
    control.setValidators(required ? [Validators.required, Validators.minLength(2)] : []);
    control.updateValueAndValidity({ emitEvent: false });
  }

  private isStepValid(step: number): boolean {
    const fields = this.fieldsForStep(step);
    return fields.every(field => this.projectForm.get(field)?.valid);
  }

  private markStepTouched(step: number) {
    this.fieldsForStep(step).forEach(field => this.projectForm.get(field)?.markAsTouched());
    this.cdr.markForCheck();
  }

  private fieldsForStep(step: number): string[] {
    if (step === 1) return ['projectStage'];
    if (step === 2) {
      const fields = ['title', 'description', 'problem', 'solution', 'sector'];
      if (this.projectForm.get('sector')?.value === 'Other') fields.push('customSector');
      return fields;
    }
    if (step === 3) {
      const fields = ['country', 'city', 'targetMarketScope', 'targetCustomers', 'competitionLevel', 'teamSize', 'founderExperienceYears'];
      if (this.projectForm.get('country')?.value === 'Other') fields.push('customCountry');
      if (this.projectForm.get('city')?.value === 'Other') fields.push('customCity');
      return fields;
    }
    if (this.projectStage === 'IDEA_ONLY') {
      return ['expectedMonthlyExpenses', 'currency'];
    }
    return ['usersOrCustomers', 'monthlyRevenue', 'monthlyExpenses', 'currency', 'fundingStatus'];
  }

  private inferProjectStage(project: any): ProjectStage {
    const hasRealActivity = Number(project.monthlyRevenue || project.revenueMillion || 0) > 0
      || Number(project.usersOrCustomers || project.productTractionUsers || 0) > 0;
    return hasRealActivity ? 'ALREADY_LAUNCHED' : 'IDEA_ONLY';
  }

  private handleSubmitError(message: string) {
    this.isSubmitting = false;
    this.submitError = message;
    this.cdr.markForCheck();
  }

  private buildSubmissionData() {
    const formData = { ...this.projectForm.value };
    formData.country = formData.country === 'Other' ? String(formData.customCountry || '').trim() : formData.country;
    formData.city = formData.city === 'Other' ? String(formData.customCity || '').trim() : formData.city;
    formData.sector = formData.sector === 'Other' ? String(formData.customSector || '').trim() : formData.sector;
    delete formData.customCountry;
    delete formData.customCity;
    delete formData.customSector;
    return formData;
  }

  private countryExists(country?: string): boolean {
    return !!country && COUNTRY_CITY_OPTIONS.some(item => item.country === country);
  }

  private cityExists(country: string, city?: string): boolean {
    const option = COUNTRY_CITY_OPTIONS.find(item => item.country === country);
    return !!city && !!option && option.cities.includes(city);
  }

  private sectorExists(sector?: string): boolean {
    return !!sector && this.sectors.includes(sector);
  }
}
