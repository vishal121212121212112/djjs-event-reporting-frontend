import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/core/services/location.service';
import { ChildBranchService } from 'src/app/core/services/child-branch.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  branchId: number | null = null;
  isChildBranch: boolean = false; // Determined by checking branch's parent_branch_id
  memberForm: FormGroup;
  loading: boolean = false;
  isSubmitting: boolean = false;
  branchName: string = '';
  maxDateOfBirth: string = '';

  // Breadcrumb items
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private locationService: LocationService,
    private childBranchService: ChildBranchService,
    private messageService: MessageService
  ) {
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      member_type: ['', Validators.required],
      branch_role: ['', Validators.required],
      responsibility: [''],
      age: ['', [Validators.min(1), Validators.max(120)]],
      qualification: [''],
      date_of_birth: [''],
      date_of_samarpan: ['']
    });
  }

  ngOnInit(): void {
    // Set max date for date of birth (today)
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1); // At least 1 year old
    this.maxDateOfBirth = today.toISOString().split('T')[0];

    // Get branch ID from route - check both parent and child routes
    const branchIdParam = this.route.snapshot.paramMap.get('branchId') ||
                         this.route.parent?.snapshot.paramMap.get('id');
    if (branchIdParam) {
      this.branchId = parseInt(branchIdParam, 10);
      if (isNaN(this.branchId)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid branch ID. Please select a valid branch.',
          life: 3000
        });
        setTimeout(() => {
          this.router.navigate(['/branch']);
        }, 2000);
        return;
      }
      this.loadBranchName();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Branch ID is missing. Redirecting to branch list.',
        life: 2000
      });
      setTimeout(() => {
        this.router.navigate(['/branch']);
      }, 2000);
    }

    // Set breadcrumbs (will be updated after loading branch name)
    this.breadCrumbItems = [
      { label: 'Branches', routerLink: '/branch' },
      { label: 'Branch Details', routerLink: this.branchId ? ['/branch/view', this.branchId.toString()] : '/branch' },
      { label: 'Add Member', active: true }
    ];
  }

  loadBranchName() {
    if (!this.branchId) return;

    this.loading = true;
    // Try to get branch - check if it's a child branch by checking parent_branch_id
    this.locationService.getBranchById(this.branchId).subscribe({
      next: (branch) => {
        this.branchName = branch.name;
        this.isChildBranch = branch.parent_branch_id != null;
        this.loading = false;
        if (this.branchId) {
          const viewLink = this.isChildBranch 
            ? ['/branch/child-branch/view', this.branchId.toString()]
            : ['/branch/view', this.branchId.toString()];
          this.breadCrumbItems = [
            { label: 'Branches', routerLink: '/branch' },
            { label: branch.name, routerLink: viewLink },
            { label: 'Add Member', active: true }
          ];
        }
      },
      error: (error) => {
        // If not found as regular branch, try as child branch
        this.childBranchService.getChildBranchById(this.branchId!).subscribe({
          next: (childBranch) => {
            this.branchName = childBranch.name;
            this.isChildBranch = true;
            this.loading = false;
            if (this.branchId) {
              this.breadCrumbItems = [
                { label: 'Branches', routerLink: '/branch' },
                { label: childBranch.name, routerLink: ['/branch/child-branch/view', this.branchId.toString()] },
                { label: 'Add Member', active: true }
              ];
            }
          },
          error: (err) => {
            console.error('Error loading branch:', err);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to load branch information. Please try again.'
            });
          }
        });
      }
    });
  }

  onSubmit() {
    // Validate form
    if (!this.memberForm.valid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.memberForm.controls).forEach(key => {
        const control = this.memberForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });

      // Show validation error message
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    if (!this.branchId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Branch ID is missing. Please try again.'
      });
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.memberForm.value;

    // Validate dates
    if (formValue.date_of_birth && formValue.date_of_samarpan) {
      const dob = new Date(formValue.date_of_birth);
      const dos = new Date(formValue.date_of_samarpan);
      if (dos < dob) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Date of Samarpan cannot be before Date of Birth.'
        });
        this.isSubmitting = false;
        return;
      }
    }

    // Validate age if provided
    if (formValue.age) {
      const age = parseInt(formValue.age, 10);
      if (isNaN(age) || age < 1 || age > 120) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Age must be between 1 and 120.'
        });
        this.isSubmitting = false;
        return;
      }
    }

    const memberPayload = {
      branch_id: this.branchId,
      name: formValue.name.trim(),
      member_type: formValue.member_type,
      branch_role: formValue.branch_role || '',
      responsibility: formValue.responsibility || '',
      age: formValue.age ? parseInt(formValue.age, 10) : 0,
      qualification: formValue.qualification || '',
      date_of_birth: formValue.date_of_birth || null,
      date_of_samarpan: formValue.date_of_samarpan || null
    };

    // Use unified service - works for both parent and child branches
    this.locationService.createBranchMember(memberPayload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Member added successfully!',
          life: 3000
        });
        this.isSubmitting = false;
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating member:', error);
        let errorMessage = 'Failed to add member. Please try again.';

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
        this.isSubmitting = false;
      }
    });
  }


  goBack() {
    if (this.branchId) {
      if (this.isChildBranch) {
        this.router.navigate(['/branch/child-branch/view', this.branchId.toString()]);
      } else {
        this.router.navigate(['/branch/view', this.branchId.toString()]);
      }
    } else {
      this.router.navigate(['/branch']);
    }
  }
}

