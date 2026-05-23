import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SpecialistService } from '../../../services/specialist.service';
import { Specialist, SpecialistReview } from '../../../models/specialist.model';

@Component({
  selector: 'app-specialist-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './specialist-details.html',
  styleUrls: ['./specialist-details.css']
})
export class SpecialistDetails implements OnInit {
  specialist: Specialist | undefined;
  reviews: SpecialistReview[] = [];
  isLoading = true;
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialistService: SpecialistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.specialistService.getSpecialistById(id).subscribe(data => {
        this.specialist = data;
        this.isLoading = false;
        this.cdr.markForCheck();
        if (!data) {
          this.router.navigate(['/specialists']);
        }
      });
      this.specialistService.getReviews(id).subscribe(r => {
        this.reviews = r;
        this.cdr.markForCheck();
      });
    }
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  deleteSpecialist() {
    if (this.specialist) {
      this.specialistService.deleteSpecialist(this.specialist.id).subscribe(() => {
        this.cdr.markForCheck();
        this.router.navigate(['/specialists']);
      });
    }
  }
}
