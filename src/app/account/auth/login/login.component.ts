import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RootReducerState } from '../../../store/index';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;
  loading: boolean = false;

  // set the current year
  year: number = new Date().getFullYear();

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: UntypedFormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private authenticationService: AuthenticationService, 
    private store: Store<RootReducerState>
  ) { }

  ngOnInit() {
    // Check if user is already authenticated
    if (this.authenticationService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Check if there's a reason for redirect
    const reason = this.route.snapshot.queryParams['reason'];
    if (reason) {
      switch (reason) {
        case 'expired':
          this.error = 'Your session has expired. Please login again.';
          break;
        case 'unauthorized':
          this.error = 'You are not authorized to access that page. Please login.';
          break;
        default:
          this.error = 'Please login to continue.';
      }
    }

    // Subscribe to auth state changes
    this.authenticationService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.loading = authState.loading;
        
        // Only update error if it's not a reason-based error
        if (!reason) {
          this.error = authState.error;
        }
        
        // If login successful, redirect
        if (authState.isLoggedIn && authState.token) {
          this.router.navigate([this.returnUrl]);
        }
      });

    // Initialize form validation
    this.loginForm = this.formBuilder.group({
      identifier: ['', [Validators.required]],  // Changed from email to identifier
      password: ['', [Validators.required]],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    const credentials = {
      identifier: this.f['identifier'].value,  // Changed from email to identifier
      password: this.f['password'].value
    };

    // Call authentication service
    this.authenticationService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Navigation will be handled by the auth state subscription
      },
      error: (error) => {
        console.error('Login error:', error);
        // Error handling is done by the auth state subscription
      }
    });
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  /**
   * Clear error message
   */
  clearError() {
    this.error = '';
  }
}
