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
  readonly countryCities: Record<string, string[]> = {
    Morocco: ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda'],
    France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille'],
    Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga'],
    Canada: ['Montreal', 'Toronto', 'Vancouver', 'Ottawa', 'Quebec City', 'Calgary'],
    'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin', 'Seattle']
  };
  readonly languageOptions = ['Arabic', 'French', 'English', 'Spanish', 'German', 'Italian'];

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
      skillsInput: [''],
      sectorsInput: [''],
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
        const validators = f === 'languages' ? [requiredArrayValidator] : [Validators.required];
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
        skills: val.skillsInput ? val.skillsInput.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        sectors: val.sectorsInput ? val.sectorsInput.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
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
}
