import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminSpecialist } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-specialists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div><p class="admin-kicker">Admin</p><h1>Specialists</h1><p class="admin-copy">Approve, reject, suspend, or reactivate registered specialists from MongoDB.</p></div>
        <button class="admin-refresh" type="button" (click)="loadSpecialists()">Refresh</button>
      </header>
      <div class="filters">
        <select class="input" [(ngModel)]="view" (ngModelChange)="loadSpecialists()"><option value="all">All Specialists</option><option value="pending">Pending Specialists</option><option value="verified">Verified Specialists</option></select>
        <input class="input" placeholder="Expertise or skill" [(ngModel)]="expertise" (ngModelChange)="loadSpecialists()" />
        <select class="input" [(ngModel)]="approvalStatus" (ngModelChange)="loadSpecialists()"><option value="">All approvals</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>SUSPENDED</option></select>
        <select class="input" [(ngModel)]="active" (ngModelChange)="loadSpecialists()"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select>
      </div>
      <p *ngIf="errorMessage" class="admin-error">{{errorMessage}}</p>
      <div *ngIf="isLoading" class="table-empty">Loading specialists...</div>
      <div *ngIf="!isLoading && !specialists.length" class="table-empty">No real specialists match these filters.</div>
      <div *ngIf="!isLoading && specialists.length" class="table-scroll">
        <table class="admin-table">
          <thead><tr><th>Specialist Name</th><th>Expertise</th><th>Experience</th><th>Availability</th><th>Approval Status</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let specialist of specialists">
              <td>{{specialist.fullName}}</td>
              <td>{{specialist.expertiseDomain || specialist.skills?.join(', ') || '-'}}</td>
              <td>{{specialist.yearsOfExperience || 0}} years</td>
              <td>{{specialist.availability || '-'}}</td>
              <td><span class="badge-pill" [class.badge-good]="specialist.approvalStatus === 'APPROVED'" [class.badge-warn]="specialist.approvalStatus === 'PENDING'" [class.badge-bad]="specialist.approvalStatus === 'REJECTED' || specialist.approvalStatus === 'SUSPENDED'">{{specialist.approvalStatus}}</span></td>
              <td><span class="badge-pill" [class.badge-good]="specialist.active" [class.badge-bad]="!specialist.active">{{specialist.active ? 'Active' : 'Inactive'}}</span></td>
              <td class="actions">
                <button class="admin-action" type="button" (click)="confirm(specialist)">Confirm</button>
                <button class="admin-danger" type="button" (click)="reject(specialist)">Reject</button>
                <button class="admin-danger" type="button" (click)="setActive(specialist, false)">Suspend</button>
                <button class="admin-action" type="button" (click)="setActive(specialist, true)">Reactivate</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminSpecialists implements OnInit {
  private adminService = inject(AdminService);
  specialists: AdminSpecialist[] = [];
  view: 'all' | 'pending' | 'verified' = 'pending';
  approvalStatus = '';
  active = '';
  expertise = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit() { this.loadSpecialists(); }

  loadSpecialists() {
    this.isLoading = true;
    const source$ = this.view === 'pending'
      ? this.adminService.getPendingSpecialists()
      : this.view === 'verified'
        ? this.adminService.getVerifiedSpecialists()
        : this.adminService.getSpecialists({ approvalStatus: this.approvalStatus, active: this.active, expertise: this.expertise });
    source$.subscribe({
      next: specialists => { this.specialists = specialists; this.isLoading = false; },
      error: () => { this.errorMessage = 'Specialists could not be loaded.'; this.isLoading = false; }
    });
  }

  confirm(specialist: AdminSpecialist) {
    this.adminService.confirmSpecialist(specialist.id).subscribe({
      next: () => this.loadSpecialists(),
      error: () => this.errorMessage = 'Specialist confirmation could not be updated.'
    });
  }

  reject(specialist: AdminSpecialist) {
    this.adminService.rejectSpecialist(specialist.id).subscribe({
      next: () => this.loadSpecialists(),
      error: () => this.errorMessage = 'Specialist rejection could not be updated.'
    });
  }

  setActive(specialist: AdminSpecialist, active: boolean) {
    this.adminService.updateSpecialistStatus(specialist.id, active).subscribe({
      next: updated => Object.assign(specialist, updated),
      error: () => this.errorMessage = 'Specialist status could not be updated.'
    });
  }
}
