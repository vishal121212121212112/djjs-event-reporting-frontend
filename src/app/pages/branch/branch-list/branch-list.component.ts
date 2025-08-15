import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BranchService } from 'src/app/core/services/branch.service';

interface BranchData {
  id: string;
  branchName: string;
  coordinatorName: string;
  state: string;
  city: string;
  establishedOn: Date;
  ashramArea: string;
  members: any[];
}

@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss']
})
export class BranchListComponent implements OnInit {

  branches: BranchData[] = [];
  expandedRows: { [key: string]: boolean } = {};
  loading: boolean = false;

  // Pagination & Filters
  first = 0;
  rows = 10;
  rowsPerPageOptions = [5, 10, 20, 50];
  globalFilterValue = '';

  // Per-column filter, dropdown, and pinning state
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;
  dropdownOpen: { [key: string]: boolean } = {};
  pinnedColumns: string[] = [];

  constructor(
    private router: Router,
    private branchService: BranchService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Comment out this.loadBranches();
    // this.loadBranches();

    // Dummy data for testing
    this.branches = [
      {
        id: '1',
        branchName: 'Delhi Ashram',
        coordinatorName: 'Sunita Verma',
        state: 'Delhi',
        city: 'New Delhi',
        establishedOn: new Date(2001, 4, 15),
        ashramArea: '5000 sq ft',
        members: [
          { name: 'Ravi', role: 'Member', responsibility: 'Seva', age: 30, dateOfSamarpan: '2015-06-10', qualification: 'B.Sc' }
        ]
      },
      {
        id: '2',
        branchName: 'Mumbai Center',
        coordinatorName: 'Rajesh Kumar',
        state: 'Maharashtra',
        city: 'Mumbai',
        establishedOn: new Date(2010, 10, 20),
        ashramArea: '3000 sq ft',
        members: [
          { name: 'Anita', role: 'Member', responsibility: 'Kitchen', age: 28, dateOfSamarpan: '2018-03-15', qualification: 'M.A.' }
        ]
      }
      // Add more objects as needed
    ];
  }

  loadBranches(sortField?: string, sortOrder?: number) {
    this.loading = true;
    // If you want to support per-column filtering on backend, pass this.filters as well
    this.branchService.getBranches(
      this.first,
      this.rows,
      this.globalFilterValue,
      sortField,
      sortOrder
      // , this.filters // Uncomment and implement in service if needed
    ).subscribe(data => {
      this.branches = data.branches || [];
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadBranches();
  }

  onSort(event: any) {
    const { field, order } = event;
    this.loadBranches(field, order);
  }

  // Handle global filter
  onGlobalFilterChange(event: any) {
    this.globalFilterValue = event.target.value;
    this.first = 0;
    this.loadBranches();
  }

  // Handle row expand
  onRowExpand(event: any) {
    this.expandedRows[event.data.id] = true;
  }

  // Handle row collapse
  onRowCollapse(event: any) {
    this.expandedRows[event.data.id] = false;
  }

  // Add new branch
  addBranch() {
    this.router.navigate(['/branch/add']);
  }

  // Edit branch
  editBranch(branchId: string) {
    console.log('Edit branch:', branchId);
  }

  // Delete branch
  deleteBranch(branchId: string) {
    this.branchService.deleteBranch(branchId).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Branch deleted successfully' });
      this.loadBranches();
    });
  }

  // --- Per-column filter, dropdown, and pinning logic ---

  toggleDropdown(column: string) {
    this.dropdownOpen[column] = !this.dropdownOpen[column];
    // Close others
    Object.keys(this.dropdownOpen).forEach(key => {
      if (key !== column) this.dropdownOpen[key] = false;
    });
  }

  isDropdownOpen(column: string): boolean {
    return !!this.dropdownOpen[column];
  }

  showFilter(column: string) {
    this.activeFilter = column;
    this.toggleDropdown(column);
  }

  clearFilter(column: string) {
    this.filters[column] = '';
    this.applyFilter();
  }

  applyFilter() {
    // For demo: combine all filters into global filter string
    // For real: pass this.filters to backend and filter there
    this.globalFilterValue = Object.values(this.filters).filter(Boolean).join(' ');
    this.first = 0;
    this.loadBranches();
  }

  isColumnPinned(column: string): boolean {
    return this.pinnedColumns.includes(column);
  }

  toggleColumnPin(column: string) {
    if (this.isColumnPinned(column)) {
      this.pinnedColumns = this.pinnedColumns.filter(c => c !== column);
    } else {
      this.pinnedColumns.push(column);
    }
    this.applyPinning();
  }

  applyPinning() {
    // Custom logic to apply pinning if needed
    console.log('Pinned columns:', this.pinnedColumns);
  }
}
