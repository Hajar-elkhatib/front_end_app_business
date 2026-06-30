import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  specialists: Specialist[] = [];
  filteredSpecialists: Specialist[] = [];
  searchControl = new FormControl('');
  expertiseFilter = new FormControl('All');
  availabilityFilter = new FormControl('all');
  isLoading = true;
  loadError = false;

  expertiseOptions = ['All'];

  constructor(private specialistService: SpecialistService) {}

  ngOnInit() {
    this.loadSpecialists();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());

    this.expertiseFilter.valueChanges.subscribe(() => this.applyFilters());
    this.availabilityFilter.valueChanges.subscribe(() => this.applyFilters());
    this.route.queryParamMap.subscribe(params => {
      const query = params.get('search') || '';
      if (query !== this.searchControl.value) {
        this.searchControl.setValue(query, { emitEvent: false });
        this.applyFilters();
      }
    });
  }

  loadSpecialists() {
    this.isLoading = true;
    this.loadError = false;
    this.specialistService.getSpecialists().subscribe({
      next: (data) => {
        this.specialists = data;
        this.filteredSpecialists = data;
        this.expertiseOptions = [
          'All',
          ...new Set(data.map(specialist => specialist.expertiseDomain).filter(Boolean))
        ];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
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
    this.cdr.markForCheck();
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  openSpecialist(specialist: Specialist) {
    const id = specialist.userId || specialist.id || specialist.mongoId || specialist.specialistId;
    if (!id) return;
    this.router.navigate(['/dashboard/entrepreneur/specialists', id]);
  }
}
