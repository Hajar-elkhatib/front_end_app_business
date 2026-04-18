import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
}
