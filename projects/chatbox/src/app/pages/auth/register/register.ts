import { Component } from '@angular/core';
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
export class Register {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['entrepreneur', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.authService.getDashboardRoute()]);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
