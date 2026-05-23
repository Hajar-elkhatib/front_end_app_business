import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-entrepreneur-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './entrepreneur-profile.html',
  styleUrls: ['./entrepreneur-profile.css']
})
export class EntrepreneurProfile implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isEditing = false;
  isLoading = false;

  user = {
    fullName: '',
    email: '',
    companyName: '',
    companyWebsite: '',
    industry: '',
    businessType: '',
    bio: '',
    location: '',
    phone: '',
    avatarInitial: 'U',
    joinedDate: ''
  };

  editUser = { ...this.user };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const currentUser = this.authService.currentUser;
    if (currentUser && currentUser.id) {
      this.isLoading = true;
      this.authService.getEntrepreneurProfile(currentUser.id).subscribe({
        next: (res) => {
          this.user = {
            fullName: res.fullName || currentUser.fullName || 'Entrepreneur',
            email: res.email || currentUser.email || '',
            companyName: res.companyName || '',
            companyWebsite: '',
            industry: '',
            businessType: res.businessType || '',
            bio: '',
            location: '',
            phone: res.phone || currentUser.phone || '',
            avatarInitial: (res.fullName || currentUser.fullName || 'E')[0].toUpperCase(),
            joinedDate: currentUser.createdAt ? String(currentUser.createdAt) : ''
          };
          this.editUser = { ...this.user };
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading entrepreneur profile', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  toggleEdit() {
    this.isEditing = true;
    this.editUser = { ...this.user };
  }

  saveEdit() {
    const currentUser = this.authService.currentUser;
    if (currentUser && currentUser.id) {
      this.isLoading = true;
      const requestPayload = {
        companyName: this.editUser.companyName,
        businessType: this.editUser.businessType,
        phone: this.editUser.phone
      };

      this.authService.updateEntrepreneurProfile(currentUser.id, requestPayload).subscribe({
        next: (res) => {
          this.user = { 
            ...this.editUser,
            fullName: res.fullName || this.editUser.fullName,
            email: res.email || this.editUser.email,
            companyName: res.companyName || this.editUser.companyName,
            businessType: res.businessType || this.editUser.businessType,
            phone: res.phone || this.editUser.phone,
            avatarInitial: (res.fullName || this.editUser.fullName || 'E')[0].toUpperCase()
          };
          this.isEditing = false;
          this.isLoading = false;
          this.cdr.markForCheck();
          alert('Profile updated successfully!');
        },
        error: (err) => {
          console.error('Error updating entrepreneur profile', err);
          this.isLoading = false;
          this.cdr.markForCheck();
          alert('Failed to update profile. Please try again.');
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
