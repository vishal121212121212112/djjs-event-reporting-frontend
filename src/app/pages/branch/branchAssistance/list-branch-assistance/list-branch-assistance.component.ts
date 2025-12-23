import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/branch-assistance.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-branch-assistance',
  templateUrl: './list-branch-assistance.component.html',
  styleUrls: ['./list-branch-assistance.component.scss']
})
export class ListBranchAssistanceComponent implements OnInit {

  users: any[] = []; // Paginated users to display
  allUsersData: any[] = []; // Store all users for pagination
  filteredUsersData: any[] = []; // Store filtered users
  expandedRows: { [key: string]: boolean } = {};
  loading: boolean = false;

  // Pagination & Filters
  first = 0;
  rows = 10;
  rowsPerPageOptions = [10, 20, 50];
  globalFilterValue: string = '';

  // Per-column filter, dropdown, and pinning
  filters: { [key: string]: string } = {};
  activeFilter: string | null = null;
  dropdownOpen: { [key: string]: boolean } = {};
  pinnedColumns: string[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageService
  ) { }

ngOnInit(): void {
  // Initialize filters for columns
  this.filters = {
    branchEmail: '',
    name: '',
    type: '',
    createdBy: '',
    updatedBy: ''
  };

  // Initialize empty users array - will be populated from API
  this.users = [];
  this.expandedRows = {};
  
  // Load users from API
  this.fetchUsers();
}


  // Fetch users from backend (optionally can pass filters, pagination)
  fetchUsers(sortField?: string, sortOrder?: number) {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        // Map the API response to ensure all fields are properly displayed
        const mappedUsers = data.map((user: any) => ({
          ...user,
          // Ensure role name is accessible
          roleName: user.role?.name || 'N/A'
        }));
        
        // Store all users
        this.allUsersData = mappedUsers;
        
        // Apply filters if any
        this.applyFilters();
        
        // Update paginated users
        this.updatePaginatedUsers();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load users. Please try again.' 
        });
        this.allUsersData = [];
        this.filteredUsersData = [];
        this.users = [];
        this.loading = false;
      }
    });
  }

  // Apply filters to users
  applyFilters() {
    if (!this.globalFilterValue || this.globalFilterValue.trim() === '') {
      this.filteredUsersData = [...this.allUsersData];
      return;
    }

    const searchTerm = this.globalFilterValue.toLowerCase().trim();
    this.filteredUsersData = this.allUsersData.filter((user: any) => {
      return (
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.role?.name && user.role.name.toLowerCase().includes(searchTerm)) ||
        (user.created_by && user.created_by.toLowerCase().includes(searchTerm)) ||
        (user.updated_by && user.updated_by.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Update paginated users based on current page
  updatePaginatedUsers() {
    const sourceData = this.hasActiveFilters() ? this.filteredUsersData : this.allUsersData;
    const start = this.first;
    const end = start + this.rows;
    this.users = sourceData.slice(start, end);
  }

  // Check if there are active filters
  hasActiveFilters(): boolean {
    return this.globalFilterValue && this.globalFilterValue.trim() !== '';
  }

  // Get total records for pagination component
  getTotalRecords(): number {
    return this.hasActiveFilters() ? this.filteredUsersData.length : this.allUsersData.length;
  }

  // Add a new user
  addUser() {
    this.router.navigate(['/branch/branchAssistance/add']);
  }

  // Edit a user
  editUser(userId: string) {
    console.log('Edit user:', userId);
  }

  // Delete a user
  deleteUser(userId: string) {
    this.userService.deleteUser(userId).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted successfully' });
      this.fetchUsers();
    });
  }

  // Row expand/collapse
  onRowExpand(event: any) {
    this.expandedRows[event.data.id] = true;
  }

  onRowCollapse(event: any) {
    this.expandedRows[event.data.id] = false;
  }

  // Pagination
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows || this.rows; // Keep current rows if not provided
    this.updatePaginatedUsers();
  }

  // Sorting
  onSort(event: any) {
    const { field, order } = event;
    this.fetchUsers(field, order);
  }

  // Apply global + per-column filter
  applyFilter() {
    this.first = 0; // Reset to first page when filtering
    this.applyFilters();
    this.updatePaginatedUsers();
  }

  // Dropdowns for per-column filters
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

  // Column pinning
  isColumnPinned(column: string): boolean {
    return this.pinnedColumns.includes(column);
  }

  toggleColumnPin(column: string) {
    if (this.isColumnPinned(column)) {
      this.pinnedColumns = this.pinnedColumns.filter(c => c !== column);
    } else {
      this.pinnedColumns.push(column);
    }
  }
}
