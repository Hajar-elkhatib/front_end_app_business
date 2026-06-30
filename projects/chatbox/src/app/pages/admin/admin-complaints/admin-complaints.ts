import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminComplaint, AdminService } from '../../../services/admin.service';

interface Toast { id: number; type: 'success' | 'error'; message: string; }
interface ConfirmState {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger: boolean;
  onConfirm: () => void;
}

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div>
          <p class="admin-kicker">Admin</p>
          <h1>Complaints</h1>
          <p class="admin-copy">Review platform complaints, update status, and respond directly from the backend.</p>
        </div>
        <button class="admin-refresh" type="button" (click)="loadComplaints()" [disabled]="isLoading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </header>

      <div class="complaint-filters">
        <input class="input" type="search" [(ngModel)]="searchQuery" (ngModelChange)="applySearch()" placeholder="Search subject or user ID" aria-label="Search complaints" />
        <select class="input" [(ngModel)]="statusFilter" (ngModelChange)="loadComplaints()" aria-label="Filter complaints by status">
          <option value="">All</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <div *ngIf="errorMessage" class="admin-error">
        <span>{{errorMessage}}</span>
        <button type="button" class="error-retry" (click)="loadComplaints()">Retry</button>
      </div>

      <div *ngIf="isLoading" class="skeleton-grid skeleton-grid-sm">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
      </div>

      <div *ngIf="!isLoading && !filteredComplaints.length" class="table-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.75rem;display:block;opacity:.35"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        No complaints found.
      </div>

      <div *ngIf="!isLoading && filteredComplaints.length" class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
              <th>User ID</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let complaint of filteredComplaints">
              <td class="complaint-subject">{{complaint.subject}}</td>
              <td>{{complaint.category}}</td>
              <td>
                <span class="badge-pill"
                  [class.badge-neutral]="complaint.status==='OPEN'"
                  [class.badge-warn]="complaint.status==='IN_PROGRESS'"
                  [class.badge-good]="complaint.status==='RESOLVED'"
                  [class.badge-bad]="complaint.status==='CLOSED'">{{complaint.status}}</span>
              </td>
              <td>{{complaint.userId}}</td>
              <td>{{complaint.createdAt | date:'mediumDate'}}</td>
              <td class="actions">
                <button class="admin-action" type="button" (click)="openComplaint(complaint)">Details</button>
                <button class="admin-danger" type="button" (click)="requestDelete(complaint)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div *ngIf="selectedComplaint" class="modal-backdrop" (click)="closeComplaint()">
      <div class="modal-panel" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="complaint-title">
        <div class="modal-header">
          <h2 id="complaint-title" class="modal-title">Complaint Details</h2>
          <button class="modal-close" type="button" (click)="closeComplaint()" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-field"><label class="modal-lbl">Subject</label><p>{{selectedComplaint.subject}}</p></div>
          <div class="modal-field"><label class="modal-lbl">Body</label><p class="modal-desc">{{selectedComplaint.body}}</p></div>
          <div class="modal-field"><label class="modal-lbl">Description</label><p class="modal-desc">{{selectedComplaint.description}}</p></div>
          <div class="modal-row">
            <div class="modal-field"><label class="modal-lbl">Category</label><p>{{selectedComplaint.category}}</p></div>
            <div class="modal-field"><label class="modal-lbl">Chat Type</label><p>{{selectedComplaint.chatType}}</p></div>
            <div class="modal-field"><label class="modal-lbl">User ID</label><p>{{selectedComplaint.userId}}</p></div>
          </div>
          <div class="modal-row">
            <div class="modal-field"><label class="modal-lbl">Created Date</label><p>{{selectedComplaint.createdAt | date:'mediumDate'}}</p></div>
            <div class="modal-field"><label class="modal-lbl">Resolved Date</label><p>{{selectedComplaint.resolvedAt ? (selectedComplaint.resolvedAt | date:'mediumDate') : '—'}}</p></div>
          </div>
          <div class="modal-field">
            <label class="modal-lbl" [for]="'admin-response-' + selectedComplaint.id">Admin Response</label>
            <textarea class="input modal-textarea"
              [id]="'admin-response-' + selectedComplaint.id"
              rows="4"
              [(ngModel)]="selectedComplaint.adminResponse"
              placeholder="Write admin response..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <select class="input" [(ngModel)]="selectedComplaint.status" style="max-width: 180px">
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button class="admin-action" type="button" (click)="saveComplaint()" [disabled]="isSaving">Save</button>
          <button class="admin-danger" type="button" (click)="requestDelete(selectedComplaint)" [disabled]="isSaving">Delete</button>
          <button class="btn-ghost" type="button" (click)="closeComplaint()">Close</button>
        </div>
      </div>
    </div>

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
export class AdminComplaints implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private toastCounter = 0;
  private toastTimers: ReturnType<typeof setTimeout>[] = [];

  complaints: AdminComplaint[] = [];
  filteredComplaints: AdminComplaint[] = [];
  selectedComplaint: AdminComplaint | null = null;
  statusFilter = '';
  searchQuery = '';
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  toasts: Toast[] = [];
  confirm: ConfirmState = { open: false, title: '', body: '', confirmLabel: 'Confirm', danger: false, onConfirm: () => {} };

  ngOnInit() {
    this.loadComplaints();
  }

  ngOnDestroy() {
    this.toastTimers.forEach(timer => clearTimeout(timer));
  }

  loadComplaints() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getComplaints({ status: this.statusFilter || undefined }).subscribe({
      next: complaints => {
        this.complaints = complaints;
        this.applySearch();
        if (this.selectedComplaint) {
          this.selectedComplaint = complaints.find(item => item.id === this.selectedComplaint?.id) || null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Complaints could not be loaded.';
        this.isLoading = false;
      }
    });
  }

  openComplaint(complaint: AdminComplaint) {
    this.selectedComplaint = { ...complaint };
  }

  applySearch() {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredComplaints = query
      ? this.complaints.filter(complaint =>
          complaint.subject.toLowerCase().includes(query) ||
          complaint.userId.toLowerCase().includes(query)
        )
      : [...this.complaints];
  }

  closeComplaint() {
    this.selectedComplaint = null;
  }

  saveComplaint() {
    if (!this.selectedComplaint || this.isSaving) return;

    this.isSaving = true;
    const payload = {
      status: this.selectedComplaint.status,
      adminResponse: this.selectedComplaint.adminResponse || ''
    };

    this.adminService.updateComplaint(this.selectedComplaint.id, payload).subscribe({
      next: updated => {
        this.complaints = this.complaints.map(item => item.id === updated.id ? updated : item);
        this.selectedComplaint = { ...updated };
        this.isSaving = false;
        this.showToast('success', 'Complaint updated successfully.');
      },
      error: () => {
        this.isSaving = false;
        this.showToast('error', 'Complaint could not be updated.');
      }
    });
  }

  requestDelete(complaint: AdminComplaint) {
    this.confirm = {
      open: true,
      title: 'Delete Complaint',
      body: `Are you sure you want to delete the complaint "${complaint.subject}"?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => this.executeDelete(complaint)
    };
  }

  private executeDelete(complaint: AdminComplaint) {
    this.confirm.open = false;
    this.adminService.deleteComplaint(complaint.id).subscribe({
      next: () => {
        this.complaints = this.complaints.filter(item => item.id !== complaint.id);
        if (this.selectedComplaint?.id === complaint.id) {
          this.selectedComplaint = null;
        }
        this.showToast('success', 'Complaint deleted successfully.');
      },
      error: () => this.showToast('error', 'Complaint could not be deleted.')
    });
  }

  cancelConfirm() {
    this.confirm.open = false;
  }

  showToast(type: 'success' | 'error', message: string) {
    const id = ++this.toastCounter;
    this.toasts = [...this.toasts, { id, type, message }];
    const timer = setTimeout(() => this.dismissToast(id), 4000);
    this.toastTimers.push(timer);
  }

  dismissToast(id: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }
}
