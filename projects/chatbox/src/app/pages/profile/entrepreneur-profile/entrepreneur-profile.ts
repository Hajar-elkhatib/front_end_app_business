import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entrepreneur-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './entrepreneur-profile.html',
  styleUrls: ['./entrepreneur-profile.css']
})
export class EntrepreneurProfile {
  isEditing = false;

  user = {
    fullName: 'John Smith',
    email: 'john.smith@technova.io',
    companyName: 'TechNova Inc.',
    companyWebsite: 'https://technova.io',
    industry: 'FinTech',
    businessType: 'SaaS Platform',
    bio: 'Founder & CEO of TechNova. Building next-generation financial applications powered by AI. Previously led product engineering at Stripe. Looking for elite specialists to join our mission of democratizing financial infrastructure.',
    location: 'Austin, TX',
    phone: '+1 (512) 555-0147',
    avatarInitial: 'J',
    joinedDate: 'March 2024'
  };

  // Temp working object for edits
  editUser = { ...this.user };

  stats = [
    { value: '12', label: 'Active Projects', icon: 'folder' },
    { value: '7', label: 'Hired Specialists', icon: 'users' },
    { value: '$45.2K', label: 'Total Invested', icon: 'dollar' },
    { value: '4.9', label: 'Employer Rating', icon: 'star' }
  ];

  activeProjects = [
    { name: 'Nexus E-commerce', status: 'In Progress', specialists: 3, budget: '$12,400', statusClass: 'status-progress' },
    { name: 'AI Analytics Dashboard', status: 'Planning', specialists: 1, budget: '$8,200', statusClass: 'status-planning' },
    { name: 'Mobile Payment App', status: 'Completed', specialists: 4, budget: '$24,600', statusClass: 'status-completed' },
  ];

  toggleEdit() {
    this.isEditing = true;
    this.editUser = { ...this.user };
  }

  saveEdit() {
    this.user = { 
      ...this.editUser,
      avatarInitial: this.editUser.fullName ? this.editUser.fullName[0].toUpperCase() : 'J'
    };
    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
