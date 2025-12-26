import { Injectable } from '@angular/core';
import { 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpInterceptor,
  HttpErrorResponse,
  HttpEventType
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout, tap } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { normalizeError, AppError } from '../models/app-error.model';

/**
 * Error interceptor that:
 * 1. Adds x-request-id header to all requests
 * 2. Adds default timeout (30s) to all requests
 * 3. Normalizes error responses to AppError format
 * 4. Shows user-friendly toast notifications for unhandled errors
 * 
 * Note: 401 errors are handled by AuthInterceptor (token refresh)
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly ERROR_TOAST_DEBOUNCE_MS = 2000; // Don't show duplicate errors within 2 seconds
  
  // Track recent error messages to prevent spam
  private recentErrors: Map<string, number> = new Map();

  constructor(
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Generate request ID if not already present
    const requestId = request.headers.get('x-request-id') || this.generateRequestId();
    
    // Clone request with request ID header
    const clonedRequest = request.clone({
      setHeaders: {
        'x-request-id': requestId
      }
    });

    // Handle request with timeout and error handling
    return next.handle(clonedRequest).pipe(
      // Add timeout to all requests (except file uploads which may take longer)
      timeout(this.getTimeoutForRequest(clonedRequest)),
      catchError((error: any) => {
        // Handle timeout errors
        if (error instanceof TimeoutError || error.name === 'TimeoutError') {
          const timeoutError: AppError = {
            code: 'TIMEOUT_ERROR',
            message: 'Request timed out. Please try again.',
            status: 408,
            requestId,
            timestamp: new Date()
          };
          this.handleError(timeoutError, clonedRequest);
          return throwError(() => timeoutError);
        }

        // Normalize error to AppError format
        const appError = normalizeError(error, requestId);
        
        // Handle error (show toast if needed)
        this.handleError(appError, clonedRequest, error);
        
        // Preserve original error structure for components that need it
        // But also attach normalized error for convenience
        if (error instanceof HttpErrorResponse) {
          (error as any).appError = appError;
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Get timeout duration for a request
   * File uploads get longer timeout
   */
  private getTimeoutForRequest(request: HttpRequest<any>): number {
    // File uploads may take longer
    if (request.url.includes('/upload') || request.url.includes('/files')) {
      return 120000; // 2 minutes for file uploads
    }
    return this.DEFAULT_TIMEOUT;
  }

  /**
   * Generate a unique request ID
   * Format: req_timestamp_random
   */
  private generateRequestId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const counter = (this.requestCounter++).toString(36);
    return `req_${timestamp}_${random}_${counter}`;
  }

  private requestCounter = 0;

  /**
   * Handle error - show toast notification if appropriate
   */
  private handleError(
    appError: AppError, 
    request: HttpRequest<any>, 
    originalError?: any
  ): void {
    // Skip toast for:
    // 1. 401 errors (handled by AuthInterceptor)
    // 2. Auth endpoints (login, register, etc.)
    // 3. Errors that components explicitly handle
    if (this.shouldSkipErrorToast(appError, request)) {
      return;
    }

    // Check if we've shown this error recently (prevent spam)
    const errorKey = `${appError.status}_${appError.message}`;
    const lastShown = this.recentErrors.get(errorKey);
    const now = Date.now();
    
    if (lastShown && (now - lastShown) < this.ERROR_TOAST_DEBOUNCE_MS) {
      // Skip duplicate error within debounce window
      return;
    }

    // Record that we're showing this error
    this.recentErrors.set(errorKey, now);
    
    // Clean up old entries (keep map from growing indefinitely)
    if (this.recentErrors.size > 100) {
      const cutoff = now - this.ERROR_TOAST_DEBOUNCE_MS * 10;
      for (const [key, timestamp] of this.recentErrors.entries()) {
        if (timestamp < cutoff) {
          this.recentErrors.delete(key);
        }
      }
    }

    // Show appropriate toast based on error severity
    const severity = this.getErrorSeverity(appError);
    const message = this.getUserFriendlyMessage(appError);
    
    switch (severity) {
      case 'error':
        this.toastService.error(message, 'Error', 5000);
        break;
      case 'warn':
        this.toastService.warning(message, 'Warning', 4000);
        break;
      case 'info':
        this.toastService.info(message, 'Info', 3000);
        break;
      default:
        this.toastService.error(message, 'Error', 5000);
    }
  }

  /**
   * Determine if we should skip showing error toast
   */
  private shouldSkipErrorToast(appError: AppError, request: HttpRequest<any>): boolean {
    // Skip 401 errors (handled by AuthInterceptor)
    if (appError.status === 401) {
      return true;
    }

    // Skip auth endpoints (they handle their own errors)
    const url = request.url.toLowerCase();
    if (url.includes('/api/auth/login') ||
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/refresh') ||
        url.includes('/api/auth/logout') ||
        url.includes('/api/auth/forgot-password') ||
        url.includes('/api/auth/reset-password')) {
      return true;
    }

    // Skip members API (they use different error handling)
    if (url.includes('members.djjs.org')) {
      return true;
    }

    // Skip if error has a flag indicating component will handle it
    // (This can be set by components that want to handle errors themselves)
    if ((request as any).skipGlobalErrorHandling) {
      return true;
    }

    return false;
  }

  /**
   * Get error severity based on status code
   */
  private getErrorSeverity(appError: AppError): 'error' | 'warn' | 'info' {
    if (!appError.status) {
      return 'error';
    }

    if (appError.status >= 500) {
      return 'error';
    } else if (appError.status >= 400) {
      return 'warn';
    } else {
      return 'info';
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(appError: AppError): string {
    // Use the normalized message (already user-friendly)
    return appError.message;
  }
}
