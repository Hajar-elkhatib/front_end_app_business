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

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'planning': return 'status-planning';
      case 'completed': return 'status-completed';
      case 'on-hold': return 'status-hold';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'In Progress';
      case 'planning': return 'Planning';
      case 'completed': return 'Completed';
      case 'on-hold': return 'On Hold';
      case 'pending': return 'Pending';
      default: return status;
    }
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.delete.emit(this.project.id);
  }
}
