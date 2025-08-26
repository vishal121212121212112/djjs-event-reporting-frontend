import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      // Additional check: verify token is still valid
      const token = this.authService.getToken();
      if (token && this.isTokenValid(token)) {
        return true;
      } else {
        // Token is expired or invalid, logout and redirect
        this.authService.logout();
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url, reason: 'expired' }
        });
        return false;
      }
    }

    // If not authenticated, redirect to login with return URL
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  }

  /**
   * Basic token validation - checks if token exists and has valid format
   * In a production app, you might want to check expiration time as well
   */
  private isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      // Basic JWT format validation (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Optional: Check if token is expired (if it has expiration)
      // This is a basic check - you might want to implement proper JWT validation
      return true;
    } catch (error) {
      return false;
    }
  }
}
