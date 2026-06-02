import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminSpecialist, AdminSupportRequest } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-support-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div><p class="admin-kicker">Admin</p><h1>Support Requests</h1><p class="admin-copy">Match submitted entrepreneur requests with approved active specialists.</p></div>
        <button class="admin-refresh" type="button" (click)="loadRequests()">Refresh</button>
      </header>
      <div class="filters">
        <select class="input" [(ngModel)]="status" (ngModelChange)="loadRequests()"><option value="">All request statuses</option><option>SUBMITTED</option><option>MATCHING</option><option>MATCHED</option><option>ACCEPTED</option><option>REJECTED</option><option>COMPLETED</option></select>
      </div>
      <p *ngIf="errorMessage" class="admin-error">{{errorMessage}}</p>
      <div *ngIf="isLoading" class="table-empty">Loading support requests...</div>
      <div *ngIf="!isLoading && !requests.length" class="table-empty">No support requests have been submitted.</div>
      <div *ngIf="!isLoading && requests.length" class="table-scroll">
        <table class="admin-table">
          <thead><tr><th>Project</th><th>Entrepreneur</th><th>Detected Needs</th><th>Request Status</th><th>Submitted Date</th><th>Matched Specialist</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let request of requests">
              <td>{{request.project || request.projectId}}</td>
              <td>{{request.entrepreneur?.fullName || request.entrepreneur?.email || '-'}}</td>
              <td><span class="muted">{{(request.generatedNeeds || []).slice(0, 3).join(', ') || '-'}}</span></td>
              <td><span class="badge-pill badge-neutral">{{request.status}}</span></td>
              <td>{{request.createdAt | date:'mediumDate'}}</td>
              <td>{{request.matchedSpecialist?.fullName || '-'}}</td>
              <td class="actions">
                <select class="input" [(ngModel)]="selectedSpecialists[request.id]">
                  <option value="">Assign specialist</option>
                  <option *ngFor="let specialist of approvedSpecialists" [value]="specialist.id">{{specialist.fullName}} - {{specialist.expertiseDomain || specialist.skills?.join(', ')}}</option>
                </select>
                <button class="admin-action" type="button" (click)="assign(request)">Assign</button>
                <button class="admin-danger" type="button" (click)="setStatus(request, 'REJECTED')">Reject</button>
                <button class="admin-action" type="button" (click)="setStatus(request, 'COMPLETED')">Complete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminSupportRequests implements OnInit {
  private adminService = inject(AdminService);
  requests: AdminSupportRequest[] = [];
  approvedSpecialists: AdminSpecialist[] = [];
  selectedSpecialists: Record<string, string> = {};
  status = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.loadRequests();
    this.adminService.getSpecialists({ approvalStatus: 'APPROVED', active: 'true' }).subscribe(specialists => this.approvedSpecialists = specialists);
  }

  loadRequests() {
    this.isLoading = true;
    this.adminService.getSupportRequests(this.status).subscribe({
      next: requests => { this.requests = requests; this.isLoading = false; },
      error: () => { this.errorMessage = 'Support requests could not be loaded.'; this.isLoading = false; }
    });
  }

  assign(request: AdminSupportRequest) {
    const specialistId = this.selectedSpecialists[request.id];
    if (!specialistId) return;
    this.adminService.assignSpecialist(request.id, specialistId).subscribe({
      next: updated => Object.assign(request, updated),
      error: () => this.errorMessage = 'Specialist assignment could not be saved.'
    });
  }

  setStatus(request: AdminSupportRequest, status: string) {
    this.adminService.updateSupportRequestStatus(request.id, status).subscribe({
      next: updated => Object.assign(request, updated),
      error: () => this.errorMessage = 'Request status could not be updated.'
    });
  }
}
