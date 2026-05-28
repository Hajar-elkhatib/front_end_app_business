import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SpecialistService } from '../../../services/specialist.service';
import { Specialist, SpecialistReview } from '../../../models/specialist.model';
import { EvaluationService } from '../../../services/evaluation.service';
import { switchMap, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-specialist-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './specialist-details.html',
  styleUrls: ['./specialist-details.css']
})
export class SpecialistDetails implements OnInit {
  specialist: Specialist | undefined;
  reviews: SpecialistReview[] = [];
  isLoading = true;
  loadError = '';
  isSubmittingEvaluation = false;
  evaluationSuccess = '';
  evaluationError = '';
  showDeleteModal = false;

  evaluationForm = this.fb.group({
    projectId: ['', Validators.required],
    score: [5, [Validators.required, Validators.min(0), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(3)]],
    status: ['COMPLETED', Validators.required]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialistService: SpecialistService,
    private evaluationService: EvaluationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.router.navigate(['/specialists']);
      return;
    }

    this.loadSpecialistProfile(userId);
    this.loadReviews(userId);
  }

  loadSpecialistProfile(userId: string) {
    this.isLoading = true;
    this.loadError = '';

    this.specialistService.getProfile(userId).pipe(
      timeout(10000)
    ).subscribe({
      next: specialist => {
        this.specialist = specialist;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Specialist profile could not be loaded. Check that the route uses the backend userId.';
        this.cdr.markForCheck();
      }
    });
  }

  loadReviews(userId: string) {
    this.specialistService.getReviews(userId).subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviews = [];
        this.cdr.markForCheck();
      }
    });
  }

  submitEvaluation() {
    if (!this.specialist) return;

    this.evaluationSuccess = '';
    this.evaluationError = '';

    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      this.evaluationError = 'Please complete the evaluation form.';
      this.cdr.markForCheck();
      return;
    }

    const value = this.evaluationForm.getRawValue();
    const specialistId = this.specialist.id;

    this.isSubmittingEvaluation = true;
    this.evaluationService.submitProjectEvaluation(
      String(value.projectId),
      specialistId,
      {
        score: Number(value.score || 0),
        comment: value.comment || '',
        status: value.status || 'COMPLETED'
      }
    ).pipe(
      switchMap(() => this.specialistService.getProfile(specialistId))
    ).subscribe({
      next: updatedSpecialist => {
        this.specialist = updatedSpecialist;
        this.isSubmittingEvaluation = false;
        this.evaluationSuccess = 'Evaluation submitted successfully.';
        this.evaluationForm.patchValue({ score: 5, comment: '' });
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmittingEvaluation = false;
        this.evaluationError = 'Evaluation could not be submitted.';
        this.cdr.markForCheck();
      }
    });
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
