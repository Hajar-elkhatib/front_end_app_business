import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Complaint } from '../../../models/complaint.model';
import { ComplaintService } from '../../../services/availability-complaint.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './complaint-list.html',
  styleUrls: ['./complaint-list.css']
})
export class ComplaintList implements OnInit {
  private complaintService = inject(ComplaintService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  isLoading = true;
  query = '';
  statusFilter = 'all';

  ngOnInit() {
    this.loadComplaints();
    this.route.queryParamMap.subscribe(params => {
      this.query = (params.get('search') || '').toLowerCase();
      this.applyFilters();
    });
  }

  loadComplaints() {
    this.isLoading = true;
    const userId = this.authService.currentUser?.id;
    const source = userId
      ? this.complaintService.getUserComplaints(userId)
      : this.complaintService.getComplaints();

    source.subscribe({
      next: complaints => {
        this.complaints = complaints;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.complaints = [];
        this.filteredComplaints = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters() {
    let results = [...this.complaints];
    if (this.statusFilter !== 'all') {
      results = results.filter(complaint => complaint.status === this.statusFilter);
    }
    if (this.query) {
      results = results.filter(complaint =>
        complaint.subject.toLowerCase().includes(this.query) ||
        complaint.description.toLowerCase().includes(this.query) ||
        complaint.category.toLowerCase().includes(this.query) ||
        complaint.priority.toLowerCase().includes(this.query) ||
        complaint.status.toLowerCase().includes(this.query)
      );
    }
    this.filteredComplaints = results;
  }

  deleteComplaint(complaint: Complaint) {
    if (!confirm(`Delete complaint "${complaint.subject}"?`)) {
      return;
    }
    this.complaintService.deleteComplaint(complaint.id).subscribe(() => {
      this.complaints = this.complaints.filter(item => item.id !== complaint.id);
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }
}
