import { CommonModule, DecimalPipe, LowerCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AdminComplaint, AdminService, ComplaintStatus, DashboardSummary
} from '../../../services/admin.service';

interface Toast { id: number; type: 'success' | 'error'; message: string; }
interface BarItem { label: string; value: number; pct: number; }
interface DonutData {
  total: number; inProgressArc: number; analyzedArc: number; draftArc: number;
  offset: number; analyzedOffset: number; draftOffset: number;
}
interface StatCard { label: string; value: number; icon: string; accent: string; sub?: string; }
interface ConfirmState {
  open: boolean; title: string; body: string;
  confirmLabel: string; danger: boolean;
  onConfirm: () => void;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LowerCasePipe, DecimalPipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private toastCounter = 0;
  private toastTimers: ReturnType<typeof setTimeout>[] = [];

  summary?: DashboardSummary;
  complaints: AdminComplaint[] = [];
  filteredComplaints: AdminComplaint[] = [];
  complaintResponses: Record<string, string> = {};
  complaintStatus: ComplaintStatus | '' = '';
  complaintSearch = '';
  selectedComplaint: AdminComplaint | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  mode: 'dashboard' | 'complaints' = 'dashboard';
  toasts: Toast[] = [];
  chartBars: BarItem[] = [];
  statCards: StatCard[] = [];
  donut: DonutData = { total: 314, inProgressArc: 0, analyzedArc: 0, draftArc: 0, offset: 0, analyzedOffset: 0, draftOffset: 0 };
  confirm: ConfirmState = { open: false, title: '', body: '', confirmLabel: 'Confirm', danger: false, onConfirm: () => {} };

