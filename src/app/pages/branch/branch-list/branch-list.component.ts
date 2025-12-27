import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LocationService, Branch } from 'src/app/core/services/location.service';
import { ChildBranchService, ChildBranch, ChildBranchMember } from 'src/app/core/services/child-branch.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface BranchData {
  id: string;
  branchName: string;
  coordinatorName: string;
  state: string;
  city: string;
  establishedOn: Date;
  ashramArea: string;
  members: any[];
  children?: ChildBranchData[]; // Child branches from separate table
  isParent?: boolean; // Whether this branch has children
}

interface ChildBranchData {
  id: string;
  branchName: string;
  coordinatorName: string; // Inherited from parent
  state: string;
  city: string;
  establishedOn: Date;
  ashramArea: string;
  members: ChildBranchMember[];
  parentBranchId: number;
}

@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss']
})
export class BranchListComponent implements OnInit, OnDestroy {

  branches: BranchData[] = [];

  // Breadcrumb items
  breadCrumbItems: Array<{}> = [];
  expandedRows: { [key: string]: boolean } = {};
  loading: boolean = false;
  loadingMembers: { [key: string]: boolean } = {};
  membersLoaded: { [key: string]: boolean } = {};
  private routerSubscription?: Subscription;

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

  // Action menu state
  openActionMenu: string | null = null;

  // Members drawer state
  isMembersDrawerOpen: boolean = false;
  selectedBranchId: string | null = null;
  selectedBranchMembers: any[] = [];

  // Export state
  exporting: boolean = false;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private childBranchService: ChildBranchService,
    private messageService: MessageService,
    private tokenStorage: TokenStorageService,
    private confirmationDialog: ConfirmationDialogService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Set breadcrumbs
    this.breadCrumbItems = [
      { label: 'Branches', active: true }
    ];

    // Load branches from service
    this.loadBranches();

