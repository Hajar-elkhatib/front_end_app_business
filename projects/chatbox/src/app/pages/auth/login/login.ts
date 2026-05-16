import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['entrepreneur']
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    const { email, password, role } = this.loginForm.value;
    this.authService.login(email, password, role).subscribe({
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
