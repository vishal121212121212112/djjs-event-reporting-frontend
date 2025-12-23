import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/core/services/location.service';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { BranchMember } from '../branch-members-list/branch-members-list.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-view-member',
  templateUrl: './view-member.component.html',
  styleUrls: ['./view-member.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ViewMemberComponent implements OnInit {
  branchId: number | null = null;
  memberId: number | null = null;
  member: BranchMember | null = null;
  loading: boolean = false;
  branchName: string = '';

  // Breadcrumb items
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private messageService: MessageService,
    private confirmationDialog: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    // Get IDs from route - check both parent and child routes
    const branchIdParam = this.route.snapshot.paramMap.get('branchId') ||
                         this.route.parent?.snapshot.paramMap.get('id');
    const memberIdParam = this.route.snapshot.paramMap.get('memberId');

    if (branchIdParam) {
      this.branchId = parseInt(branchIdParam, 10);
    }

    if (memberIdParam && memberIdParam !== 'add') {
      this.memberId = parseInt(memberIdParam, 10);
      this.loadMember();
    }

    // Load branch name for breadcrumb
    if (this.branchId) {
      this.loadBranchName();
    }

    // Set breadcrumbs (will be updated after loading)
    this.breadCrumbItems = [
      { label: 'Branches', routerLink: '/branch' },
      { label: 'Branch Details', routerLink: this.branchId ? ['/branch/view', this.branchId.toString()] : '/branch' },
      { label: this.memberId ? 'Member Details' : 'Add Member', active: true }
    ];
  }

  loadBranchName() {
    if (!this.branchId) return;

    this.locationService.getBranchById(this.branchId).subscribe({
      next: (branch) => {
        this.branchName = branch.name;
        this.updateBreadcrumbs();
      },
      error: (error) => {
        console.error('Error loading branch:', error);
      }
    });
  }

  loadMember() {
    if (!this.memberId) return;

    this.loading = true;
    // Since we don't have a get member by ID endpoint, we'll get all members and find the one
    if (this.branchId) {
      this.locationService.getBranchMembers(this.branchId).subscribe({
        next: (members: any[]) => {
          this.member = members.find(m => m.id === this.memberId) || null;
          this.loading = false;
          if (this.member) {
            this.updateBreadcrumbs();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Member not found'
            });
            this.goBack();
          }
        },
        error: (error) => {
          console.error('Error loading member:', error);
          let errorMessage = 'Failed to load member details. Please try again.';

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
            errorMessage = 'Member not found. It may have been deleted.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to view this member.';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
          });
          this.loading = false;
          setTimeout(() => {
            this.goBack();
          }, 2000);
        }
      });
    }
  }

  updateBreadcrumbs() {
    if (this.branchId) {
      if (this.member) {
        // Member is loaded, show member name
        this.breadCrumbItems = [
          { label: 'Branches', routerLink: '/branch' },
          { label: this.branchName || 'Branch', routerLink: ['/branch/view', this.branchId.toString()] },
          { label: this.member.name, active: true }
        ];
      } else if (this.branchName) {
        // Branch name is loaded but member is not yet loaded
        this.breadCrumbItems = [
          { label: 'Branches', routerLink: '/branch' },
          { label: this.branchName, routerLink: ['/branch/view', this.branchId.toString()] },
          { label: 'Member Details', active: true }
        ];
      }
    }
  }

  editMember() {
    if (this.branchId && this.memberId) {
      // Navigate to edit branch page with member tab active
      this.router.navigate(['/branch/edit', this.branchId.toString()]);
    }
  }

  deleteMember() {
    if (!this.memberId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Member ID is missing. Cannot delete member.'
      });
      return;
    }

    const memberName = this.member ? this.member.name : 'this member';

    this.confirmationDialog.confirmDelete({
      title: 'Delete Member',
      text: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
      successTitle: 'Member Deleted',
      successText: `Member "${memberName}" deleted successfully`,
      showSuccessMessage: false // We'll use PrimeNG message service instead
    }).then((result) => {
      if (result.value) {
        this.locationService.deleteBranchMember(this.memberId!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Member "${memberName}" deleted successfully`,
              life: 3000
            });
            setTimeout(() => {
              this.goBack();
            }, 1500);
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

  goBack() {
    if (this.branchId) {
      this.router.navigate(['/branch/view', this.branchId.toString()]);
    } else {
      this.router.navigate(['/branch']);
    }
  }
}

