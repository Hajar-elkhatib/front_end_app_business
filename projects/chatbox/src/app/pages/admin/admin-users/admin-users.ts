import { CommonModule, LowerCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService, AdminUser } from '../../../services/admin.service';

interface Toast { id: number; type: 'success' | 'error'; message: string; }
interface ConfirmState {
  open: boolean; title: string; body: string;
  confirmLabel: string; danger: boolean;
  onConfirm: () => void;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LowerCasePipe],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div>
          <p class="admin-kicker">Admin</p>
          <h1>Users</h1>
          <p class="admin-copy">Search, filter, and manage platform accounts (ban, unban, delete).</p>
        </div>
        <button class="admin-refresh" type="button" (click)="loadUsers()" [disabled]="isLoading || isProcessing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </header>

      <div class="filters">
        <input class="input" type="search" placeholder="Search name or email" [(ngModel)]="search" (ngModelChange)="loadUsers()" aria-label="Search users" />
        <select class="input" [(ngModel)]="role" (ngModelChange)="loadUsers()" aria-label="Filter by role">
          <option value="">All roles</option>
          <option value="ENTREPRENEUR">Entrepreneur</option>
          <option value="SPECIALIST">Specialist</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select class="input" [(ngModel)]="active" (ngModelChange)="loadUsers()" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div *ngIf="errorMessage" class="admin-error">
        <span>{{errorMessage}}</span>
        <button type="button" class="error-retry" (click)="loadUsers()">Retry</button>
      </div>

      <div *ngIf="isLoading" class="skeleton-grid skeleton-grid-sm">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
      </div>

      <div *ngIf="!isLoading && !users.length" class="table-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.75rem;display:block;opacity:.35"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        No users match these filters.
      </div>

      <div *ngIf="!isLoading && users.length" class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" [class.muted]="user.banned">
              <td>
                <div style="display:flex;align-items:center;gap:.6rem">
                  <span class="user-avatar" style="width:28px;height:28px;font-size:.65rem">{{userInitials(user.fullName)}}</span>
                  <span style="font-weight:600">{{user.fullName || 'Unnamed user'}}</span>
                </div>
              </td>
              <td>{{user.email}}</td>
              <td><span class="badge-pill badge-neutral">{{user.role | lowercase}}</span></td>
              <td>
                <span class="badge-pill" [class.badge-good]="user.active && !user.banned" [class.badge-bad]="!user.active || user.banned">
                  {{user.banned ? 'Banned' : (user.active ? 'Active' : 'Inactive')}}
                </span>
              </td>
              <td>{{user.createdAt | date:'mediumDate'}}</td>
              <td class="actions">
                <button *ngIf="!user.banned" class="admin-danger" type="button" (click)="requestBan(user)" [disabled]="isProcessing || user.role === 'ADMIN'">Ban</button>
                <button *ngIf="user.banned" class="admin-action" type="button" (click)="unbanUser(user)" [disabled]="isProcessing">Unban</button>
                <button class="admin-danger" type="button" (click)="requestDelete(user)" [disabled]="isProcessing || user.role === 'ADMIN'">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- CONFIRMATION DIALOG -->
    <div *ngIf="confirm.open" class="modal-backdrop" (click)="cancelConfirm()">
      <div class="modal-panel modal-panel-sm" (click)="$event.stopPropagation()" role="alertdialog" aria-modal="true">
        <div class="modal-header">
          <h2 class="modal-title">{{confirm.title}}</h2>
        </div>
        <div class="modal-body"><p>{{confirm.body}}</p></div>
        <div class="modal-footer">
          <button class="btn-ghost" type="button" (click)="cancelConfirm()">Cancel</button>
          <button type="button" [class.admin-danger]="confirm.danger" [class.admin-action]="!confirm.danger"
            (click)="confirm.onConfirm()">{{confirm.confirmLabel}}</button>
        </div>
      </div>
    </div>

    <!-- TOASTS -->
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <div *ngFor="let toast of toasts" class="toast"
        [class.toast-success]="toast.type==='success'" [class.toast-error]="toast.type==='error'" role="alert">
        <span class="toast-icon">{{toast.type==='success' ? '✓' : '✕'}}</span>
        <span class="toast-msg">{{toast.message}}</span>
        <button class="toast-close" type="button" (click)="dismissToast(toast.id)" aria-label="Dismiss">×</button>
      </div>
    </div>
  `,
  styleUrls: ['../admin-dashboard/admin-dashboard.css']
})
export class AdminUsers implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  private toastCounter = 0;
  private toastTimers: ReturnType<typeof setTimeout>[] = [];

  users: AdminUser[] = [];
  search = '';
  role = '';
  active = '';
  isLoading = true;
  isProcessing = false;
  errorMessage = '';

  toasts: Toast[] = [];
  confirm: ConfirmState = { open: false, title: '', body: '', confirmLabel: 'Confirm', danger: false, onConfirm: () => {} };

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('search') || this.search;
      this.loadUsers();
    });
  }

  ngOnDestroy() {
    this.toastTimers.forEach(t => clearTimeout(t));
  }

  userInitials(fullName: string | undefined): string {
    if (!fullName) return '?';
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getUsers({ search: this.search, role: this.role, active: this.active }).subscribe({
      next: users => { this.users = users; this.isLoading = false; },
      error: () => { this.errorMessage = 'Users could not be loaded.'; this.isLoading = false; }
    });
  }

  requestBan(user: AdminUser) {
    this.confirm = {
      open: true, title: 'Ban User',
      body: `Are you sure you want to ban ${user.fullName}? They will no longer be able to access the platform.`,
      confirmLabel: 'Ban User', danger: true,
      onConfirm: () => this.executeBan(user)
    };
  }

  private executeBan(user: AdminUser) {
    this.confirm.open = false;
    this.isProcessing = true;
    this.adminService.banUser(user.id).subscribe({
      next: () => {
        this.showToast('success', `${user.fullName} has been banned.`);
        this.loadUsers();
        this.isProcessing = false;
      },
      error: () => {
        this.showToast('error', 'Failed to ban user.');
        this.isProcessing = false;
      }
    });
  }

  unbanUser(user: AdminUser) {
    this.isProcessing = true;
    this.adminService.unbanUser(user.id).subscribe({
      next: () => {
        this.showToast('success', `${user.fullName} has been unbanned.`);
        this.loadUsers();
        this.isProcessing = false;
      },
      error: () => {
        this.showToast('error', 'Failed to unban user.');
        this.isProcessing = false;
      }
    });
  }

  requestDelete(user: AdminUser) {
    this.confirm = {
      open: true, title: 'Delete User',
      body: `Are you sure you want to permanently delete ${user.fullName}? This action cannot be undone.`,
      confirmLabel: 'Delete User', danger: true,
      onConfirm: () => this.executeDelete(user)
    };
  }

  private executeDelete(user: AdminUser) {
    this.confirm.open = false;
    this.isProcessing = true;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.showToast('success', 'User deleted successfully.');
        this.loadUsers();
        this.isProcessing = false;
      },
      error: () => {
        this.showToast('error', 'Failed to delete user.');
        this.isProcessing = false;
      }
    });
  }

  cancelConfirm() { this.confirm.open = false; }

  showToast(type: 'success' | 'error', message: string) {
    const id = ++this.toastCounter;
    this.toasts = [...this.toasts, { id, type, message }];
    const timer = setTimeout(() => this.dismissToast(id), 4000);
    this.toastTimers.push(timer);
  }

  dismissToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
