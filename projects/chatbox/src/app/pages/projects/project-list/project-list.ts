import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
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

  projects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;

  // Stats
  totalProjects = 0;
  activeProjects = 0;
  totalBudget = 0;
  completedProjects = 0;
  pendingProjects = 0;

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

  categories = ['All', 'AI Engineering', 'Frontend Architecture', 'Cloud DevOps', 'Backend Development', 'UI/UX Design'];

  ngOnInit() {
    this.loadProjects();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFiltersAndSort());

    this.categoryFilter.valueChanges.subscribe(() => this.applyFiltersAndSort());
    this.statusFilter.valueChanges.subscribe(() => this.applyFiltersAndSort());
    this.sortControl.valueChanges.subscribe(() => this.applyFiltersAndSort());
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
      this.filteredProjects = data;
      this.calculateStats();
      this.applyFiltersAndSort();
      this.isLoading = false;
    });
  }

  calculateStats() {
    this.totalProjects = this.projects.length;
    this.activeProjects = this.projects.filter(p => p.status === 'active').length;
    this.completedProjects = this.projects.filter(p => p.status === 'completed').length;
    this.pendingProjects = this.projects.filter(p => p.status === 'pending').length;
    this.totalBudget = this.projects.reduce((sum, p) => sum + p.budget, 0);
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
        (p.assignedSpecialist && p.assignedSpecialist.fullName.toLowerCase().includes(query))
      );
    }

    if (category !== 'All') {
      results = results.filter(p => p.category === category);
    }

    if (status !== 'all') {
      results = results.filter(p => p.status === status);
    }

    // Sorting
    results.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'budget-high') {
        return b.budget - a.budget;
      } else if (sortBy === 'budget-low') {
        return a.budget - b.budget;
      } else if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

    this.filteredProjects = results;
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
    });
  }
}
