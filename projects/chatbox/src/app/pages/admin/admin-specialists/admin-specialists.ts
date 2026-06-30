import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminSpecialist } from '../../../services/admin.service';

interface Toast { id: number; type: 'success' | 'error'; message: string; }
interface ConfirmState {
  open: boolean; title: string; body: string;
  confirmLabel: string; danger: boolean;
  onConfirm: () => void;
}

@Component({
  selector: 'app-admin-specialists',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <section class="admin-page">
      <header class="admin-header">
        <div>
          <p class="admin-kicker">Admin</p>
          <h1>Specialists</h1>
          <p class="admin-copy">Manage specialist applications, approvals, and platform status.</p>
        </div>
        <button class="admin-refresh" type="button" (click)="loadSpecialists()" [disabled]="isLoading || isProcessing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </header>

      <!-- Tabs -->
      <div class="complaint-summary-row" style="grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="complaint-stat" [class.active]="view === 'all'" (click)="setView('all')">
          <span class="cs-label" style="font-size:1rem">All Specialists</span>
        </div>
        <div class="complaint-stat cs-progress" [class.active]="view === 'pending'" (click)="setView('pending')">
          <span class="cs-label" style="font-size:1rem">Pending Review</span>
        </div>
        <div class="complaint-stat cs-resolved" [class.active]="view === 'verified'" (click)="setView('verified')">
          <span class="cs-label" style="font-size:1rem">Verified</span>
        </div>
      </div>

      <!-- Filters for 'all' view -->
      <div class="filters" *ngIf="view === 'all'">
        <input class="input" placeholder="Expertise or skill" [(ngModel)]="expertise" (ngModelChange)="loadSpecialists()" aria-label="Search expertise" />
        <select class="input" [(ngModel)]="approvalStatus" (ngModelChange)="loadSpecialists()" aria-label="Filter by approval status">
          <option value="">All approvals</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select class="input" [(ngModel)]="active" (ngModelChange)="loadSpecialists()" aria-label="Filter by active status">
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div *ngIf="errorMessage" class="admin-error">
        <span>{{errorMessage}}</span>
        <button type="button" class="error-retry" (click)="loadSpecialists()">Retry</button>
      </div>

      <div *ngIf="isLoading" class="skeleton-grid skeleton-grid-sm">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
      </div>

      <div *ngIf="!isLoading && !specialists.length" class="table-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.75rem;display:block;opacity:.35"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        No specialists found for this view.
      </div>

      <div *ngIf="!isLoading && specialists.length" class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Specialist</th>
              <th>Email</th>
              <th>Domain</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let specialist of specialists" [class.muted]="!specialist.active || specialist.approvalStatus === 'REJECTED'">
              <td>
                <div style="display:flex;align-items:center;gap:.6rem">
                  <span class="user-avatar" style="width:28px;height:28px;font-size:.65rem;background:linear-gradient(135deg, #10b981, #34d399)">
                    {{userInitials(specialist.fullName)}}
                  </span>
                  <span style="font-weight:600">{{specialist.fullName}}</span>
                </div>
              </td>
              <td>{{specialist.email || '—'}}</td>
              <td>{{specialist.expertiseDomain || specialist.skills?.join(', ') || '—'}}</td>
              <td>{{specialist.rating ? (specialist.rating | number:'1.1-1') + ' ★' : '—'}}</td>
              <td>
                <span class="badge-pill" [class.badge-good]="specialist.active" [class.badge-bad]="!specialist.active">
                  {{specialist.active ? 'Active' : 'Inactive'}}
                </span>
              </td>
              <td>
                <span class="badge-pill" 
                  [class.badge-good]="specialist.approvalStatus === 'APPROVED'" 
                  [class.badge-warn]="specialist.approvalStatus === 'PENDING'" 
                  [class.badge-bad]="specialist.approvalStatus === 'REJECTED' || specialist.approvalStatus === 'SUSPENDED'">
                  {{specialist.approvalStatus}}
                </span>
              </td>
              <td class="actions">
                <button *ngIf="specialist.approvalStatus === 'PENDING' || specialist.approvalStatus === 'REJECTED'" 
                        class="admin-action" type="button" (click)="requestConfirm(specialist)" [disabled]="isProcessing">Confirm</button>
                
                <button *ngIf="specialist.approvalStatus === 'PENDING' || specialist.approvalStatus === 'APPROVED'" 
                        class="admin-danger" type="button" (click)="requestReject(specialist)" [disabled]="isProcessing">Reject</button>
                
                <button *ngIf="specialist.approvalStatus === 'APPROVED' && specialist.active" 
                        class="admin-danger" type="button" (click)="setActive(specialist, false)" [disabled]="isProcessing">Suspend</button>
                
                <button *ngIf="specialist.approvalStatus === 'APPROVED' && !specialist.active" 
                        class="admin-action" type="button" (click)="setActive(specialist, true)" [disabled]="isProcessing">Reactivate</button>
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
export class AdminSpecialists implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  specialists: AdminSpecialist[] = [];
  view: 'all' | 'pending' | 'verified' = 'pending';
  approvalStatus = '';
  active = '';
  expertise = '';
  
  isLoading = true;
  isProcessing = false;
  errorMessage = '';

  private toastCounter = 0;
  private toastTimers: ReturnType<typeof setTimeout>[] = [];
  toasts: Toast[] = [];
  confirm: ConfirmState = { open: false, title: '', body: '', confirmLabel: 'Confirm', danger: false, onConfirm: () => {} };

  ngOnInit() { this.loadSpecialists(); }

  ngOnDestroy() { this.toastTimers.forEach(t => clearTimeout(t)); }

  setView(view: 'all' | 'pending' | 'verified') {
    this.view = view;
    this.approvalStatus = '';
    this.active = '';
    this.expertise = '';
    this.loadSpecialists();
  }

  userInitials(fullName: string | undefined): string {
    if (!fullName) return '?';
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  loadSpecialists() {
    this.isLoading = true;
    this.errorMessage = '';
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

  requestConfirm(specialist: AdminSpecialist) {
    this.confirm = {
      open: true, title: 'Confirm Specialist',
      body: `Approve ${specialist.fullName} as a verified specialist on the platform?`,
      confirmLabel: 'Approve', danger: false,
      onConfirm: () => this.executeConfirm(specialist)
    };
  }

  private executeConfirm(specialist: AdminSpecialist) {
    this.confirm.open = false;
    this.isProcessing = true;
    this.adminService.confirmSpecialist(specialist.id).subscribe({
      next: () => {
        this.showToast('success', `${specialist.fullName} has been approved.`);
        this.loadSpecialists();
        this.isProcessing = false;
      },
      error: () => {
        this.showToast('error', 'Failed to approve specialist.');
        this.isProcessing = false;
      }
    });
  }

  requestReject(specialist: AdminSpecialist) {
    this.confirm = {
      open: true, title: 'Reject Specialist',
      body: `Are you sure you want to reject ${specialist.fullName}'s application? They will not be able to offer services.`,
      confirmLabel: 'Reject', danger: true,
      onConfirm: () => this.executeReject(specialist)
    };
  }

  private executeReject(specialist: AdminSpecialist) {
    this.confirm.open = false;
    this.isProcessing = true;
    this.adminService.rejectSpecialist(specialist.id).subscribe({
      next: () => {
        this.showToast('success', `${specialist.fullName} has been rejected.`);
        this.loadSpecialists();
        this.isProcessing = false;
      },
      error: () => {
        this.showToast('error', 'Failed to reject specialist.');
        this.isProcessing = false;
      }
    });
  }

  setActive(specialist: AdminSpecialist, active: boolean) {
    this.isProcessing = true;
    this.adminService.updateSpecialistStatus(specialist.id, active).subscribe({
      next: updated => {
        Object.assign(specialist, updated);
        this.showToast('success', `${specialist.fullName} is now ${active ? 'active' : 'suspended'}.`);
        this.isProcessing = false;
      },
      error: () => {
        this.showToast('error', 'Failed to update specialist status.');
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
