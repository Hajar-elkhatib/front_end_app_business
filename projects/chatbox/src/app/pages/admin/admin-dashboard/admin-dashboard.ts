import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminCollection, AdminDocument, AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  collections: AdminCollection[] = [];
  documents: AdminDocument[] = [];
  allDocuments: AdminDocument[] = [];
  fieldNames: string[] = [];
  selectedCollection = '';
  isLoadingCollections = true;
  isLoadingDocuments = false;
  isDeletingId = '';
  errorMessage = '';
  searchQuery = '';

  ngOnInit() {
    this.loadCollections();
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery = (params.get('search') || '').toLowerCase();
      this.applySearch();
    });
  }

  loadCollections() {
    this.isLoadingCollections = true;
    this.errorMessage = '';
    this.adminService.getCollections().subscribe({
      next: (collections) => {
        this.collections = collections;
        const requestedCollection = this.route.snapshot.data['collection'] as string | undefined;
        const selected = collections.find(collection => collection.name === requestedCollection)
          || collections.find(collection => collection.name === this.selectedCollection)
          || collections[0];

        this.isLoadingCollections = false;
        if (selected) {
          this.openCollection(selected.name);
        } else {
          this.documents = [];
          this.fieldNames = [];
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Admin collections could not be loaded.';
        this.isLoadingCollections = false;
        this.cdr.markForCheck();
      }
    });
  }

  openCollection(collection: string) {
    this.selectedCollection = collection;
    this.isLoadingDocuments = true;
    this.errorMessage = '';
    this.adminService.getDocuments(collection).subscribe({
      next: (documents) => {
        this.allDocuments = documents;
        this.applySearch();
        this.isLoadingDocuments = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.documents = [];
        this.allDocuments = [];
        this.fieldNames = [];
        this.errorMessage = `Documents from ${collection} could not be loaded.`;
        this.isLoadingDocuments = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteDocument(document: AdminDocument) {
    const id = this.getId(document);
    if (!id || !this.selectedCollection || !confirm(`Delete this document from ${this.selectedCollection}?`)) {
      return;
    }

    this.isDeletingId = id;
    this.adminService.deleteDocument(this.selectedCollection, id).subscribe({
      next: () => {
        this.documents = this.documents.filter(item => this.getId(item) !== id);
        const collection = this.collections.find(item => item.name === this.selectedCollection);
        if (collection && collection.documentCount > 0) {
          collection.documentCount -= 1;
        }
        this.fieldNames = this.getFieldNames(this.documents);
        this.isDeletingId = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'The document was not deleted.';
        this.isDeletingId = '';
        this.cdr.markForCheck();
      }
    });
  }

  getId(document: AdminDocument): string {
    return String(document['_id'] || '');
  }

  getValue(document: AdminDocument, field: string): string {
    const value = document[field];
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  applySearch() {
    const query = this.searchQuery.trim();
    this.documents = query
      ? this.allDocuments.filter(document =>
          Object.values(document).some(value => this.stringifyValue(value).toLowerCase().includes(query))
        )
      : [...this.allDocuments];
    this.fieldNames = this.getFieldNames(this.documents);
    this.cdr.markForCheck();
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  private getFieldNames(documents: AdminDocument[]): string[] {
    const names = new Set<string>();
    documents.slice(0, 20).forEach(document => {
      Object.keys(document)
        .filter(field => field !== '_class')
        .forEach(field => names.add(field));
    });

    return [...names].sort((left, right) => {
      if (left === '_id') return -1;
      if (right === '_id') return 1;
      return left.localeCompare(right);
    });
  }
}
