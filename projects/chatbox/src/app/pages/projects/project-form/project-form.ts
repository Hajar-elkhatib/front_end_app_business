import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { SpecialistService } from '../../../services/specialist.service';
import { Specialist } from '../../../models/specialist.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrls: ['./project-form.css']
})
export class ProjectForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private specialistService = inject(SpecialistService);

  projectForm!: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  specialists: Specialist[] = [];

  categories = ['AI Engineering', 'Frontend Architecture', 'Cloud DevOps', 'Backend Development', 'UI/UX Design'];
  statuses = ['planning', 'active', 'completed', 'on-hold'];

  ngOnInit() {
    this.initForm();
    this.loadSpecialists();
    this.checkMode();
  }

  initForm() {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      budget: ['', [Validators.required, Validators.min(100)]],
      deadline: ['', Validators.required],
      category: ['AI Engineering', Validators.required],
      status: ['planning', Validators.required],
      assignedSpecialistId: ['']
    });
  }

  loadSpecialists() {
    this.specialistService.getSpecialists().subscribe(specs => {
      this.specialists = specs;
    });
  }

  checkMode() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.projectId = id;
        this.loadProjectForEdit(id);
      }
    });
  }

  loadProjectForEdit(id: string) {
    this.isLoading = true;
    this.projectService.getProjectById(id).subscribe(project => {
      if (project) {
        this.projectForm.patchValue({
          title: project.title,
          description: project.description,
          budget: project.budget,
          deadline: project.deadline,
          category: project.category,
          status: project.status,
          assignedSpecialistId: project.assignedSpecialistId || ''
        });
      } else {
        this.router.navigate(['/projects']);
      }
      this.isLoading = false;
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.projectForm.value;

    if (this.isEditMode && this.projectId) {
      this.projectService.updateProject(this.projectId, formData).subscribe(() => {
        this.isSubmitting = false;
        this.router.navigate(['/projects', this.projectId]);
      });
    } else {
      this.projectService.createProject(formData).subscribe((newProj) => {
        this.isSubmitting = false;
        this.router.navigate(['/projects']);
      });
    }
  }

  // Helpers for validation styling
  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }
}
