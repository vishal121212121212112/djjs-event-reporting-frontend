import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChildBranchService, ChildBranch, ChildBranchMember } from 'src/app/core/services/child-branch.service';
import { LocationService, Branch } from 'src/app/core/services/location.service';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';

@Component({
  selector: 'app-view-child-branch',
  templateUrl: './view-child-branch.component.html',
  styleUrls: ['./view-child-branch.component.scss']
})
export class ViewChildBranchComponent implements OnInit {
  childBranchId: number | null = null;
  childBranch: ChildBranch | null = null;
  parentBranch: Branch | null = null;
  loading: boolean = false;
  activeTab: 'details' | 'members' = 'details';
  members: ChildBranchMember[] = [];
  loadingMembers: boolean = false;

  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private childBranchService: ChildBranchService,
    private locationService: LocationService,
    private messageService: MessageService,
    private confirmationDialog: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.childBranchId = parseInt(idParam, 10);
      if (isNaN(this.childBranchId)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid child branch ID' });
        this.router.navigate(['/branch']);
        return;
      }
      this.loadChildBranch();
    } else {
      this.router.navigate(['/branch']);
    }

    this.breadCrumbItems = [
      { label: 'Branches', routerLink: '/branch' },
      { label: 'Child Branch Details', active: true }
    ];
  }

  loadChildBranch() {
    if (!this.childBranchId) return;
    this.loading = true;

    this.childBranchService.getChildBranchById(this.childBranchId).subscribe({
      next: (childBranch) => {
        this.childBranch = childBranch;
        this.loading = false;

        if (childBranch.parent_branch_id) {
          this.locationService.getBranchById(childBranch.parent_branch_id).subscribe({
            next: (parent) => {
              this.parentBranch = parent;
            },
            error: (error) => console.error('Error loading parent branch:', error)
          });
        }

                this.breadCrumbItems = [
          { label: 'Branches', routerLink: '/branch' },
          { label: childBranch.name || 'Child Branch Details', active: true }
        ];

        // Load members
        this.loadMembers();
      },
      error: (error) => {
        console.error('Error loading child branch:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load child branch' });
        this.loading = false;
        this.router.navigate(['/branch']);
      }
    });
  }

  setActiveTab(tab: 'details' | 'members') {
    this.activeTab = tab;
  }

  editChildBranch() {
    if (this.childBranchId) {
      this.router.navigate(['/branch/child-branch/edit', this.childBranchId]);
    }
  }

  deleteChildBranch() {
    if (!this.childBranchId) return;

    const branchName = this.childBranch?.name || 'this child branch';

    this.confirmationDialog.confirmDelete({
      title: 'Delete Child Branch',
      text: `Are you sure you want to delete "${branchName}"? This action cannot be undone.`,
      successTitle: 'Child Branch Deleted',
      successText: 'Child branch deleted successfully',
      showSuccessMessage: false
    }).then((result) => {
      if (result.value) {
        this.childBranchService.deleteChildBranch(this.childBranchId!).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Child branch deleted successfully',
              life: 3000
            });
            setTimeout(() => this.router.navigate(['/branch']), 1500);
          },
          error: (error) => {
            console.error('Error deleting child branch:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'Failed to delete child branch',
              life: 5000
            });
          }
        });
      }
    });
  }

  loadMembers() {
    if (!this.childBranchId) return;

    this.loadingMembers = true;
    this.childBranchService.getChildBranchMembers(this.childBranchId).subscribe({
      next: (members) => {
        this.members = members;
        this.loadingMembers = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.loadingMembers = false;
        this.members = [];
      }
    });
  }

  addMember() {
    if (this.childBranchId) {
      this.router.navigate(['/branch/child-branch', this.childBranchId.toString(), 'members', 'add']);
    }
  }

  deleteMember(memberId: number) {
    if (!memberId) return;

    const member = this.members.find(m => m.id === memberId);
    const memberName = member?.name || 'this member';

    this.confirmationDialog.confirmDelete({
      title: 'Delete Member',
      text: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
      successTitle: 'Member Deleted',
      successText: 'Member deleted successfully',
      showSuccessMessage: false
    }).then((result) => {
      if (result.value) {
        this.childBranchService.deleteChildBranchMember(memberId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Member deleted successfully'
            });
            this.loadMembers(); // Reload members list
          },
          error: (error) => {
            console.error('Error deleting member:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete member'
            });
          }
        });
      }
    });
  }
}

