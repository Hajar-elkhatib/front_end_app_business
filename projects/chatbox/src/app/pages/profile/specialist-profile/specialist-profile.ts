import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialist-profile.html'
})
export class SpecialistProfile {
  // Mock data for specialist profile view
  user = {
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    expertiseDomain: 'AI Engineering',
    hourlyRate: 120,
    yearsExperience: 8,
    bio: 'Senior AI Engineer with 8 years of experience building scalable machine learning models.',
    location: 'San Francisco, CA',
    skills: ['Python', 'TensorFlow', 'NLP', 'PyTorch'],
    languages: ['English', 'Spanish'],
    avatarUrl: 'S'
  };
}
