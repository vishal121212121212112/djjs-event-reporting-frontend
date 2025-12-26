import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/core/services/location.service';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';

export interface BranchMember {
  id: number;
  name: string;
  member_type: string;
  branch_role?: string;
  responsibility?: string;
  age?: number;
  date_of_samarpan?: string;
  qualification?: string;
  date_of_birth?: string;
  branch_id: number;
}

@Component({
  selector: 'app-branch-members-list',
  templateUrl: './branch-members-list.component.html',
  styleUrls: ['./branch-members-list.component.scss']
})
export class BranchMembersListComponent implements OnInit {
  @Input() branchId: number | null = null;
  members: BranchMember[] = [];
  loading: boolean = false;
  filteredMembers: BranchMember[] = [];
  activeMemberType: 'all' | 'preacher' | 'samarpit' = 'all';

  constructor(
    private locationService: LocationService,
    private router: Router,
    private messageService: MessageService,
    private confirmationDialog: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    if (this.branchId) {
      this.loadMembers();
    }
  }

  loadMembers() {
    if (!this.branchId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Branch ID is missing. Cannot load members.'
      });
      return;
    }

    this.loading = true;
    this.locationService.getBranchMembers(this.branchId).subscribe({
      next: (members: any[]) => {
        // Ensure all members have the required properties
        this.members = (members || []).map((member: any) => ({
          id: member.id || member.ID || member.member_id,
          name: member.name || '',
          member_type: member.member_type || '',
          branch_role: member.branch_role || '',
          responsibility: member.responsibility || '',
          age: member.age || 0,
          date_of_samarpan: member.date_of_samarpan || '',
          qualification: member.qualification || '',
          date_of_birth: member.date_of_birth || '',
          branch_id: member.branch_id || this.branchId || 0
        }));
        this.filteredMembers = this.members;
        this.loading = false;
        
        console.log('Members loaded:', this.members);
      },
      error: (error) => {
        console.error('Error loading members:', error);
        let errorMessage = 'Failed to load members. Please try again.';

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

  filterByType(type: 'all' | 'preacher' | 'samarpit') {
    this.activeMemberType = type;
    if (type === 'all') {
      this.filteredMembers = this.members;
    } else {
      this.filteredMembers = this.members.filter(m => m.member_type === type);
    }
  }

  viewMember(memberId: number) {
    console.log('viewMember called', { branchId: this.branchId, memberId });
    
    if (!this.branchId) {
      console.error('Branch ID is missing');
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Branch ID is missing. Cannot view member.',
        life: 3000
      });
      return;
    }

    if (!memberId) {
      console.error('Member ID is missing');
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Member ID is missing. Cannot view member.',
        life: 3000
      });
      return;
    }

    const route = ['/branch', this.branchId.toString(), 'members', memberId.toString()];
    console.log('Navigating to:', route);
    
    this.router.navigate(route).then(
      (success) => {
        console.log('Navigation successful:', success);
      },
      (error) => {
        console.error('Navigation failed:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to navigate to member details. Please try again.',
          life: 3000
        });
      }
    );
  }

  addMember() {
    if (this.branchId) {
      this.router.navigate(['/branch', this.branchId.toString(), 'members', 'add']);
    }
  }

  editMember(memberId: number) {
    if (!this.branchId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Branch ID is missing. Cannot edit member.',
        life: 3000
      });
      return;
    }

    if (!memberId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Member ID is missing. Cannot edit member.',
        life: 3000
      });
      return;
    }

    // Navigate to edit branch page - the edit page should handle member editing
    this.router.navigate(['/branch/edit', this.branchId.toString()]);
  }

  deleteMember(memberId: number) {
    if (!memberId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Member ID is missing. Cannot delete member.'
      });
      return;
    }

    const member = this.members.find(m => m.id === memberId);
    const memberName = member ? member.name : 'this member';

    this.confirmationDialog.confirmDelete({
      title: 'Delete Member',
      text: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
      successTitle: 'Member Deleted',
      successText: `Member "${memberName}" deleted successfully`,
      showSuccessMessage: false // We'll use PrimeNG message service instead
    }).then((result) => {
      if (result.value) {
        this.locationService.deleteBranchMember(memberId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Member "${memberName}" deleted successfully`,
              life: 3000
            });
            this.loadMembers();
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

  // TrackBy function for ngFor loop to prevent unnecessary DOM re-renders
  trackByMemberId(index: number, member: BranchMember): number {
    return member.id;
  }
}