  readonly statusOptions: { value: ComplaintStatus | ''; label: string }[] = [
    { value: '', label: 'All statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  get complaintCounts() {
    return {
      open:       this.complaints.filter(c => c.status === 'OPEN').length,
      inProgress: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
      resolved:   this.complaints.filter(c => c.status === 'RESOLVED').length,
      closed:     this.complaints.filter(c => c.status === 'CLOSED').length,
    };
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.mode = data['collection'] === 'complaints' ? 'complaints' : 'dashboard';
      this.loadCurrentView();
    });
  }

  ngOnDestroy() { this.toastTimers.forEach(t => clearTimeout(t)); }

  loadCurrentView() {
    if (this.mode === 'complaints') { this.loadComplaints(); return; }
    this.loadSummary();
  }

  loadSummary() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getDashboardStatistics().subscribe({
      next: s => {
        this.summary = s;
        this.buildStatCards(s);
        this.buildChart(s);
        this.buildDonut(s);
        this.isLoading = false;
      },
      error: () => { this.errorMessage = 'Dashboard data could not be loaded.'; this.isLoading = false; }
    });
  }

  loadComplaints() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getComplaints({ status: this.complaintStatus || undefined }).subscribe({
      next: complaints => {
        this.complaints = complaints;
        this.complaintResponses = complaints.reduce((acc, c) => {
          acc[c.id] = c.adminResponse ?? '';
          return acc;
        }, {} as Record<string, string>);
        this.applyComplaintSearch();
        this.isLoading = false;
      },
      error: () => { this.errorMessage = 'Complaints could not be loaded.'; this.isLoading = false; }
    });
  }

  applyComplaintSearch() {
    const q = this.complaintSearch.trim().toLowerCase();
    this.filteredComplaints = q
      ? this.complaints.filter(c =>
          c.subject.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.category ?? '').toLowerCase().includes(q)
        )
      : [...this.complaints];
  }

  openComplaintDetail(complaint: AdminComplaint) { this.selectedComplaint = complaint; }
  closeComplaintDetail() { this.selectedComplaint = null; }

  requestUpdateComplaint(complaint: AdminComplaint, status: ComplaintStatus) {
    const response = this.complaintResponses[complaint.id] ?? '';
    this.isSaving = true;
    this.adminService.updateComplaint(complaint.id, { status, adminResponse: response }).subscribe({
      next: () => {
        this.showToast('success', `Complaint marked as ${status.replace('_', ' ')}.`);
        this.selectedComplaint = null;
        this.loadComplaints();
        this.isSaving = false;
      },
      error: () => { this.showToast('error', 'Complaint could not be updated.'); this.isSaving = false; }
    });
  }

  requestDeleteComplaint(complaint: AdminComplaint) {
    this.confirm = {
      open: true, title: 'Delete Complaint',
      body: `Are you sure you want to permanently delete the complaint "${complaint.subject}"?`,
      confirmLabel: 'Delete', danger: true,
      onConfirm: () => this.executeDeleteComplaint(complaint),
    };
  }

  private executeDeleteComplaint(complaint: AdminComplaint) {
    this.confirm.open = false;
    this.adminService.deleteComplaint(complaint.id).subscribe({
      next: () => { this.showToast('success', 'Complaint deleted.'); this.loadComplaints(); },
      error: () => this.showToast('error', 'Complaint could not be deleted.')
    });
  }

  dismissToast(id: number) { this.toasts = this.toasts.filter(t => t.id !== id); }
  cancelConfirm() { this.confirm.open = false; }

  userInitials(fullName: string | undefined): string {
    if (!fullName) return '?';
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  private buildStatCards(s: DashboardSummary) {
    this.statCards = [
      { label: 'Total Users',         value: s.totalUsers,                icon: 'users',       accent: 'blue',   sub: `${s.totalEntrepreneurs} entrepreneurs` },
      { label: 'Entrepreneurs',        value: s.totalEntrepreneurs,         icon: 'briefcase',   accent: 'teal',   sub: '' },
      { label: 'Specialists',          value: s.totalSpecialists,           icon: 'star',        accent: 'purple', sub: '' },
      { label: 'Pending Specialists',  value: s.pendingSpecialists ?? s.pendingSpecialistRequests, icon: 'clock', accent: 'warn', sub: '' },
      { label: 'Verified Specialists', value: s.verifiedSpecialists ?? 0,   icon: 'check-circle',accent: 'green',  sub: '' },
      { label: 'Banned Users',         value: s.bannedUsers ?? 0,           icon: 'ban',         accent: 'red',    sub: '' },
      { label: 'Total Projects',       value: s.totalProjects,              icon: 'folder',      accent: 'indigo', sub: `${s.analyzedProjects} analyzed` },
      { label: 'Total Complaints',     value: s.totalComplaints ?? 0,       icon: 'alert',       accent: 'orange', sub: '' },
      { label: 'Total Reviews',        value: s.totalReviews ?? s.generatedReports, icon: 'file-text', accent: 'teal', sub: '' },
      { label: 'Total Evaluations',    value: s.totalEvaluations ?? 0,      icon: 'award',       accent: 'purple', sub: '' },
    ];
  }

  private buildChart(s: DashboardSummary) {
    const raw: BarItem[] = [
      { label: 'Users',    value: s.totalUsers ?? 0,        pct: 0 },
      { label: 'Projects', value: s.totalProjects ?? 0,     pct: 0 },
      { label: 'Analyzed', value: s.analyzedProjects ?? 0,  pct: 0 },
      { label: 'Reports',  value: s.generatedReports ?? 0,  pct: 0 },
      { label: 'Specs',    value: s.totalSpecialists ?? 0,  pct: 0 },
      { label: 'Requests', value: s.matchedRequests + s.pendingSpecialistRequests, pct: 0 },
    ];
    const max = Math.max(...raw.map(b => b.value), 1);
    this.chartBars = raw.map(b => ({ ...b, pct: Math.round((b.value / max) * 100) }));
  }

  private buildDonut(s: DashboardSummary) {
    const c = 2 * Math.PI * 50;
    const total = Math.max(s.totalProjects ?? 1, 1);
    const inP = s.projectsInProgress ?? 0;
    const ana = s.analyzedProjects ?? 0;
    const dra = s.draftProjects ?? 0;
    const start = c * 0.25;
    const inPArc = (inP / total) * c;
    const anaArc = (ana / total) * c;
    const draArc = (dra / total) * c;
    this.donut = {
      total: c, inProgressArc: inPArc, analyzedArc: anaArc, draftArc: draArc,
      offset:         c - inPArc + start,
      analyzedOffset: c - anaArc + start - inPArc,
      draftOffset:    c - draArc + start - inPArc - anaArc,
    };
  }

  showToast(type: 'success' | 'error', message: string) {
    const id = ++this.toastCounter;
    this.toasts = [...this.toasts, { id, type, message }];
    const timer = setTimeout(() => this.dismissToast(id), 4000);
    this.toastTimers.push(timer);
  }
}
