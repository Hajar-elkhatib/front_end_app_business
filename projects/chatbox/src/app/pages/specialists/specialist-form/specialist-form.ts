import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { SpecialistService } from '../../../services/specialist.service';

@Component({
  selector: 'app-specialist-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './specialist-form.html'
})
export class SpecialistForm implements OnInit {
  specForm: FormGroup;
  isEditMode = false;
  specId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private specialistService: SpecialistService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.specForm = this.fb.group({
      fullName: ['', Validators.required],
      expertiseDomain: ['', Validators.required],
      hourlyRate: [0, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      bio: ['', Validators.required],
      yearsExperience: [0, [Validators.required, Validators.min(0)]],
      skills: [''], // Simple text input for comma separated skills
      languages: ['']
    });
  }

  ngOnInit() {
    this.specId = this.route.snapshot.paramMap.get('id');
    if (this.specId) {
      this.isEditMode = true;
      this.specialistService.getSpecialistById(this.specId).subscribe(spec => {
        if (spec) {
          this.specForm.patchValue({
            ...spec,
            skills: spec.skills.join(', '),
            languages: spec.languages.join(', ')
          });
          this.cdr.markForCheck();
        }
      });
    }
  }

  onSubmit() {
    if (this.specForm.invalid) return;
    this.isLoading = true;
    
    const formValue = this.specForm.value;
    const specialistData = {
      ...formValue,
      skills: formValue.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      languages: formValue.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
      averageRating: this.isEditMode ? undefined : 0, // mock rating for new
      avatarUrl: formValue.fullName.charAt(0).toUpperCase()
    };

    if (this.isEditMode && this.specId) {
      this.specialistService.updateSpecialist(this.specId, specialistData).subscribe(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/specialists', this.specId]);
      });
    } else {
      this.specialistService.createSpecialist(specialistData).subscribe(newSpec => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/specialists', newSpec.id]);
      });
    }
  }
}
