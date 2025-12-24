import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChildBranchService, ChildBranch, ChildBranchMember, BranchMember } from 'src/app/core/services/child-branch.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-child-branch-member',
  templateUrl: './add-child-branch-member.component.html',
  styleUrls: ['./add-child-branch-member.component.scss']
})
export class AddChildBranchMemberComponent implements OnInit {
  childBranchId: number | null = null;
  memberForm: FormGroup;
  loading: boolean = false;
  isSubmitting: boolean = false;
  childBranchName: string = '';
  maxDateOfBirth: string = '';

  // Breadcrumb items
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
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

    // Get child branch ID from route
    const childBranchIdParam = this.route.snapshot.paramMap.get('childBranchId');
    if (childBranchIdParam) {
      this.childBranchId = parseInt(childBranchIdParam, 10);
      if (isNaN(this.childBranchId)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid child branch ID. Please select a valid child branch.',
          life: 3000
        });
        setTimeout(() => {
          this.router.navigate(['/branch']);
        }, 2000);
        return;
      }
      this.loadChildBranchName();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Child branch ID is missing. Redirecting to branch list.',
        life: 2000
      });
      setTimeout(() => {
        this.router.navigate(['/branch']);
      }, 2000);
    }

    // Set breadcrumbs (will be updated after loading child branch name)
    this.breadCrumbItems = [
      { label: 'Branches', routerLink: '/branch' },
      { label: 'Child Branch Details', routerLink: this.childBranchId ? ['/branch/child-branch/view', this.childBranchId.toString()] : '/branch' },
      { label: 'Add Member', active: true }
    ];
  }

  loadChildBranchName() {
    if (!this.childBranchId) return;

    this.loading = true;
    this.childBranchService.getChildBranchById(this.childBranchId).subscribe({
      next: (childBranch) => {
        this.childBranchName = childBranch.name;
        this.loading = false;
        if (this.childBranchId) {
          this.breadCrumbItems = [
            { label: 'Branches', routerLink: '/branch' },
            { label: childBranch.name, routerLink: ['/branch/child-branch/view', this.childBranchId.toString()] },
            { label: 'Add Member', active: true }
          ];
        }
      },
      error: (error) => {
        console.error('Error loading child branch:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load child branch information. Please try again.'
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

    if (!this.childBranchId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Child branch ID is missing. Please try again.'
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

    // Prepare member payload for child branch (now uses branch_id)
    const memberPayload: Omit<BranchMember, 'id' | 'branch_id'> = {
      name: formValue.name.trim(),
      member_type: formValue.member_type,
      branch_role: formValue.branch_role || '',
      responsibility: formValue.responsibility || '',
      age: formValue.age ? parseInt(formValue.age, 10) : undefined,
      qualification: formValue.qualification || '',
      date_of_birth: formValue.date_of_birth || undefined,
      date_of_samarpan: formValue.date_of_samarpan || undefined
    };

    this.childBranchService.createChildBranchMember(this.childBranchId, memberPayload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Member added successfully to child branch!',
          life: 3000
        });
        this.isSubmitting = false;
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating child branch member:', error);
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
    if (this.childBranchId) {
      this.router.navigate(['/branch/child-branch/view', this.childBranchId.toString()]);
    } else {
      this.router.navigate(['/branch']);
    }
  }
}



