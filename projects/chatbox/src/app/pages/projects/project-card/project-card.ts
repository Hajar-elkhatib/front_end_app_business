import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.css']
})
export class ProjectCard {
  @Input({ required: true }) project!: Project;
  @Output() delete = new EventEmitter<string>();

  getStatusClass(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 'status-active';
      case 'DRAFT': return 'status-planning';
      case 'COMPLETED': return 'status-completed';
      case 'ON_HOLD': return 'status-hold';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }

  getStatusLabel(status?: string): string {
    return (status || 'DRAFT').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.delete.emit(this.project.id);
  }
}
