import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/branch-assistance.service'; // Adjust path
import { User } from 'src/app/shared/models/common.model'; // Adjust path

@Component({
  selector: 'app-add-branch-assistance',
  templateUrl: './add-branch-assistance.component.html',
  styleUrls: ['./add-branch-assistance.component.css']
})
export class AddBranchAssistanceComponent implements OnInit {

  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      ID: [''],  // Will be auto-generated on backend if necessary
      Username: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      Contact_Number: ['', [Validators.required]],
      Password: ['', [Validators.required]],
    
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const user: User = this.userForm.value;
      this.userService.createUser(user).subscribe(response => {
        console.log('User created successfully!', response);
        // Handle success response (e.g., show success message, navigate to user list)
      }, error => {
        console.error('Error creating user', error);
        // Handle error response (e.g., show error message)
      });
    } else {
      this.userForm.markAllAsTouched();  // Mark all fields as touched to show validation errors
    }
  }
}
