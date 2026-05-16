import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  projects = [
    { title: 'Nexus E-commerce', type: 'Web App', status: 'In Progress', statusClass: 'badge-progress', lastUpdated: '2 hrs ago' },
    { title: 'Smart CRM', type: 'SaaS Tool', status: 'Idea', statusClass: 'badge-idea', lastUpdated: '1 day ago' },
    { title: 'AI Marketing Assistant', type: 'Mobile App', status: 'Launched', statusClass: 'badge-launched', lastUpdated: '3 days ago' },
    { title: 'Crypto Tracker', type: 'Fintech', status: 'Improving', statusClass: 'badge-improving', lastUpdated: '1 week ago' },
  ];

  showInsight = true;
  showCreateModal = false;
  newProjectName = '';
  newProjectType = 'Web App';

  constructor(private router: Router) {}

  dismissInsight() {
    this.showInsight = false;
  }

  analyzeIssue() {
    alert('AI analysis started. You will receive a report within minutes.');
  }

  openCreateProject() {
    this.showCreateModal = true;
    this.newProjectName = '';
    this.newProjectType = 'Web App';
  }

  closeCreateProject() {
    this.showCreateModal = false;
  }

  createProject() {
    if (!this.newProjectName.trim()) return;
    this.projects.unshift({
      title: this.newProjectName,
      type: this.newProjectType,
      status: 'Idea',
      statusClass: 'badge-idea',
      lastUpdated: 'Just now'
    });
    this.showCreateModal = false;
  }

  goToDomains() {
    alert('Domains setup coming soon.');
  }

  goToInviteTeam() {
    alert('Team invitations coming soon.');
  }
}
