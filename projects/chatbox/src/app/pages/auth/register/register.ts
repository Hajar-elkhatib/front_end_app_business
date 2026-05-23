import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

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

  ngOnInit() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['entrepreneur', Validators.required],
      phone: ['', Validators.required],
      
      // Entrepreneur specific
      companyName: [''],
      businessType: [''],

      // Specialist specific
      profession: [''],
      expertiseDomain: [''],
      skillsInput: [''],
      sectorsInput: [''],
      location: [''],
      languages: [''],
      hourlyRate: [0],
      industryExperience: [0],
      bio: ['']
    });

    this.onRoleChange('entrepreneur');

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
      this.cdr.markForCheck();
    });
  }

  onRoleChange(role: 'entrepreneur' | 'specialist') {
    const entFields = ['companyName', 'businessType'];
    const specFields = ['profession', 'expertiseDomain', 'location', 'languages', 'hourlyRate', 'industryExperience', 'bio'];

    if (role === 'entrepreneur') {
      entFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
      specFields.forEach(f => this.registerForm.get(f)?.clearValidators());
    } else {
      specFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
      entFields.forEach(f => this.registerForm.get(f)?.clearValidators());
    }

    entFields.concat(specFields).forEach(f => {
      this.registerForm.get(f)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
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
        location: val.location,
        languages: val.languages,
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
}
