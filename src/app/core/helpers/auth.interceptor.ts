import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth header for ALL auth endpoints (login, register, refresh, etc.)
    // This ensures we NEVER attach an expired token to the refresh request
    if (this.isAuthRequest(request)) {
      console.log(`[AuthInterceptor] Skipping auth header for: ${request.url}`);
      return next.handle(request);
    }

    // Skip if this is a logout request (prevents infinite loops)
    if (this.isLogoutRequest(request)) {
      console.log(`[AuthInterceptor] Logout request, skipping auth header: ${request.url}`);
      return next.handle(request);
    }

    // Skip auth header for members API requests (they use their own static token)
    if (this.isMembersApiRequest(request)) {
      console.log(`[AuthInterceptor] Skipping auth header for members API: ${request.url}`);
      return next.handle(request);
    }

    // Get token from auth service synchronously (no async operations)
    // This reads directly from memory or localStorage - no race conditions
    const token = this.authService.getToken();

    // Add authorization header if token exists
    if (token) {
      request = this.addTokenHeader(request, token);
      console.log(`[AuthInterceptor] Auth header attached for: ${request.url}`);
    } else {
      // No token available - log warning but still send request
      // The error handler will attempt to refresh if possible
      console.warn(`[AuthInterceptor] No token available for request: ${request.url}`);
    }

    // Handle request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(`[AuthInterceptor] Error ${error.status} for: ${request.url}`);
        
        // Skip token refresh logic for members API requests (they use different auth)
        if (this.isMembersApiRequest(request)) {
          console.log(`[AuthInterceptor] Members API request, skipping token refresh logic`);
          return throwError(() => error);
        }
        
        // If 401 and not a refresh request, try to refresh token ONCE
        // Only attempt refresh if we have a token (prevents refresh on login failures)
        if (error.status === 401 && !this.isRefreshRequest(request)) {
          const token = this.authService.getToken();
          if (token) {
            console.log(`[AuthInterceptor] 401 detected, attempting refresh for: ${request.url}`);
            return this.handle401Error(request, next);
          } else {
            console.warn(`[AuthInterceptor] 401 but no token available, cannot refresh`);
            // No token means user needs to login - don't try to refresh
            this.authService.logout();
            this.router.navigate(['/auth/login'], {
              queryParams: { reason: 'session_expired' }
            });
            return throwError(() => error);
          }
        }

        // If 401 on refresh itself, logout immediately (no retry)
        if (error.status === 401 && this.isRefreshRequest(request)) {
          console.error(`[AuthInterceptor] Refresh failed with 401, logging out`);
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { reason: 'session_expired' }
          });
          return throwError(() => error);
        }

        // Handle 403 (CSRF or other forbidden)
        if (error.status === 403) {
          console.error(`[AuthInterceptor] 403 Forbidden for: ${request.url}`);
          // If refresh fails with 403, logout immediately (no retry)
          if (this.isRefreshRequest(request)) {
            console.error(`[AuthInterceptor] Refresh failed with 403, logging out`);
            this.authService.logout();
            this.router.navigate(['/auth/login'], {
              queryParams: { reason: 'csrf_error' }
            });
            return throwError(() => error);
          }
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Handle 401 error by attempting token refresh
   * Implements safe refresh logic:
   * - Only one refresh call at a time (gate with isRefreshing flag)
   * - Retry original request exactly once after refresh succeeds
   * - If refresh fails, logout and stop (no infinite loops)
   */
  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Prevent multiple concurrent refresh calls
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log(`[AuthInterceptor] Starting token refresh`);
      return this.authService.refreshToken().pipe(
        switchMap((token: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          console.log(`[AuthInterceptor] Token refresh SUCCESS, new token length: ${token?.length || 0}, retrying: ${request.url}`);
          
          // Verify token is valid before retrying
          if (!token || token.length === 0) {
            console.error(`[AuthInterceptor] Refreshed token is empty!`);
            this.authService.logout();
            this.router.navigate(['/auth/login'], {
              queryParams: { reason: 'session_expired' }
            });
            return throwError(() => new Error('Empty token after refresh'));
          }
          
          // Retry the original request with the NEW token (exactly once)
          const clonedRequest = this.addTokenHeader(request, token);
          console.log(`[AuthInterceptor] Retrying request with new token: ${request.url}`);
          return next.handle(clonedRequest);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          
          const status = err?.status || 'unknown';
          console.error(`[AuthInterceptor] Token refresh FAILED (${status}), logging out`);
          
          // Refresh failed definitively - logout and stop (no retry)
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { reason: 'session_expired' }
          });
          
          return throwError(() => err);
        })
      );
    } else {
      // If already refreshing, wait for the token from the ongoing refresh
      console.log(`[AuthInterceptor] Already refreshing, waiting for token to retry: ${request.url}`);
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1), // Take only the first non-null token
        switchMap((token) => {
          console.log(`[AuthInterceptor] Received refreshed token, retrying request: ${request.url}`);
          const clonedRequest = this.addTokenHeader(request, token);
          return next.handle(clonedRequest);
        }),
        catchError((err) => {
          // If the refresh that we were waiting for failed, logout
          console.error(`[AuthInterceptor] Refresh failed while waiting, logging out`);
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { reason: 'session_expired' }
          });
          return throwError(() => err);
        })
      );
    }
  }

  /**
   * Add authorization header to request
   */
  private addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Check if request is an auth request (login, register, refresh)
   */
  private isAuthRequest(request: HttpRequest<unknown>): boolean {
    const url = request.url;
    return url.includes('/api/auth/login') || 
           url.includes('/api/auth/register') ||
           url.includes('/api/auth/refresh') ||
           url.includes('/api/auth/forgot-password') ||
           url.includes('/api/auth/reset-password') ||
           url.includes('/api/auth/verify-email');
  }

  /**
   * Check if request is refresh token request
   */
  private isRefreshRequest(request: HttpRequest<unknown>): boolean {
    return request.url.includes('/api/auth/refresh');
  }

  /**
   * Check if request is logout request
   */
  private isLogoutRequest(request: HttpRequest<unknown>): boolean {
    return request.url.includes('/api/auth/logout');
  }

  /**
   * Check if request is for members API (uses different authentication)
   */
  private isMembersApiRequest(request: HttpRequest<unknown>): boolean {
    return request.url.includes('members.djjs.org');
  }
}