import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-specialist-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialist-dashboard.html',
  styleUrls: ['./specialist-dashboard.css']
})
export class SpecialistDashboard {
  activeMissions = [
    { project: 'Nexus E-commerce', client: 'John Smith', role: 'Frontend Dev', deadline: 'May 30', status: 'Active', statusClass: 'badge-progress' },
    { project: 'AI Marketing Tool', client: 'Sarah Lee', role: 'ML Engineer', deadline: 'Jun 15', status: 'Review', statusClass: 'badge-improving' },
  ];
}
