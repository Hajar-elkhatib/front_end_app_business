import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

const MOROCCAN_PHONE_PATTERN = /^(?:0[67]\d{8}|\+212[67]\d{8})$/;

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
};

const requiredArrayValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  readonly companyTypes = ['SaaS', 'FinTech', 'Healthcare', 'AI', 'E-commerce', 'Education', 'Logistics', 'Manufacturing', 'Agriculture', 'Tourism', 'Other'];
  readonly businessSizes = ['Startup', 'Small Business', 'Medium Enterprise', 'Large Enterprise'];
  readonly professionOptions = ['Founder', 'Product Manager', 'Software Engineer', 'AI Engineer', 'Data Scientist', 'UX Designer', 'Marketing Strategist', 'Business Analyst', 'Consultant', 'Other'];
  readonly expertiseDomains = ['AI', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Product Strategy', 'Marketing', 'Finance', 'Operations', 'UX/UI', 'Growth'];
  readonly skillOptions = ['Python', 'TypeScript', 'Angular', 'React', 'Node.js', 'SQL', 'Machine Learning', 'LLM', 'Cloud', 'DevOps', 'Figma', 'SEO'];
  readonly sectorOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Energy', 'Logistics', 'Manufacturing', 'Agriculture', 'Tourism', 'Other'];
  readonly countries = ['Morocco', 'France', 'Spain', 'Canada', 'United States'];
  readonly countryCities: Record<string, string[]> = {
    Morocco: ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda'],
    France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille'],
    Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga'],
    Canada: ['Montreal', 'Toronto', 'Vancouver', 'Ottawa', 'Quebec City', 'Calgary'],
    'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin', 'Seattle']
  };
  readonly languageOptions = ['Arabic', 'French', 'English', 'Spanish', 'German', 'Italian'];
  filteredCountries = [...this.countries];
  filteredCities: string[] = [];
  filteredProfessions = [...this.professionOptions];
  filteredExpertise = [...this.expertiseDomains];
  filteredSkills = [...this.skillOptions];
  filteredSectors = [...this.sectorOptions];
  filteredCompanyTypes = [...this.companyTypes];
  filteredBusinessSizes = [...this.businessSizes];
  filteredLanguages = [...this.languageOptions];

  ngOnInit() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['entrepreneur', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(MOROCCAN_PHONE_PATTERN)]],
      
      // Entrepreneur specific
      companyName: [''],
      businessType: [''],

      // Specialist specific
      profession: [''],
      expertiseDomain: [''],
      skills: [[]],
      sectors: [[]],
      country: [''],
      city: [''],
      languages: [[]],
      hourlyRate: [0],
      industryExperience: [0],
      bio: ['']
    }, { validators: passwordMatchValidator });

    this.onRoleChange('entrepreneur');

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
      this.cdr.markForCheck();
    });

    this.registerForm.get('country')?.valueChanges.subscribe(country => {
      const cityControl = this.registerForm.get('city');
      const cities = this.countryCities[country] || [];
      this.filteredCities = this.filterOptions(cities, '');

      if (!cities.includes(cityControl?.value)) {
        cityControl?.setValue('');
      }
    });
  }

  onRoleChange(role: 'entrepreneur' | 'specialist') {
    const entFields = ['companyName', 'businessType'];
    const specFields = ['profession', 'expertiseDomain', 'country', 'city', 'languages', 'hourlyRate', 'industryExperience', 'bio'];

    if (role === 'entrepreneur') {
      entFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
      specFields.forEach(f => this.registerForm.get(f)?.clearValidators());
    } else {
      specFields.forEach(f => {
        const validators = ['languages', 'skills', 'sectors'].includes(f) ? [requiredArrayValidator] : [Validators.required];
        this.registerForm.get(f)?.setValidators(validators);
      });
      entFields.forEach(f => this.registerForm.get(f)?.clearValidators());
    }

    entFields.concat(specFields).forEach(f => {
      this.registerForm.get(f)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get availableCities(): string[] {
    const country = this.registerForm?.get('country')?.value;
    return this.countryCities[country] || [];
  }

  onCountrySearch(value: string) {
    this.filteredCountries = this.filterOptions(this.countries, value);
  }

  onCitySearch(value: string) {
    this.filteredCities = this.filterOptions(this.availableCities, value);
  }

  onProfessionSearch(value: string) {
    this.filteredProfessions = this.filterOptions(this.professionOptions, value);
  }

  onExpertiseSearch(value: string) {
    this.filteredExpertise = this.filterOptions(this.expertiseDomains, value);
  }

  onSkillSearch(value: string) {
    this.filteredSkills = this.filterOptions(this.skillOptions, value);
  }

  onSectorSearch(value: string) {
    this.filteredSectors = this.filterOptions(this.sectorOptions, value);
  }

  onCompanyTypeSearch(value: string) {
    this.filteredCompanyTypes = this.filterOptions(this.companyTypes, value);
  }

  onBusinessSizeSearch(value: string) {
    this.filteredBusinessSizes = this.filterOptions(this.businessSizes, value);
  }

  onLanguageSearch(value: string) {
    this.filteredLanguages = this.filterOptions(this.languageOptions, value);
  }

  selectSingleValue(field: 'companyName' | 'businessType' | 'profession' | 'expertiseDomain' | 'country' | 'city', value: string) {
    this.registerForm.get(field)?.setValue(value);
    this.registerForm.get(field)?.markAsTouched();
  }

  toggleMultiValue(field: 'skills' | 'sectors' | 'languages', value: string) {
    const control = this.registerForm.get(field);
    const current = Array.isArray(control?.value) ? control.value : [];
    const next = current.includes(value) ? current.filter((item: string) => item !== value) : [...current, value];
    control?.setValue(next);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  isMultiValueSelected(field: 'skills' | 'sectors' | 'languages', value: string): boolean {
    const current = this.registerForm?.get(field)?.value;
    return Array.isArray(current) && current.includes(value);
  }

  trackByValue(_: number, value: string) {
    return value;
  }

  toggleLanguage(language: string) {
    const control = this.registerForm.get('languages');
    const current = Array.isArray(control?.value) ? control.value : [];
    const next = current.includes(language)
      ? current.filter((item: string) => item !== language)
      : [...current, language];

    control?.setValue(next);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  isLanguageSelected(language: string): boolean {
    const current = this.registerForm?.get('languages')?.value;
    return Array.isArray(current) && current.includes(language);
  }

  get selectedLanguages(): string[] {
    const current = this.registerForm?.get('languages')?.value;
    return Array.isArray(current) ? current : [];
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const val = this.registerForm.value;

    if (val.role === 'entrepreneur') {
      const payload = {
        fullName: val.fullName,
        email: val.email,
        password: val.password,
        phone: val.phone,
        companyName: val.companyName,
        businessType: val.businessType
      };

      this.authService.registerEntrepreneur(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          alert('Registration successful! Redirecting to login...');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          alert(err.error?.message || 'Registration failed. Please check inputs.');
        }
      });
    } else {
      const payload = {
        fullName: val.fullName,
        email: val.email,
        password: val.password,
        phone: val.phone,
        profession: val.profession,
        expertiseDomain: val.expertiseDomain,
        skills: Array.isArray(val.skills) ? val.skills : [],
        sectors: Array.isArray(val.sectors) ? val.sectors : [],
        location: `${val.city}, ${val.country}`,
        languages: Array.isArray(val.languages) ? val.languages.join(', ') : val.languages,
        hourlyRate: Number(val.hourlyRate),
        industryExperience: Number(val.industryExperience),
        bio: val.bio
      };

      this.authService.registerSpecialist(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          alert('Registration successful! Redirecting to login...');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          alert(err.error?.message || 'Registration failed. Please check inputs.');
        }
      });
    }
  }

  // Helpers for validation styling
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  isConfirmPasswordInvalid(): boolean {
    const field = this.registerForm.get('confirmPassword');
    return !!field && (field.dirty || field.touched) && this.registerForm.hasError('passwordMismatch');
  }

  private filterOptions(options: string[], query: string): string[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [...options];
    }
    return options.filter(option => option.toLowerCase().includes(normalized));
  }
}
