import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LocationService } from 'src/app/core/services/location.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';

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
  loadingMembers: { [key: string]: boolean } = {};
  membersLoaded: { [key: string]: boolean } = {};

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

  isCreatingMockBranch = false;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private messageService: MessageService,
    private tokenStorage: TokenStorageService
  ) { }

  ngOnInit(): void {
    // Load branches from service
    this.loadBranches();
  }

  loadBranches(sortField?: string, sortOrder?: number) {
    this.loading = true;
    this.locationService.getAllBranches().subscribe({
      next: (branches: any[]) => {
        // Convert API branch data to BranchData format
        let convertedBranches: BranchData[] = branches.map(branch => ({
          id: branch.id?.toString() || '',
          branchName: branch.name || 'Unnamed Branch',
          coordinatorName: branch.coordinator_name || 'Not specified',
          state: branch.state || '',
          city: branch.city || '',
          establishedOn: branch.established_on ? new Date(branch.established_on) : new Date(branch.created_on || Date.now()),
          ashramArea: branch.aashram_area ? `${branch.aashram_area} sq km` : '0 sq km',
          members: [] // Members not included in API response
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
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load branches. Please try again.' 
        });
        this.loading = false;
        this.branches = [];
        this.totalRecords = 0;
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
    const branchId = event.data.id;
    this.expandedRows[branchId] = true;
    
    // Fetch members if not already loaded
    if (!this.membersLoaded[branchId]) {
      this.loadBranchMembers(branchId);
    }
  }

  // Handle row collapse
  onRowCollapse(event: any) {
    this.expandedRows[event.data.id] = false;
  }

  // Load branch members
  loadBranchMembers(branchId: string) {
    const branchIdNum = parseInt(branchId, 10);
    if (isNaN(branchIdNum)) {
      console.error('Invalid branch ID:', branchId);
      return;
    }

    this.loadingMembers[branchId] = true;
    this.locationService.getBranchMembers(branchIdNum).subscribe({
      next: (members: any[]) => {
        // Map API response to component member structure
        const mappedMembers = members.map(member => ({
          name: member.name || '',
          role: member.branch_role || '',
          responsibility: member.responsibility || '',
          age: member.age || 0,
          dateOfSamarpan: member.date_of_samarpan ? new Date(member.date_of_samarpan).toLocaleDateString() : '',
          qualification: member.qualification || '',
          memberType: member.member_type || '',
          dateOfBirth: member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : ''
        }));

        // Update the branch's members
        const branch = this.branches.find(b => b.id === branchId);
        if (branch) {
          branch.members = mappedMembers;
        }
        this.loadingMembers[branchId] = false;
        this.membersLoaded[branchId] = true;
      },
      error: (error) => {
        console.error('Error loading branch members:', error);
        this.loadingMembers[branchId] = false;
        // Set empty array on error
        const branch = this.branches.find(b => b.id === branchId);
        if (branch) {
          branch.members = [];
        }
        this.membersLoaded[branchId] = true; // Mark as loaded even on error to prevent retries
      }
    });
  }

  // Add new branch
  addBranch() {
    this.router.navigate(['/branch/add']);
  }

  // Edit branch
  editBranch(branchId: string) {
    this.router.navigate(['/branch/edit', branchId]);
  }

  // Delete branch
  deleteBranch(branchId: string) {
    // TODO: Implement delete API call when available
    // For now, just reload the list
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Delete functionality will be implemented with API' });
    this.loadBranches();
  }

  // Create branch with mock data
  createBranchWithMockData() {
    if (this.isCreatingMockBranch) {
      return;
    }

    this.isCreatingMockBranch = true;

    // Get current user for created_by and updated_by
    const currentUser = this.tokenStorage.getUser();
    const createdBy = currentUser?.email || currentUser?.name || 'system';
    const currentTimestamp = new Date().toISOString();

    // Generate unique identifiers
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000); // Random 4-digit number
    const uniqueEmail = `test.branch.${timestamp}.${randomSuffix}@example.com`;
    
    // Generate unique contact number (10-digit Indian mobile number format)
    const randomContact = Math.floor(Math.random() * 9000000000) + 1000000000; // 10-digit number starting from 1000000000
    const uniqueContactNumber = `+91-${randomContact}`;

    // Generate mock data
    const mockBranchData = {
      aashram_area: Math.floor(Math.random() * 5000) + 1000, // Random between 1000-6000
      address: '123 Main Street, Sample Area',
      city: 'Mumbai',
      contact_number: uniqueContactNumber,
      coordinator_name: 'Swami Test',
      country: 'India',
      created_by: createdBy,
      created_on: currentTimestamp,
      daily_end_time: '20:00',
      daily_start_time: '06:00',
      district: 'Mumbai',
      email: uniqueEmail,
      established_on: currentTimestamp,
      id: 0, // Will be set by backend
      name: `Test Branch ${timestamp}`,
      open_days: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
      pincode: '400001',
      police_station: 'Test Police Station',
      post_office: 'Test Post Office',
      state: 'Maharashtra',
      updated_by: createdBy,
      updated_on: currentTimestamp
    };

    // Create branch via API
    this.locationService.createBranch(mockBranchData).subscribe({
      next: (response) => {
        console.log('Mock branch created successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Branch created successfully with mock data!'
        });
        this.isCreatingMockBranch = false;
        // Reload branches list
        this.loadBranches();
      },
      error: (error) => {
        console.error('Error creating mock branch:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to create branch. Please try again.'
        });
        this.isCreatingMockBranch = false;
      }
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
