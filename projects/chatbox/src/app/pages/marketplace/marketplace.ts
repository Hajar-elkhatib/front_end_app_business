import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.css']
})
export class Marketplace {
  allSpecialists = [
    { id: 1, name: 'Alex Rivera', expertise: 'Frontend Architect', rating: 4.9, reviews: 124, available: true, avatar: 'A', hourlyRate: 95 },
    { id: 2, name: 'Sophia Chen', expertise: 'AI Integration', rating: 5.0, reviews: 89, available: false, avatar: 'S', hourlyRate: 130 },
    { id: 3, name: 'Marcus Doe', expertise: 'UI/UX Designer', rating: 4.8, reviews: 204, available: true, avatar: 'M', hourlyRate: 85 },
    { id: 4, name: 'Elena Rostova', expertise: 'Backend Developer', rating: 4.7, reviews: 56, available: true, avatar: 'E', hourlyRate: 105 },
    { id: 5, name: 'Jayden Smith', expertise: 'DevOps Engineer', rating: 4.9, reviews: 112, available: false, avatar: 'J', hourlyRate: 110 },
    { id: 6, name: 'Olivia Jones', expertise: 'Product Manager', rating: 4.8, reviews: 93, available: true, avatar: 'O', hourlyRate: 75 }
  ];

  specialists = [...this.allSpecialists];
  selectedSpecialist: any = null;
  roleFilter = 'All Roles';
  pricingFilter = 'Any Pricing';
  availableOnly = true;
  hireLoading = false;
  hireSuccess = false;

  constructor(private router: Router) {
    this.applyFilters();
  }

  applyFilters() {
    let results = [...this.allSpecialists];

    if (this.availableOnly) {
      results = results.filter(s => s.available);
    }
    if (this.roleFilter !== 'All Roles') {
      results = results.filter(s => s.expertise === this.roleFilter);
    }
    if (this.pricingFilter === '$50 - $100/hr') {
      results = results.filter(s => s.hourlyRate >= 50 && s.hourlyRate <= 100);
    } else if (this.pricingFilter === '$100+/hr') {
      results = results.filter(s => s.hourlyRate > 100);
    }
    this.specialists = results;
  }

  onFilterChange() {
    this.applyFilters();
  }

  openProfile(specialist: any) {
    this.selectedSpecialist = specialist;
    this.hireSuccess = false;
  }

  closeProfile() {
    this.selectedSpecialist = null;
    this.hireSuccess = false;
  }

  hireSpecialist() {
    this.hireLoading = true;
    setTimeout(() => {
      this.hireLoading = false;
      this.hireSuccess = true;
    }, 1200);
  }

  contactSpecialist() {
    this.router.navigate(['/chat']);
  }
}
