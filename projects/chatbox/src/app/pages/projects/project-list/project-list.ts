import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { AssignmentService } from '../../../services/assignment.service';
import { AuthService } from '../../../services/auth.service';
import { Project } from '../../../models/project.model';
import { ProjectCard } from '../project-card/project-card';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ProjectCard],
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.css']
})
export class ProjectList implements OnInit {
  private projectService = inject(ProjectService);
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  projects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;

  // Stats
  totalProjects = 0;
  submittedProjects = 0;
  draftProjects = 0;
  emptyReason = 'Create your first project to start validation.';

  // Delete modal state
  showDeleteModal = false;
  projectToDeleteId: string | null = null;
  projectToDeleteTitle = '';
  isDeleting = false;

  // Filter & Sort controls
  searchControl = new FormControl('');
  categoryFilter = new FormControl('All');
  statusFilter = new FormControl('all');
  sortControl = new FormControl('newest');

  categories = ['All'];

  ngOnInit() {
    this.loadProjects();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFiltersAndSort());

    this.categoryFilter.valueChanges.subscribe(() => this.applyFiltersAndSort());
    this.statusFilter.valueChanges.subscribe(() => this.applyFiltersAndSort());
    this.sortControl.valueChanges.subscribe(() => this.applyFiltersAndSort());
    this.route.queryParamMap.subscribe(params => {
      const query = params.get('search') || '';
      if (query !== this.searchControl.value) {
        this.searchControl.setValue(query, { emitEvent: false });
        this.applyFiltersAndSort();
      }
    });
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.refreshProjects().subscribe({
      next: data => {
        this.projects = data;
        this.filteredProjects = data;
        this.categories = ['All', ...new Set(data.map(project => project.sector).filter(Boolean))];
        this.refreshAssignmentState();
        this.calculateStats();
        this.applyFiltersAndSort();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.projects = [];
        this.filteredProjects = [];
        this.categories = ['All'];
        this.calculateStats();
        this.applyFiltersAndSort();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private refreshAssignmentState() {
    const entrepreneurId = this.authService.currentUser?.id;
    if (!entrepreneurId) {
      return;
    }

    this.assignmentService.getEntrepreneurAssignments(entrepreneurId).subscribe(assignments => {
      const pendingProjectIds = new Set(
        assignments
          .filter(assignment => assignment.status === 'PENDING' || assignment.status === 'ACCEPTED')
          .map(assignment => assignment.projectId)
      );

      this.projects = this.projects.map(project => ({
        ...project,
        assignmentPending: pendingProjectIds.has(project.id),
        assignmentStatus: pendingProjectIds.has(project.id) ? 'PENDING' : project.assignmentStatus
      }));
      this.filteredProjects = this.projects;
      this.cdr.markForCheck();
    });
  }

  calculateStats() {
    this.totalProjects = this.projects.length;
    this.submittedProjects = this.projects.filter(p => p.projectStatus === 'SUBMITTED').length;
    this.draftProjects = this.projects.filter(p => p.projectStatus !== 'SUBMITTED').length;
  }

  applyFiltersAndSort() {
    let results = [...this.projects];
    const query = (this.searchControl.value || '').toLowerCase();
    const category = this.categoryFilter.value || 'All';
    const status = this.statusFilter.value || 'all';
    const sortBy = this.sortControl.value || 'newest';

    // Filters
    if (query) {
      results = results.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.sector || '').toLowerCase().includes(query) ||
        (p.keyword || '').toLowerCase().includes(query) ||
        (p.country || '').toLowerCase().includes(query)
      );
    }

    if (category !== 'All') {
      results = results.filter(p => p.sector === category);
    }

    if (status !== 'all') {
      results = results.filter(p => p.projectStatus === status);
    }

    // Sorting
    results.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.createdAt ?? new Date().toISOString()).getTime();
        const dateB = new Date(b.createdAt ?? new Date().toISOString()).getTime();
        return dateB - dateA;
      } else if (sortBy === 'oldest') {
        const dateA = new Date(a.createdAt ?? new Date().toISOString()).getTime();
        const dateB = new Date(b.createdAt ?? new Date().toISOString()).getTime();
        return dateA - dateB;
      } else if (sortBy === 'market-size-high') {
        return (b.marketSizeBillion ?? 0) - (a.marketSizeBillion ?? 0);
      } else if (sortBy === 'market-size-low') {
        return (a.marketSizeBillion ?? 0) - (b.marketSizeBillion ?? 0);
      }
      return 0;
    });

    this.filteredProjects = results;
    this.emptyReason = query ? 'No projects match this search.' : 'Create your first project to start validation.';
    this.cdr.markForCheck();
  }

  // Delete modal flows
  openDeleteModal(id: string) {
    const proj = this.projects.find(p => p.id === id);
    if (proj) {
      this.projectToDeleteId = id;
      this.projectToDeleteTitle = proj.title;
      this.showDeleteModal = true;
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.projectToDeleteId = null;
    this.projectToDeleteTitle = '';
  }

  confirmDelete() {
    if (!this.projectToDeleteId) return;
    this.isDeleting = true;
    this.projectService.deleteProject(this.projectToDeleteId).subscribe(() => {
      this.isDeleting = false;
      this.closeDeleteModal();
      this.loadProjects(); // Reload and recalculate stats
      this.cdr.markForCheck();
    });
  }
}
