import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService, Branch } from 'src/app/core/services/location.service';
import { ChildBranchService, ChildBranchMember, ChildBranch } from 'src/app/core/services/child-branch.service';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface UnifiedMember {
  id: number;
  name: string;
  member_type: string;
  branch_role?: string;
  responsibility?: string;
  age?: number;
  date_of_samarpan?: string;
  qualification?: string;
  date_of_birth?: string;
  branch_id?: number;
  child_branch_id?: number;
  branch_name?: string;
  child_branch_name?: string;
  branch_type: 'branch' | 'child_branch';
}

@Component({
  selector: 'app-all-members',
  templateUrl: './all-members.component.html',
  styleUrls: ['./all-members.component.scss']
})
export class AllMembersComponent implements OnInit {
  members: UnifiedMember[] = [];
  loading: boolean = false;
  filteredMembers: UnifiedMember[] = [];
  activeMemberType: 'all' | 'preacher' | 'samarpit' = 'all';
  activeBranchType: 'all' | 'branch' | 'child_branch' = 'all';
  searchTerm: string = '';
  breadCrumbItems: Array<{}> = [];

  // Add Member Modal
  showAddMemberModal: boolean = false;
  memberForm: FormGroup;
  isSubmitting: boolean = false;
  branches: Branch[] = [];
  childBranches: ChildBranch[] = [];
  allBranches: Array<{id: number, name: string, isChildBranch: boolean}> = []; // Combined list of all branches
  maxDateOfBirth: string = '';

  // Edit Member Modal
  showEditMemberModal: boolean = false;
  editMemberForm: FormGroup;
  editingMember: UnifiedMember | null = null;
  isUpdating: boolean = false;

  // Export state
  exporting: boolean = false;

