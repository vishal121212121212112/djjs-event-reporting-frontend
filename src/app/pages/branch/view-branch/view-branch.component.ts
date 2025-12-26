import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService, Branch } from 'src/app/core/services/location.service';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-view-branch',
  templateUrl: './view-branch.component.html',
  styleUrls: ['./view-branch.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-10px)' }))
      ])
    ])
  ]
})
export class ViewBranchComponent implements OnInit {
  branchId: number | null = null;
  branch: Branch | null = null;
  loading: boolean = false;
  activeTab: 'details' | 'members' = 'details';
  completion: number = 0;
  circumference: number = 2 * Math.PI * 45; // radius = 45

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
    // Get branch ID from route
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.branchId = parseInt(idParam, 10);
      if (isNaN(this.branchId)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid branch ID'
        });
        this.router.navigate(['/branch']);
        return;
      }
      this.loadBranch();
    } else {
      this.router.navigate(['/branch']);
    }

    // Set breadcrumbs
    this.breadCrumbItems = [
      { label: 'Branches', routerLink: '/branch' },
      { label: 'Branch Details', active: true }
    ];
  }

  loadBranch() {
    if (!this.branchId) return;

    this.loading = true;
    console.log('Loading branch with ID:', this.branchId);
    this.locationService.getBranchById(this.branchId).subscribe({
      next: (branch) => {
        console.log('Branch loaded successfully:', branch);
        this.branch = branch;
        this.loading = false;
        // Update breadcrumb with branch name
        this.breadCrumbItems = [
          { label: 'Branches', routerLink: '/branch' },
          { label: branch.name || 'Branch Details', active: true }
        ];
        // Calculate completion percentage
        this.calculateCompletion();
        console.log('Branch completion:', this.completion);
      },
      error: (error) => {
        console.error('Error loading branch:', error);
        let errorMessage = 'Failed to load branch details. Please try again.';

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
          errorMessage = 'Branch not found. It may have been deleted.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view this branch.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/branch']);
        }, 2000);
      }
    });
  }

  calculateCompletion() {
    if (!this.branch) return;
    let filledFields = 0;
    const totalFields = 15; // Adjust based on your fields

    if (this.branch.name) filledFields++;
    if (this.branch.email) filledFields++;
    if (this.branch.contact_number) filledFields++;
    if (this.branch.coordinator_name) filledFields++;
    if (this.branch.established_on) filledFields++;
    if (this.branch.aashram_area) filledFields++;
    if (this.branch.country?.name) filledFields++;
    if (this.branch.state?.name) filledFields++;
    if (this.branch.city?.name) filledFields++;
    if (this.branch.address) filledFields++;
    if (this.branch.pincode) filledFields++;
    if (this.branch.post_office) filledFields++;
    if (this.branch.police_station) filledFields++;
    if (this.branch.open_days) filledFields++;

    this.completion = Math.round((filledFields / totalFields) * 100);
  }

  setActiveTab(tab: 'details' | 'members') {
    this.activeTab = tab;
  }

  editBranch() {
    if (this.branchId) {
      this.router.navigate(['/branch/edit', this.branchId]);
    }
  }

  deleteBranch() {
    if (!this.branchId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Branch ID is missing. Cannot delete branch.'
      });
      return;
    }

    const branchName = this.branch?.name || 'this branch';

    this.confirmationDialog.confirmDelete({
      title: 'Delete Branch',
      text: `Are you sure you want to delete "${branchName}"? This action cannot be undone and will also delete all associated members.`,
      successTitle: 'Branch Deleted',
      successText: 'Branch deleted successfully',
      showSuccessMessage: false // We'll use PrimeNG message service instead
    }).then((result) => {
      if (result.value) {
        this.locationService.deleteBranch(this.branchId!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Branch deleted successfully',
              life: 3000
            });
            setTimeout(() => {
              this.router.navigate(['/branch']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error deleting branch:', error);
            let errorMessage = 'Failed to delete branch. Please try again.';

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
          }
        });
      }
    });
  }

  addMember() {
    if (this.branchId) {
      this.router.navigate(['/branch', this.branchId.toString(), 'members', 'add']);
    }
  }

}

