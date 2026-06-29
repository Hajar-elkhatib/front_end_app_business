import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService, AdminUser } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div><p class="admin-kicker">Admin</p><h1>Users</h1><p class="admin-copy">Search, filter, and activate or deactivate platform accounts.</p></div>
        <button class="admin-refresh" type="button" (click)="loadUsers()">Refresh</button>
      </header>
      <div class="filters">
        <input class="input" placeholder="Search name or email" [(ngModel)]="search" (ngModelChange)="loadUsers()" />
        <select class="input" [(ngModel)]="role" (ngModelChange)="loadUsers()"><option value="">All roles</option><option>ENTREPRENEUR</option><option>SPECIALIST</option><option>ADMIN</option></select>
        <select class="input" [(ngModel)]="active" (ngModelChange)="loadUsers()"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select>
      </div>
      <p *ngIf="errorMessage" class="admin-error">{{errorMessage}}</p>
      <div *ngIf="isLoading" class="table-empty">Loading users...</div>
      <div *ngIf="!isLoading && !users.length" class="table-empty">No users match these filters.</div>
      <div *ngIf="!isLoading && users.length" class="table-scroll">
        <table class="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created At</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{user.fullName || 'Unnamed user'}}</td>
              <td>{{user.email}}</td>
              <td><span class="badge-pill badge-neutral">{{user.role}}</span></td>
              <td><span class="badge-pill" [class.badge-good]="user.active" [class.badge-bad]="!user.active">{{user.active ? 'Active' : 'Inactive'}}</span></td>
              <td>{{user.createdAt | date:'mediumDate'}}</td>
              <td class="actions">
                <button class="admin-danger" type="button" (click)="banUser(user)" [disabled]="user.banned">Ban</button>
                <button class="admin-action" type="button" (click)="unbanUser(user)" [disabled]="!user.banned">Unban</button>
                <button class="admin-danger" type="button" (click)="deleteUser(user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminUsers implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  users: AdminUser[] = [];
  search = '';
  role = '';
  active = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('search') || this.search;
      this.loadUsers();
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getUsers({ search: this.search, role: this.role, active: this.active }).subscribe({
      next: users => { this.users = users; this.isLoading = false; },
      error: () => { this.errorMessage = 'Users could not be loaded.'; this.isLoading = false; }
    });
  }

  banUser(user: AdminUser) {
    this.adminService.banUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'User could not be banned.'
    });
  }

  unbanUser(user: AdminUser) {
    this.adminService.unbanUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'User could not be unbanned.'
    });
  }

  deleteUser(user: AdminUser) {
    this.adminService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'User could not be deleted.'
    });
  }
}