  constructor(
    private locationService: LocationService,
    private childBranchService: ChildBranchService,
    private router: Router,
    private messageService: MessageService,
    private confirmationDialog: ConfirmationDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.memberForm = this.fb.group({
      branch_id: [null], // Optional field - not mandatory
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      member_type: ['', Validators.required],
      branch_role: ['', Validators.required],
      responsibility: [''],
      age: ['', [Validators.min(1), Validators.max(120)]],
      qualification: [''],
      date_of_birth: [''],
      date_of_samarpan: ['']
    });

    // Edit Member Form
    this.editMemberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      member_type: ['', Validators.required],
      branch_role: ['', Validators.required],
      responsibility: [''],
      age: ['', [Validators.min(1), Validators.max(120)]],
      qualification: [''],
      date_of_birth: [''],
      date_of_samarpan: ['']
    });

    // Set max date for date of birth (today)
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    this.maxDateOfBirth = today.toISOString().split('T')[0];

    // No need for branch_type watcher - all branches use the same branch_id field
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Members', routerLink: '/branch/members' },
      { label: 'All Members', active: true }
    ];
    this.loadAllMembers();
    this.loadBranches();
    this.loadChildBranches();
  }

  loadBranches() {
    // Load all branches (parent and child) and combine them
    forkJoin({
      branches: this.locationService.getAllBranches().pipe(catchError(() => of([]))),
      childBranches: this.childBranchService.getAllChildBranches().pipe(catchError(() => of([])))
    }).subscribe({
      next: (result) => {
        this.branches = result.branches || [];
        this.childBranches = result.childBranches || [];
        
        // Combine all branches into a single list for the dropdown
        this.allBranches = [
          // Parent branches (no parent_branch_id)
          ...(this.branches
            .filter(b => !b.parent_branch_id && b.id)
            .map(b => ({ id: b.id!, name: b.name, isChildBranch: false }))),
          // Child branches (have parent_branch_id)
          ...(this.childBranches
            .filter(b => b.id)
            .map(b => ({ id: b.id!, name: b.name, isChildBranch: true })))
        ].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
      },
      error: (error) => {
        console.error('Error loading branches:', error);
      }
    });
  }

  loadChildBranches() {
    // This method is kept for backward compatibility but loadBranches now handles both
  }

  loadAllMembers() {
    this.loading = true;
    this.members = [];
    this.filteredMembers = [];

    // Fetch all members from unified table (includes both parent and child branch members)
    // The backend returns all members with their branch information, including parent_branch_id
    this.locationService.getAllBranchMembers().pipe(
      map((members: any[]) => {
        // Map all members - determine if parent or child branch based on branch.parent_branch_id
        return members.map(member => {
          const isChildBranch = member.branch?.parent_branch_id != null;
          const branchType: 'branch' | 'child_branch' = isChildBranch ? 'child_branch' : 'branch';
          return {
            id: member.id,
            name: member.name || '',
            member_type: member.member_type || '',
            branch_role: member.branch_role || '',
            responsibility: member.responsibility || '',
            age: member.age || 0,
            date_of_samarpan: member.date_of_samarpan || '',
            qualification: member.qualification || '',
            date_of_birth: member.date_of_birth || '',
            branch_id: member.branch_id,
            child_branch_id: isChildBranch ? member.branch_id : undefined, // For backward compatibility
            branch_name: member.branch?.name || 'N/A',
            child_branch_name: isChildBranch ? (member.branch?.name || 'N/A') : undefined,
            branch_type: branchType
          };
        });
      }),
      catchError(error => {
        console.error('Error loading all members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load members. Please try again.',
          life: 3000
        });
        return of([]);
      })
    ).subscribe({
      next: (allMembers) => {
        this.members = allMembers;
        this.filteredMembers = allMembers;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error in loadAllMembers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load members. Please try again.',
          life: 5000
        });
        this.loading = false;
        this.members = [];
        this.filteredMembers = [];
      }
    });
  }

  filterByType(type: 'all' | 'preacher' | 'samarpit') {
    this.activeMemberType = type;
    this.applyFilters();
  }

  filterByBranchType(type: 'all' | 'branch' | 'child_branch') {
    this.activeBranchType = type;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.members];

    // Filter by member type
    if (this.activeMemberType !== 'all') {
      filtered = filtered.filter(m => m.member_type === this.activeMemberType);
    }

    // Filter by branch type
    if (this.activeBranchType !== 'all') {
      filtered = filtered.filter(m => m.branch_type === this.activeBranchType);
    }

    // Filter by search term
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        (m.branch_role && m.branch_role.toLowerCase().includes(searchLower)) ||
        (m.responsibility && m.responsibility.toLowerCase().includes(searchLower)) ||
        (m.branch_name && m.branch_name.toLowerCase().includes(searchLower)) ||
        (m.child_branch_name && m.child_branch_name.toLowerCase().includes(searchLower))
      );
    }

    this.filteredMembers = filtered;
  }

  viewMember(member: UnifiedMember) {
    // All members use branch_id (unified table)
    if (member.branch_id) {
      // Check if it's a child branch to determine the correct route
      const isChildBranch = member.branch_type === 'child_branch';
      if (isChildBranch) {
        this.router.navigate(['/branch/child-branch/view', member.branch_id.toString()]);
      } else {
        this.router.navigate(['/branch', member.branch_id.toString(), 'members', member.id.toString()]);
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Cannot view member. Branch information is missing.',
        life: 3000
      });
    }
  }

  openEditMemberModal(member: UnifiedMember) {
    this.editingMember = member;
    
    // Format dates for input fields
    const formatDate = (dateStr: string | undefined): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    this.editMemberForm.patchValue({
      name: member.name || '',
      member_type: member.member_type || '',
      branch_role: member.branch_role || '',
      responsibility: member.responsibility || '',
      age: member.age || '',
      qualification: member.qualification || '',
      date_of_birth: formatDate(member.date_of_birth),
      date_of_samarpan: formatDate(member.date_of_samarpan)
    });

    this.showEditMemberModal = true;
  }

  closeEditMemberModal() {
    this.showEditMemberModal = false;
    this.editingMember = null;
    this.editMemberForm.reset();
  }

  updateMember() {
    if (!this.editingMember || !this.editMemberForm.valid) {
      Object.keys(this.editMemberForm.controls).forEach(key => {
        const control = this.editMemberForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.',
        life: 3000
      });
      return;
    }

    this.isUpdating = true;
    const formValue = this.editMemberForm.value;

    const memberPayload = {
      name: formValue.name.trim(),
      member_type: formValue.member_type,
      branch_role: formValue.branch_role || '',
      responsibility: formValue.responsibility || '',
      age: formValue.age ? parseInt(formValue.age, 10) : 0,
      qualification: formValue.qualification || '',
      date_of_birth: formValue.date_of_birth || null,
      date_of_samarpan: formValue.date_of_samarpan || null
    };

    // Use unified service - all members stored in one table with branch_id
    this.locationService.updateBranchMember(this.editingMember.id, memberPayload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Member updated successfully!',
          life: 3000
        });
        this.isUpdating = false;
        this.closeEditMemberModal();
        this.loadAllMembers();
      },
      error: (error) => {
        console.error('Error updating member:', error);
        let errorMessage = 'Failed to update member. Please try again.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
        this.isUpdating = false;
      }
    });
  }

  deleteMember(member: UnifiedMember) {
    if (!member.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Member ID is missing. Cannot delete member.'
      });
      return;
    }

    const memberName = member.name || 'this member';

    this.confirmationDialog.confirmDelete({
      title: 'Delete Member',
      text: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
      successTitle: 'Member Deleted',
      successText: `Member "${memberName}" deleted successfully`,
      showSuccessMessage: false
    }).then((result) => {
      if (result.value) {
        // Use unified service - works for both parent and child branches (all in one table)
        const deleteRequest = this.locationService.deleteBranchMember(member.id);

        deleteRequest.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Member "${memberName}" deleted successfully`,
              life: 3000
            });
            this.loadAllMembers();
          },
          error: (error) => {
            console.error('Error deleting member:', error);
            let errorMessage = 'Failed to delete member. Please try again.';

            if (error.error) {
              if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.error) {
                errorMessage = error.error.error;
              } else if (typeof error.error === 'string') {
                errorMessage = error.error;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }

            if (error.status === 404) {
              errorMessage = 'Member not found. It may have been already deleted.';
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to delete this member.';
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000
            });
          }
        });
      }
    });
  }

  get preacherCount(): number {
    return this.members.filter(m => m.member_type === 'preacher').length;
  }

  get samarpitCount(): number {
    return this.members.filter(m => m.member_type === 'samarpit').length;
  }

  get branchCount(): number {
    return this.members.filter(m => m.branch_type === 'branch').length;
  }

  get childBranchCount(): number {
    return this.members.filter(m => m.branch_type === 'child_branch').length;
  }

  openAddMemberModal() {
    this.memberForm.reset({
      branch_id: null,
      name: '',
      member_type: '',
      branch_role: '',
      responsibility: '',
      age: '',
      qualification: '',
      date_of_birth: '',
      date_of_samarpan: ''
    });
    this.showAddMemberModal = true;
  }

  closeAddMemberModal() {
    this.showAddMemberModal = false;
    this.memberForm.reset({
      branch_id: null
    });
  }

  onSubmitMember() {
    if (!this.memberForm.valid) {
      Object.keys(this.memberForm.controls).forEach(key => {
        const control = this.memberForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.',
        life: 3000
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.memberForm.value;
    // Use unified service - all members stored in one table with branch_id
    // Branch is optional, so we allow null/undefined
    const branchId = formValue.branch_id 
      ? (typeof formValue.branch_id === 'string' 
          ? parseInt(formValue.branch_id, 10) 
          : (typeof formValue.branch_id === 'number' ? formValue.branch_id : null))
      : null;
    
    // Validate branchId only if provided (not mandatory)
    if (formValue.branch_id && (!branchId || isNaN(branchId))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a valid branch.',
        life: 3000
      });
      this.isSubmitting = false;
      return;
    }

    const memberPayload = {
      branch_id: branchId || null, // Allow null - branch is optional
      name: formValue.name.trim(),
      member_type: formValue.member_type,
      branch_role: formValue.branch_role || '',
      responsibility: formValue.responsibility || '',
      age: formValue.age ? parseInt(formValue.age, 10) : 0,
      qualification: formValue.qualification || '',
      date_of_birth: formValue.date_of_birth || null,
      date_of_samarpan: formValue.date_of_samarpan || null
    };

    // Use unified service - works for both parent and child branches (all in one table)
    this.locationService.createBranchMember(memberPayload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Member added successfully!',
          life: 3000
        });
        this.isSubmitting = false;
        this.closeAddMemberModal();
        this.loadAllMembers();
      },
      error: (error) => {
        console.error('Error creating member:', error);
        let errorMessage = 'Failed to add member. Please try again.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Export members to Excel based on current filters
   */
  exportMembersToExcel(): void {
    this.exporting = true;

    // Use current filters
    const searchTerm = this.searchTerm?.trim() || '';
    const memberType = this.activeMemberType !== 'all' ? this.activeMemberType : undefined;
    const branchType = this.activeBranchType !== 'all' ? this.activeBranchType : undefined;

    this.locationService.exportMembersToExcel(searchTerm, memberType, branchType).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        let filename = 'members_export';
        if (searchTerm) {
          filename = `members_${searchTerm.replace(/[^a-z0-9]/gi, '_')}`;
        }
        if (memberType) {
          filename += `_${memberType}`;
        }
        if (branchType) {
          filename += `_${branchType}`;
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
          detail: 'Members exported to Excel successfully',
          life: 3000
        });
        this.exporting = false;
      },
      error: (error) => {
        console.error('Error exporting members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to export members to Excel',
          life: 5000
        });
        this.exporting = false;
      }
    });
  }
}

