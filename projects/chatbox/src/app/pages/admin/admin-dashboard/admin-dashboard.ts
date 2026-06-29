import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminComplaint, AdminService, DashboardSummary } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  summary?: DashboardSummary;
  complaints: AdminComplaint[] = [];
  complaintResponses: Record<string, string> = {};
  complaintStatus = '';
  isLoading = true;
  errorMessage = '';
  mode: 'dashboard' | 'complaints' = 'dashboard';

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.mode = data['collection'] === 'complaints' ? 'complaints' : 'dashboard';
      this.loadCurrentView();
    });
  }

  loadCurrentView() {
    if (this.mode === 'complaints') {
      this.loadComplaints();
      return;
    }
    this.loadSummary();
  }

  loadSummary() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getDashboardStatistics().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Admin dashboard data could not be loaded.';
        this.isLoading = false;
      }
    });
  }

  loadComplaints() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getComplaints({ status: this.complaintStatus }).subscribe({
      next: complaints => {
        this.complaints = complaints;
        this.complaintResponses = complaints.reduce((acc, complaint) => {
          acc[complaint.id] = complaint.adminResponse || '';
          return acc;
        }, {} as Record<string, string>);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Complaints could not be loaded.';
        this.isLoading = false;
      }
    });
  }

  updateComplaint(complaint: AdminComplaint, status: string, response = '') {
    this.adminService.updateComplaint(complaint.id, { status, adminResponse: response }).subscribe({
      next: () => this.loadComplaints(),
      error: () => this.errorMessage = 'Complaint could not be updated.'
    });
  }

  deleteComplaint(complaint: AdminComplaint) {
    this.adminService.deleteComplaint(complaint.id).subscribe({
      next: () => this.loadComplaints(),
      error: () => this.errorMessage = 'Complaint could not be deleted.'
    });
  }
}
