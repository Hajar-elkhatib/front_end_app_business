import { CommonModule, DecimalPipe, LowerCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AdminProject, AdminService, AdminUser, DashboardSummary } from '../../../services/admin.service';

interface BarItem { label: string; value: number; pct: number; }
interface DonutData {
  total: number; inProgressArc: number; analyzedArc: number; draftArc: number;
  offset: number; analyzedOffset: number; draftOffset: number;
}
interface StatCard { label: string; value: number; icon: string; accent: string; sub?: string; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LowerCasePipe, DecimalPipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private toastTimers: ReturnType<typeof setTimeout>[] = [];

  summary?: DashboardSummary;
  isLoading = true;
  errorMessage = '';
  chartBars: BarItem[] = [];
  statCards: StatCard[] = [];
  donut: DonutData = { total: 314, inProgressArc: 0, analyzedArc: 0, draftArc: 0, offset: 0, analyzedOffset: 0, draftOffset: 0 };
  recentProjects: AdminProject[] = [];
  recentUsers: AdminUser[] = [];

  ngOnInit() {
    this.loadSummary();
  }

  ngOnDestroy() {
    this.toastTimers.forEach(timer => clearTimeout(timer));
  }

  loadCurrentView() {
    this.loadSummary();
  }

  loadSummary() {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getDashboardStatistics().subscribe({
      next: stats => {
        this.summary = stats;
        this.buildStatCards(stats);
        this.buildChart(stats);
        this.buildDonut(stats);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Dashboard statistics could not be loaded.';
        this.isLoading = false;
      }
    });

    this.adminService.getUsers().subscribe({
      next: users => { this.recentUsers = users.slice(0, 5); },
      error: () => { this.recentUsers = []; }
    });

    this.adminService.getProjects().subscribe({
      next: projects => { this.recentProjects = projects.slice(0, 5); },
      error: () => { this.recentProjects = []; }
    });
  }

  userInitials(fullName: string | undefined): string {
    if (!fullName) return '?';
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  private buildStatCards(s: DashboardSummary) {
    this.statCards = [
      { label: 'Total Users', value: s.totalUsers, icon: 'users', accent: 'blue', sub: `${s.totalEntrepreneurs} entrepreneurs` },
      { label: 'Entrepreneurs', value: s.totalEntrepreneurs, icon: 'briefcase', accent: 'teal' },
      { label: 'Specialists', value: s.totalSpecialists, icon: 'star', accent: 'purple' },
      { label: 'Pending Specialists', value: s.pendingSpecialists, icon: 'clock', accent: 'warn' },
      { label: 'Verified Specialists', value: s.verifiedSpecialists, icon: 'check-circle', accent: 'green' },
      { label: 'Banned Users', value: s.bannedUsers, icon: 'ban', accent: 'red' },
      { label: 'Total Projects', value: s.totalProjects, icon: 'folder', accent: 'indigo', sub: `${s.validatedProjects} validated` },
      { label: 'Total Complaints', value: s.totalComplaints, icon: 'alert', accent: 'orange' },
      { label: 'Total Reviews', value: s.totalReviews, icon: 'file-text', accent: 'teal' },
      { label: 'Total Evaluations', value: s.totalEvaluations, icon: 'award', accent: 'purple' },
    ];
  }

  private buildChart(s: DashboardSummary) {
    const raw: BarItem[] = [
      { label: 'Users', value: s.totalUsers, pct: 0 },
      { label: 'Projects', value: s.totalProjects, pct: 0 },
      { label: 'Validated', value: s.validatedProjects, pct: 0 },
      { label: 'Reviews', value: s.totalReviews, pct: 0 },
      { label: 'Specs', value: s.totalSpecialists, pct: 0 },
      { label: 'Assignments', value: s.totalAssignments, pct: 0 },
    ];
    const max = Math.max(...raw.map(b => b.value), 1);
    this.chartBars = raw.map(b => ({ ...b, pct: Math.round((b.value / max) * 100) }));
  }

  private buildDonut(s: DashboardSummary) {
    const c = 2 * Math.PI * 50;
    const total = Math.max(s.totalProjects, 1);
    const draft = s.draftProjects;
    const submitted = s.submittedProjects;
    const validated = s.validatedProjects;
    const start = c * 0.25;
    const draftArc = (draft / total) * c;
    const submittedArc = (submitted / total) * c;
    const validatedArc = (validated / total) * c;
    this.donut = {
      total: c,
      inProgressArc: submittedArc,
      analyzedArc: validatedArc,
      draftArc,
      offset: c - submittedArc + start,
      analyzedOffset: c - validatedArc + start - submittedArc,
      draftOffset: c - draftArc + start - submittedArc - validatedArc,
    };
  }
}
