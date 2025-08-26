import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/core/services/branch-assistance.service';
import { User } from 'src/app/shared/models/common.model';

@Component({
  selector: 'app-edit-branch-assistance',
  templateUrl: './edit-branch-assistance.component.html',
  styleUrls: ['./edit-branch-assistance.component.scss']
})
export class EditBranchAssistanceComponent implements OnInit {
  updateUserForm: FormGroup;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getUserIdFromRoute();
    if (this.userId) {
      this.loadUserData(this.userId);  // Load data for the user
    }
  }

  initForm() {
    this.updateUserForm = this.fb.group({
      Username: ['', [Validators.required]],
      Contact_Number: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(6)]],  // Password must be at least 6 characters long
    });
  }

  // Get user ID from route parameters (e.g., /user/edit/:id)
  getUserIdFromRoute() {
    this.userId = this.route.snapshot.paramMap.get('id');
  }

  // Load user data based on the ID to be edited
  loadUserData(userId: string) {
    this.userService.getUserById(userId).subscribe((user: User) => {
      this.updateUserForm.patchValue({
        Username: user.Username,
        Contact_Number: user.Contact_Number,
        Password: user.Password
      });
    });
  }

  onSubmit() {
    if (this.updateUserForm.invalid) {
      return;
    }

    const userData = this.updateUserForm.value;
    this.userService.updateUser(this.userId!, userData).subscribe(
      response => {
        this.messageService.add({ severity: 'success', summary: 'User Updated', detail: 'User details have been updated successfully.' });
        this.router.navigate(['/user/list']);  
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user.' });
      }
    );
  }
}
