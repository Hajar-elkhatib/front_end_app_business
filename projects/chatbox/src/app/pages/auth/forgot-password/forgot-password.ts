import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  email = '';
  submitted = false;
  loading = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  submit() {
    if (!this.email || !this.email.includes('@')) {
      return;
    }

    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.submitted = true;
      this.loading = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
