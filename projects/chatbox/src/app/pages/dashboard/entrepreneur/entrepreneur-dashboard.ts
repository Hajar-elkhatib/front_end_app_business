import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entrepreneur-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entrepreneur-dashboard.html',
  styleUrls: ['./entrepreneur-dashboard.css']
})
export class EntrepreneurDashboard {
  projects = [
    { title: 'Nexus E-commerce', type: 'Web App', status: 'In Progress', statusClass: 'badge-progress', lastUpdated: '2 hrs ago' },
    { title: 'Smart CRM', type: 'SaaS Tool', status: 'Idea', statusClass: 'badge-idea', lastUpdated: '1 day ago' },
    { title: 'AI Marketing Assistant', type: 'Mobile App', status: 'Launched', statusClass: 'badge-launched', lastUpdated: '3 days ago' },
    { title: 'Crypto Tracker', type: 'Fintech', status: 'Improving', statusClass: 'badge-improving', lastUpdated: '1 week ago' },
  ];

  stats = [
    { label: 'Active Projects', value: '4', icon: 'folder' },
    { label: 'Hired Specialists', value: '7', icon: 'users' },
    { label: 'Total Spent', value: '$12,450', icon: 'dollar' },
  ];
}
