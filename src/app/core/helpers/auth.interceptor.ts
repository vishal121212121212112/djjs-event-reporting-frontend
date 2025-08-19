import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from auth service
    const token = this.authService.getToken();
    
    // Clone the request and add authorization header if token exists
    if (token) {
      // Check if token is expired before adding it
      if (this.authService.isTokenExpired(token)) {
        // Token is expired, logout and redirect
        this.authService.logout();
        this.router.navigate(['/auth/login'], { 
          queryParams: { reason: 'expired' } 
        });
        return throwError(() => new Error('Token expired'));
      }
      
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch any errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If unauthorized (401), redirect to login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login'], { 
            queryParams: { reason: 'unauthorized' } 
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}