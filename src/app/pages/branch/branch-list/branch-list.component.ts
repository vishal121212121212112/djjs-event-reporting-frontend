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
  totalRecords: number = 0;

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
    // Load branches from service
    this.loadBranches();
  }

  loadBranches(sortField?: string, sortOrder?: number) {
    this.loading = true;
    this.branchService.getBranches().subscribe({
      next: (branches: any[]) => {
        // Convert Branch data to BranchData format for compatibility
        let convertedBranches: BranchData[] = branches.map(branch => ({
          id: branch.id,
          branchName: branch.areaName,
          coordinatorName: 'Not specified', // Default value since our Branch doesn't have this
          state: branch.district, // Using district as state for compatibility
          city: branch.areaName, // Using areaName as city for compatibility
          establishedOn: branch.createdAt,
          ashramArea: `${branch.areaCoverage} sq km`,
          members: [] // Default empty array since our Branch doesn't have members
        }));

        // Apply sorting if provided
        if (sortField && sortOrder) {
          convertedBranches.sort((a, b) => {
            const aValue = a[sortField as keyof BranchData];
            const bValue = b[sortField as keyof BranchData];
            if (aValue < bValue) return sortOrder === 1 ? -1 : 1;
            if (aValue > bValue) return sortOrder === 1 ? 1 : -1;
            return 0;
          });
        }

        // Apply global filter
        if (this.globalFilterValue) {
          const filterValue = this.globalFilterValue.toLowerCase();
          convertedBranches = convertedBranches.filter(branch =>
            branch.branchName.toLowerCase().includes(filterValue) ||
            branch.coordinatorName.toLowerCase().includes(filterValue) ||
            branch.state.toLowerCase().includes(filterValue) ||
            branch.city.toLowerCase().includes(filterValue)
          );
        }

        // Apply pagination
        const start = this.first;
        const end = start + this.rows;
        this.branches = convertedBranches.slice(start, end);
        this.totalRecords = convertedBranches.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.loading = false;
      }
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
