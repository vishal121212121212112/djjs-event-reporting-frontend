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

  users: any[] = [];
  expandedRows: { [key: string]: boolean } = {};
  loading: boolean = false;

  // Pagination & Filters
  first = 0;
  rows = 10;
  rowsPerPageOptions = [5, 10, 20, 50];
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

  // Dummy data for testing
  this.users = [
    {
      id: '1',
      branchEmail: 'delhi.admin@example.com',
      name: 'Sunita Verma',
      type: 'Admin',
      createdBy: 'System',
      updatedBy: 'System',
      details: {
        phone: '9876543210',
        address: 'Delhi Ashram, New Delhi',
        joiningDate: '2015-06-10'
      }
    },
    {
      id: '2',
      branchEmail: 'mumbai.assist@example.com',
      name: 'Rajesh Kumar',
      type: 'Assistant',
      createdBy: 'Sunita Verma',
      updatedBy: 'Sunita Verma',
      details: {
        phone: '9123456780',
        address: 'Mumbai Center, Mumbai',
        joiningDate: '2018-03-15'
      }
    },
    {
      id: '3',
      branchEmail: 'chennai.admin@example.com',
      name: 'Anita Sharma',
      type: 'Admin',
      createdBy: 'System',
      updatedBy: 'System',
      details: {
        phone: '9988776655',
        address: 'Chennai Ashram, Chennai',
        joiningDate: '2020-01-20'
      }
    }
  ];

  this.expandedRows = {};
}


  // Fetch users from backend (optionally can pass filters, pagination)
  fetchUsers(sortField?: string, sortOrder?: number) {
    this.loading = true;
    // For demo, ignoring filters & sort. Implement backend API accordingly.
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
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
    this.rows = event.rows;
    this.fetchUsers();
  }

  // Sorting
  onSort(event: any) {
    const { field, order } = event;
    this.fetchUsers(field, order);
  }

  // Apply global + per-column filter
  applyFilter() {
    this.globalFilterValue = Object.values(this.filters).filter(Boolean).join(' ');
    this.first = 0;
    this.fetchUsers();
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
