import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialist-profile.html'
})
export class SpecialistProfile implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isSaving = false;

  user = {
    fullName: '',
    email: '',
    profession: '',
    expertiseDomain: '',
    hourlyRate: 0,
    yearsExperience: 0,
    bio: '',
    location: '',
    skills: [] as string[],
    languages: [] as string[],
    avatarUrl: 'S'
  };

  // Temp working strings for list variables
  skillsString = '';
  languagesString = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const currentUser = this.authService.currentUser;
    if (currentUser && currentUser.id) {
      this.isLoading = true;
      this.authService.getSpecialistProfile(currentUser.id).subscribe({
        next: (res) => {
          this.user = {
            fullName: res.fullName || currentUser.fullName || 'Specialist',
            email: res.email || currentUser.email || '',
            profession: res.profession || '',
            expertiseDomain: res.expertiseDomain || '',
            hourlyRate: res.hourlyRate || 0,
            yearsExperience: res.industryExperience || 0,
            bio: res.bio || '',
            location: res.location || '',
            skills: res.skills || [],
            languages: Array.isArray(res.languages) ? res.languages : (res.languages ? res.languages.split(',').map((l: string) => l.trim()) : []),
            avatarUrl: (res.fullName || currentUser.fullName || 'S')[0].toUpperCase()
          };
          this.skillsString = this.user.skills.join(', ');
          this.languagesString = this.user.languages.join(', ');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error fetching specialist profile', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  saveChanges() {
    const currentUser = this.authService.currentUser;
    if (currentUser && currentUser.id) {
      this.isSaving = true;

      const payload = {
        profession: this.user.profession,
        expertiseDomain: this.user.expertiseDomain,
        skills: this.skillsString ? this.skillsString.split(',').map(s => s.trim()).filter(Boolean) : [],
        sectors: [],
        location: this.user.location,
        languages: this.languagesString,
        hourlyRate: Number(this.user.hourlyRate),
        industryExperience: Number(this.user.yearsExperience),
        bio: this.user.bio
      };

      this.authService.updateSpecialistProfile(currentUser.id, payload).subscribe({
        next: (res) => {
          this.user = {
            ...this.user,
            profession: res.profession || this.user.profession,
            expertiseDomain: res.expertiseDomain || this.user.expertiseDomain,
            hourlyRate: res.hourlyRate || this.user.hourlyRate,
            yearsExperience: res.industryExperience || this.user.yearsExperience,
            bio: res.bio || this.user.bio,
            location: res.location || this.user.location,
            skills: res.skills || [],
            languages: res.languages ? res.languages.split(',').map((l: string) => l.trim()) : this.user.languages,
            avatarUrl: (this.user.fullName)[0].toUpperCase()
          };
          this.skillsString = this.user.skills.join(', ');
          this.languagesString = this.user.languages.join(', ');
          this.isSaving = false;
          this.cdr.markForCheck();
          alert('Profile updated successfully!');
        },
        error: (err) => {
          console.error('Error updating specialist profile', err);
          this.isSaving = false;
          this.cdr.markForCheck();
          alert('Failed to save profile. Please check parameters.');
        }
      });
    }
  }
}