    // Subscribe to router events to reload branches when returning to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Reload branches when navigating to branch list
        if (event.url === '/branch' || event.url.startsWith('/branch?')) {
          this.loadBranches();
        }
      });
  }


  ngOnDestroy(): void {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    // Clear search timeout
    if ((this as any).searchTimeout) {
      clearTimeout((this as any).searchTimeout);
    }
  }

  loadBranches(sortField?: string, sortOrder?: number) {
    this.loading = true;

    // Determine if we should use server-side search
    const searchTerm = this.globalFilterValue?.trim();
    const shouldUseSearch = searchTerm && searchTerm.length > 0;

    // Use search API if we have a search term, otherwise get all branches
    // Search by name and coordinator - API will search both fields with OR logic
    const branchesObservable = shouldUseSearch
      ? this.locationService.searchBranches(searchTerm, searchTerm)
      : this.locationService.getAllBranches();

    // Debug logging
    console.log('Loading branches:', {
      searchTerm: searchTerm,
      shouldUseSearch: shouldUseSearch,
      first: this.first,
      rows: this.rows
    });

    branchesObservable.subscribe({
      next: (branches: Branch[]) => {
        console.log('API Response - Raw branches:', branches);
        console.log('API Response - Branch count:', branches?.length || 0);

        // Handle empty results gracefully
        if (!branches || branches.length === 0) {
          console.log('No branches returned from API');
          this.branches = [];
          this.totalRecords = 0;
          this.loading = false;
          return;
        }

        // Convert API branch data to BranchData format
        // Filter out any child branches that might come through (defensive programming)
        // Only process parent branches (parent_branch_id is null or undefined)
        let convertedBranches: BranchData[] = branches
          .filter(branch => !branch.parent_branch_id) // Only include parent branches
          .map(branch => {
            console.log('Converting branch:', branch.id, branch.name);

            // Don't preload children from API response - load them on expand
            // This ensures child branches are only shown when expanding parent branch
            const children: ChildBranchData[] = [];

            return {
              id: branch.id?.toString() || '',
              branchName: branch.name || 'Unnamed Branch',
              coordinatorName: branch.coordinator_name || 'Not specified',
              state: branch.state?.name || '',
              city: branch.city?.name || '',
              establishedOn: branch.established_on ? new Date(branch.established_on) : new Date(branch.created_on || Date.now()),
              ashramArea: branch.aashram_area ? `${branch.aashram_area} sq km` : '0 sq km',
              members: [], // Members not included in API response
              children: children, // Will be loaded on expand
              isParent: false // Will be determined when loading child branches
            };
          });

        console.log('Converted branches:', convertedBranches.length);

        // Don't apply additional client-side filtering when using search API
        // The API already handles name and coordinator search
        // Only apply client-side filtering if NOT using search API (for state/city)
        if (this.globalFilterValue && !shouldUseSearch) {
          const filterValue = this.globalFilterValue.toLowerCase();
          // Full client-side filtering when not using search API
          convertedBranches = convertedBranches.filter(branch =>
            (branch.branchName && branch.branchName.toLowerCase().includes(filterValue)) ||
            (branch.coordinatorName && branch.coordinatorName.toLowerCase().includes(filterValue)) ||
            (branch.state && branch.state.toLowerCase().includes(filterValue)) ||
            (branch.city && branch.city.toLowerCase().includes(filterValue))
          );
        }

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

        // Store all converted branches before pagination
        const allBranches = convertedBranches;

        // Apply pagination
        const start = this.first;
        const end = start + this.rows;
        this.branches = allBranches.slice(start, end);
        this.totalRecords = allBranches.length;
        this.loading = false;

        // Debug logging
        console.log('Loaded branches:', {
          total: allBranches.length,
          showing: this.branches.length,
          start: start,
          end: end,
          searchTerm: this.globalFilterValue
        });
      },
      error: (error) => {
        console.error('Error loading branches:', error);

        // Handle "no branches found" as info, not error
        const errorMessage = error.error?.error || error.error?.message || error.message || '';
        const isNotFound = error.status === 404 || errorMessage.toLowerCase().includes('no branches found');

        if (isNotFound) {
          // No branches found is not an error, just show empty state
          this.branches = [];
          this.totalRecords = 0;
          this.loading = false;
          return;
        }

        // Only show error for actual errors
        let errorDetail = 'Failed to load branches. Please try again.';
        if (error.error) {
          if (error.error.error && !error.error.error.toLowerCase().includes('no branches found')) {
            errorDetail = error.error.error;
          } else if (error.error.message && !error.error.message.toLowerCase().includes('no branches found')) {
            errorDetail = error.error.message;
          }
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorDetail,
          life: 5000
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

  // Handle global filter with debouncing
  onGlobalFilterChange(event: any) {
    const newValue = event.target.value || '';
    this.globalFilterValue = newValue;
    this.first = 0; // Reset to first page when searching

    console.log('Search input changed:', newValue);

    // Debounce search to avoid too many API calls
    // Clear any existing timeout
    if ((this as any).searchTimeout) {
      clearTimeout((this as any).searchTimeout);
    }

    // If search is cleared, load immediately
    if (!newValue || newValue.trim() === '') {
      console.log('Search cleared, loading all branches');
      this.loadBranches();
      return;
    }

    // Set new timeout - wait 300ms after user stops typing
    (this as any).searchTimeout = setTimeout(() => {
      console.log('Executing search after debounce:', this.globalFilterValue);
      this.loadBranches();
    }, 300);
  }

  // Handle row expand
  onRowExpand(event: any) {
    const branchId = event.data.id;
    this.expandedRows[branchId] = true;

    const branch = this.branches.find(b => b.id === branchId);

    // Always try to load child branches for any branch
    // This ensures we show child branches even if they weren't in the initial response
    if (branch) {
      if (!branch.children || branch.children.length === 0) {
        // Try loading child branches - if it's not a parent, API will return empty array
        this.loadChildBranches(branchId);
      }
    }

    // Note: We no longer load parent branch members - only child branches are shown
  }

  // Load child branches for a parent branch using the new child branch API
  loadChildBranches(parentBranchId: string) {
    const parentBranchIdNum = parseInt(parentBranchId, 10);
    if (isNaN(parentBranchIdNum)) {
      console.error('Invalid parent branch ID:', parentBranchId);
      return;
    }

    // Set loading state
    this.loadingMembers['children_' + parentBranchId] = true;

    // Get parent branch to inherit coordinator
    const parentBranch = this.branches.find(b => b.id === parentBranchId);
    const parentCoordinator = parentBranch?.coordinatorName || 'Not specified';

    this.childBranchService.getChildBranchesByParent(parentBranchIdNum).subscribe({
      next: (childBranches: ChildBranch[]) => {
        // Convert child branches to ChildBranchData format
        // Coordinator is inherited from parent, so use parent's coordinator
        const children: ChildBranchData[] = childBranches.map((child: ChildBranch) => ({
          id: child.id?.toString() || '',
          branchName: child.name || 'Unnamed Branch',
          coordinatorName: child.coordinator_name || parentCoordinator, // Inherit from parent if not set
          state: child.state?.name || '',
          city: child.city?.name || '',
          establishedOn: child.established_on ? new Date(child.established_on) : new Date(child.created_on || Date.now()),
          ashramArea: child.aashram_area ? `${child.aashram_area} sq km` : '0 sq km',
          members: child.members || child.branch_members || [],
          parentBranchId: child.parent_branch_id
        }));

        // Update the parent branch's children
        if (parentBranch) {
          parentBranch.children = children;
          parentBranch.isParent = children.length > 0;
        }

        this.loadingMembers['children_' + parentBranchId] = false;
        this.membersLoaded['children_' + parentBranchId] = true;
      },
      error: (error) => {
        console.error('Error loading child branches:', error);
        this.loadingMembers['children_' + parentBranchId] = false;
        this.membersLoaded['children_' + parentBranchId] = true;

        // Set empty array on error
        if (parentBranch) {
          parentBranch.children = [];
          parentBranch.isParent = false;
        }
      }
    });
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

  // Load child branch members using unified API (all members in one table)
  loadChildBranchMembers(childBranchId: string) {
    const childBranchIdNum = parseInt(childBranchId, 10);
    if (isNaN(childBranchIdNum)) {
      console.error('Invalid child branch ID:', childBranchId);
      return;
    }

    this.loadingMembers[childBranchId] = true;
    // Use unified service - works for both parent and child branches
    this.locationService.getBranchMembers(childBranchIdNum).subscribe({
      next: (members: any[]) => {
        // Map API response to unified member structure
        const mappedMembers: ChildBranchMember[] = members.map(member => ({
          id: member.id,
          branch_id: member.branch_id || childBranchIdNum,
          member_type: member.member_type || '',
          name: member.name || '',
          branch_role: member.branch_role || '',
          responsibility: member.responsibility || '',
          age: member.age || 0,
          date_of_samarpan: member.date_of_samarpan || '',
          qualification: member.qualification || '',
          date_of_birth: member.date_of_birth || '',
          created_on: member.created_on,
          updated_on: member.updated_on,
          created_by: member.created_by,
          updated_by: member.updated_by
        }));

        // Find and update the child branch's members
        for (const branch of this.branches) {
          if (branch.children) {
            const childBranch = branch.children.find(c => c.id === childBranchId);
            if (childBranch) {
              childBranch.members = mappedMembers;
              break;
            }
          }
        }
        this.loadingMembers[childBranchId] = false;
        this.membersLoaded[childBranchId] = true;
      },
      error: (error) => {
        console.error('Error loading child branch members:', error);
        this.loadingMembers[childBranchId] = false;
        this.membersLoaded[childBranchId] = true;
      }
    });
  }

  // Add new branch
  addBranch() {
    this.router.navigate(['/branch/add']);
  }

  // Add child branch - navigate to add child branch page
  addChildBranch(parentBranchId: string) {
    this.router.navigate(['/branch/child-branch/add', parentBranchId]);
  }

  // Add member to branch (works for both parent and child branches)
  addBranchMember(branchId: string) {
    this.router.navigate(['/branch', branchId, 'members', 'add']);
  }

  // Add member to child branch (now uses same route as parent branches)
  addChildBranchMember(childBranchId: string) {
    this.router.navigate(['/branch', childBranchId, 'members', 'add']);
  }

  // Download branch details
  downloadBranch(branchId: string): void {
    if (!branchId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Branch ID is required for download',
        life: 3000
      });
      return;
    }

    const branchIdNum = parseInt(branchId, 10);
    if (isNaN(branchIdNum)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid branch ID',
        life: 3000
      });
      return;
    }

    // TODO: Implement download service call when backend API is ready
    // For now, show a message
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: `Download functionality for branch will be available soon`,
      life: 3000
    });

    // When backend is ready, uncomment and use:
    /*
    const downloadObservable = isChildBranch
      ? this.childBranchService.downloadChildBranch(branchIdNum)
      : this.locationService.downloadBranch(branchIdNum);

    downloadObservable.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${isChildBranch ? 'child_' : ''}branch_${branchId}_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${isChildBranch ? 'Child branch' : 'Branch'} downloaded successfully`,
          life: 3000
        });
      },
      error: (error) => {
        console.error('Error downloading branch:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to download branch',
          life: 5000
        });
      }
    });
    */
  }

  // Open branch gallery
  openBranchGallery(branchId: string): void {
    if (!branchId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Branch ID is required for gallery',
        life: 3000
      });
      return;
    }

    // Navigate to gallery with branch ID (child branch status determined automatically)
    this.router.navigate(['/branch/gallery'], {
      queryParams: {
        branchId: branchId
      }
    });
  }

  // View branch - check if it's a child branch by checking parent_branch_id
  viewBranch(branchId: string) {
    // Check if it's a child branch by looking for it in children arrays
    let isChildBranch = false;
    for (const branch of this.branches) {
      if (branch.children) {
        const childBranch = branch.children.find(c => c.id === branchId);
        if (childBranch) {
          isChildBranch = true;
          break;
        }
      }
    }

    if (isChildBranch) {
      // Navigate to child branch view
      this.router.navigate(['/branch/child-branch/view', branchId]);
    } else {
      // If not a child branch, navigate to regular branch view
      this.router.navigate(['/branch/view', branchId]);
    }
  }

  // Edit branch - check if it's a child branch or parent branch
  editBranch(branchId: string) {
    // Check if it's a child branch
    let isChildBranch = false;
    for (const branch of this.branches) {
      if (branch.children) {
        const childBranch = branch.children.find(c => c.id === branchId);
        if (childBranch) {
          isChildBranch = true;
          // Navigate to child branch edit
          this.router.navigate(['/branch/child-branch/edit', branchId]);
          return;
        }
      }
    }
    // If not a child branch, navigate to regular branch edit
    this.router.navigate(['/branch/edit', branchId]);
  }

  // Delete branch
  deleteBranch(branchId: string) {
    const branchIdNum = parseInt(branchId, 10);
    if (isNaN(branchIdNum)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid branch ID' });
      return;
    }

    // Find the branch to get its name
    let branchName = 'this branch';
    for (const branch of this.branches) {
      if (branch.id === branchId) {
        branchName = branch.branchName;
        break;
      }
      // Also check in children
      if (branch.children) {
        const childBranch = branch.children.find(c => c.id === branchId);
        if (childBranch) {
          branchName = childBranch.branchName;
          break;
        }
      }
    }

    // Check if it's a child branch
    let isChildBranch = false;
    for (const branch of this.branches) {
      if (branch.children) {
        const childBranch = branch.children.find(c => c.id === branchId);
        if (childBranch) {
          isChildBranch = true;
          break;
        }
      }
    }

    // Confirm deletion
    this.confirmationDialog.confirmDelete({
      title: isChildBranch ? 'Delete Child Branch' : 'Delete Branch',
      text: `Are you sure you want to delete "${branchName}"? This action cannot be undone and will remove all associated data.`,
      successTitle: isChildBranch ? 'Child Branch Deleted' : 'Branch Deleted',
      successText: `${isChildBranch ? 'Child branch' : 'Branch'} deleted successfully`,
      showSuccessMessage: false // We'll use PrimeNG message service instead
    }).then((result) => {
      if (result.value) {
        this.loading = true;

        // Use appropriate service based on branch type
        const deleteObservable = isChildBranch
          ? this.childBranchService.deleteChildBranch(branchIdNum)
          : this.locationService.deleteBranch(branchIdNum);

        deleteObservable.subscribe({
          next: () => {
            this.loading = false; // Set loading to false first
            
            // Manually remove the branch from the array first (for both parent and child branches)
            if (isChildBranch) {
              // Remove from children list
              for (const branch of this.branches) {
                if (branch.children) {
                  const index = branch.children.findIndex(c => c.id === branchId);
                  if (index !== -1) {
                    branch.children.splice(index, 1);
                    branch.isParent = branch.children.length > 0;
                    break;
                  }
                }
              }
            } else {
              // Remove parent branch from main array
              const branchIndex = this.branches.findIndex(b => b.id === branchId);
              if (branchIndex !== -1) {
                this.branches.splice(branchIndex, 1);
              }
            }
            
            // Show success toast message
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `${isChildBranch ? 'Child branch' : 'Branch'} "${branchName}" deleted successfully`,
              life: 3000 // Ensure toast shows for 3 seconds
            });

            // Delay reload to allow toast to appear and be visible for at least 2 seconds
            setTimeout(() => {
              this.loadBranches();
            }, 2000);
          },
          error: (error) => {
            console.error('Error deleting branch:', error);
            let errorMessage = `Failed to delete ${isChildBranch ? 'child branch' : 'branch'}. Please try again.`;
            if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000
            });
            this.loading = false;
          }
        });
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

  // Action menu methods
  toggleActionMenu(branchId: string): void {
    this.openActionMenu = this.openActionMenu === branchId ? null : branchId;
  }

  closeActionMenu(): void {
    this.openActionMenu = null;
  }

  isActionMenuOpen(branchId: string): boolean {
    return this.openActionMenu === branchId;
  }

  // Close dropdown when clicking outside
  // View branch members
  viewBranchMembers(branchId: string): void {
    this.selectedBranchId = branchId;
    this.openMembersDrawer();
    this.loadMembersForDrawer(branchId);
  }

  // Load members for drawer
  loadMembersForDrawer(branchId: string): void {
    const branchIdNum = parseInt(branchId, 10);
    if (isNaN(branchIdNum)) {
      console.error('Invalid branch ID:', branchId);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid branch ID',
        life: 3000
      });
      return;
    }

    this.loadingMembers[branchId] = true;
    this.locationService.getBranchMembers(branchIdNum).subscribe({
      next: (members: any[]) => {
        // Map API response to component member structure
        this.selectedBranchMembers = (members || []).map(member => ({
          name: member.name || '',
          member_type: member.member_type || '',
          branch_role: member.branch_role || '',
          responsibility: member.responsibility || '',
          age: member.age || 0,
          qualification: member.qualification || '',
          date_of_samarpan: member.date_of_samarpan ? new Date(member.date_of_samarpan).toLocaleDateString() : '',
          date_of_birth: member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : ''
        }));
        this.loadingMembers[branchId] = false;
      },
      error: (error) => {
        console.error('Error loading branch members:', error);
        this.loadingMembers[branchId] = false;
        this.selectedBranchMembers = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to load members',
          life: 5000
        });
      }
    });
  }

  // Open Members Drawer
  openMembersDrawer(): void {
    this.isMembersDrawerOpen = true;
    this.lockBodyScroll();

    // Force change detection to render the drawer
    setTimeout(() => {
      const drawer = document.querySelector('.volunteer-drawer') as HTMLElement;
      const backdrop = document.querySelector('.volunteer-drawer-backdrop') as HTMLElement;

      if (drawer && backdrop) {
        // Move to body if not already there
        if (drawer.parentElement && drawer.parentElement !== document.body) {
          document.body.appendChild(drawer);
        }
        if (backdrop.parentElement && backdrop.parentElement !== document.body) {
          document.body.appendChild(backdrop);
        }
        // Ensure show class is applied
        drawer.classList.add('show');
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-labelledby', 'membersDrawerTitle');
        drawer.removeAttribute('aria-hidden');
        backdrop.classList.add('show');
      }
    }, 100);
  }

  // Close Members Drawer
  closeMembersDrawer(): void {
    const drawers = document.querySelectorAll('.volunteer-drawer');
    const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
    const drawer = Array.from(drawers).find(d => d.querySelector('#membersDrawerTitle'));
    const backdrop = backdrops[0];

    if (drawer) {
      drawer.classList.remove('show');
    }
    if (backdrop) {
      backdrop.classList.remove('show');
    }

    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.isMembersDrawerOpen = false;
      this.selectedBranchId = null;
      this.selectedBranchMembers = [];
      this.unlockBodyScroll();

      // Remove accessibility attributes when closing
      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        const focusedElement = drawer.querySelector(':focus');
        if (focusedElement) {
          (focusedElement as HTMLElement).blur();
        }
      }
    }, 300);
  }

  // Lock body scroll when drawer is open
  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  // Unlock body scroll when drawer is closed
  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event | null): void {
    // Check if event exists and has target
    if (!event || !event.target) {
      return;
    }

    const target = event.target as HTMLElement;

    // Close action menu if clicking outside
    if (!target.closest('.action-menu-container')) {
      this.closeActionMenu();
    }
  }

  /**
   * Export branches to Excel based on current filters
   */
  exportBranchesToExcel(): void {
    this.exporting = true;

    // Use current search filter
    const searchTerm = this.globalFilterValue?.trim() || '';

    this.locationService.exportBranchesToExcel(searchTerm).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        let filename = 'branches_export';
        if (searchTerm) {
          filename = `branches_${searchTerm.replace(/[^a-z0-9]/gi, '_')}`;
        }
        filename += '.xlsx';
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Branches exported to Excel successfully',
          life: 3000
        });
        this.exporting = false;
      },
      error: (error) => {
        console.error('Error exporting branches:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to export branches to Excel',
          life: 5000
        });
        this.exporting = false;
      }
    });
  }
}
