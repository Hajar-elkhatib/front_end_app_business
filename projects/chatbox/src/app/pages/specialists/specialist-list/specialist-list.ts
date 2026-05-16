import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SpecialistService } from '../../../services/specialist.service';
import { Specialist } from '../../../models/specialist.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-specialist-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './specialist-list.html',
  styleUrls: ['./specialist-list.css']
})
export class SpecialistList implements OnInit {
  specialists: Specialist[] = [];
  filteredSpecialists: Specialist[] = [];
  searchControl = new FormControl('');
  expertiseFilter = new FormControl('All');
  availabilityFilter = new FormControl('all');
  isLoading = true;

  expertiseOptions = ['All', 'AI Engineering', 'Frontend Architecture', 'Cloud DevOps', 'Backend Development', 'UI/UX Design'];

  constructor(private specialistService: SpecialistService) {}

  ngOnInit() {
    this.loadSpecialists();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());

    this.expertiseFilter.valueChanges.subscribe(() => this.applyFilters());
    this.availabilityFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  loadSpecialists() {
    this.isLoading = true;
    this.specialistService.getSpecialists().subscribe(data => {
      this.specialists = data;
      this.filteredSpecialists = data;
      this.isLoading = false;
    });
  }

  applyFilters() {
    let results = this.specialists;
    const query = (this.searchControl.value || '').toLowerCase();
    const expertise = this.expertiseFilter.value || 'All';
    const availability = this.availabilityFilter.value || 'all';

    if (query) {
      results = results.filter(s =>
        s.fullName.toLowerCase().includes(query) ||
        s.expertiseDomain.toLowerCase().includes(query) ||
        s.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }
    if (expertise !== 'All') {
      results = results.filter(s => s.expertiseDomain === expertise);
    }
    if (availability === 'available') {
      results = results.filter(s => s.available);
    } else if (availability === 'unavailable') {
      results = results.filter(s => !s.available);
    }
    this.filteredSpecialists = results;
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
