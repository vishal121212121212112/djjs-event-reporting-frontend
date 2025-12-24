import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  login,
  loginSuccess,
  loginFailure,
  logout,
  logoutSuccess
} from '../../store/Authentication/authentication.actions';
import { LoginRequest, LoginResponse, User } from '../../store/Authentication/auth.models';
import { RootReducerState } from '../../store/index';
import { Router } from '@angular/router';

// New API response interfaces
interface NewLoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  csrfToken: string;
}

interface RefreshResponse {
  accessToken: string;
  csrfToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl = environment.apiBaseUrl;
  private readonly TOKEN_KEY = 'auth-token';
  private readonly CSRF_TOKEN_KEY = 'csrf-token';
  private readonly USER_KEY = 'currentUser';
  
  // Store access token in memory and localStorage
  private accessToken: string | null = null;
  private csrfToken: string | null = null;
  private currentUser: User | null = null;
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private store: Store<RootReducerState>,
    private router: Router
  ) {
    // Restore token from localStorage on service initialization
    this.restoreAuthData();
  }

  /**
   * Restore authentication data from localStorage
   */
  private restoreAuthData(): void {
    try {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedCsrfToken = localStorage.getItem(this.CSRF_TOKEN_KEY);
      const storedUser = localStorage.getItem(this.USER_KEY);

      console.log('[AuthService] Restoring auth data from localStorage:', {
        hasToken: !!storedToken,
        hasCsrfToken: !!storedCsrfToken,
        hasUser: !!storedUser
      });

      if (storedToken) {
        // Check format first
        const isValidFormat = this.isTokenFormatValid(storedToken);
        const isExpired = this.isTokenExpired(storedToken);
        
        console.log('[AuthService] Token validation:', {
          isValidFormat,
          isExpired,
          tokenLength: storedToken.length
        });

        // Restore token if format is valid (even if expired - let backend decide)
        // The expiration check is just for proactive refresh, not blocking
        if (isValidFormat) {
          this.accessToken = storedToken;
          this.csrfToken = storedCsrfToken;
          
          if (storedUser) {
            try {
              this.currentUser = JSON.parse(storedUser);
            } catch (e) {
              console.warn('[AuthService] Failed to parse stored user data:', e);
            }
          }
          
          if (isExpired) {
            console.warn('[AuthService] Token restored but appears expired - will attempt refresh on next request');
          } else {
            console.log('[AuthService] Token restored successfully from localStorage');
          }
        } else {
          // Token format is invalid, clear it
          console.warn('[AuthService] Stored token has invalid format, clearing');
          this.clearAuthData();
        }
      } else {
        console.log('[AuthService] No token found in localStorage');
      }
    } catch (error) {
      console.error('[AuthService] Error restoring auth data:', error);
      this.clearAuthData();
    }
  }

  /**
   * Login user with email and password
   * @param credentials LoginRequest object containing email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Ensure credentials are trimmed
    const trimmedCredentials: LoginRequest = {
      email: (credentials.email || '').trim(),
      password: (credentials.password || '').trim()
    };

    // Dispatch login action
    this.store.dispatch(login({ credentials: trimmedCredentials }));

    const url = `${this.apiUrl}/api/auth/login`;

    return this.http.post<NewLoginResponse>(url, trimmedCredentials, {
      withCredentials: true // Enable cookies for refresh token
    }).pipe(
      map((newResponse: NewLoginResponse) => {
        // Convert new API response to old format for compatibility
        const response: LoginResponse = {
          token: newResponse.accessToken
        };
        
        // Validate response has required fields
        if (!newResponse.accessToken) {
          throw new Error('Access token not received in login response');
        }
        
        // Store tokens in memory and localStorage (do this BEFORE dispatch to ensure token is available)
        // Use synchronous assignment to ensure token is immediately available
        this.accessToken = newResponse.accessToken;
        this.csrfToken = newResponse.csrfToken || null;
        
        // Persist to localStorage
        localStorage.setItem(this.TOKEN_KEY, this.accessToken);
        if (this.csrfToken) {
          localStorage.setItem(this.CSRF_TOKEN_KEY, this.csrfToken);
        }
        
        // Log for debugging (remove in production)
        console.log('[AuthService] Token stored after login:', !!this.accessToken);
        
        // Store user
        this.currentUser = {
          id: newResponse.user.id.toString(),
          email: newResponse.user.email,
          firstName: newResponse.user.name.split(' ')[0] || newResponse.user.name,
          lastName: newResponse.user.name.split(' ').slice(1).join(' ') || '',
          username: newResponse.user.email
        };
        
        // Persist user to localStorage
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));

        // Dispatch success action (this updates the store)
        this.store.dispatch(loginSuccess({ 
          response, 
          email: trimmedCredentials.email 
        }));

        return response;
      }),
      catchError(error => {
        const errorMessage = this.handleError(error);
        this.store.dispatch(loginFailure({ error: errorMessage }));
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private isLoggingOut = false;

  /**
   * Logout user
   * Prevents multiple concurrent logout calls
   */
  logout(): void {
    // Prevent multiple logout calls
    if (this.isLoggingOut) {
      console.log('[AuthService] Logout already in progress, skipping');
      return;
    }

    this.isLoggingOut = true;
    console.log('[AuthService] Starting logout');

    // Clear data immediately to prevent further API calls
    this.clearAuthData();

    // Dispatch logout action
    this.store.dispatch(logout());

    // Call logout endpoint (fire and forget - don't wait for response)
    const url = `${this.apiUrl}/api/auth/logout`;
    const headers = this.accessToken 
      ? new HttpHeaders({ 'Authorization': `Bearer ${this.accessToken}` })
      : undefined;

    this.http.post(url, {}, { 
      headers,
      withCredentials: true 
    }).subscribe({
      next: () => {
        this.store.dispatch(logoutSuccess());
        console.log('[AuthService] Logout successful');
        this.isLoggingOut = false;
      },
      error: () => {
        // Even if logout fails, clear local data
        this.store.dispatch(logoutSuccess());
        console.log('[AuthService] Logout completed (server call may have failed)');
        this.isLoggingOut = false;
      }
    });
  }

  /**
   * Check if user is authenticated
   * Returns true if a valid token exists (format check only)
   * Expiration is checked by backend - interceptor handles refresh on 401
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Only validate token format - let backend validate expiration
    // This prevents auto-logout right after login due to timing issues
    // The interceptor will handle refresh if token is expired
    return this.isTokenFormatValid(token);
  }

  /**
   * Check if token has valid JWT format
   */
  private isTokenFormatValid(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }
      
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Add 5 second buffer
      return currentTime >= (expirationTime - 5000);
    } catch (error) {
      return true;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current token (from memory or localStorage)
   * Returns token even if expired - let backend validate and interceptor handle refresh
   */
  getToken(): string | null {
    // First check memory
    if (this.accessToken) {
      // Validate token format only (not expiration - let backend decide)
      if (this.isTokenFormatValid(this.accessToken)) {
        const isExpired = this.isTokenExpired(this.accessToken);
        if (isExpired) {
          console.log('[AuthService] Token in memory appears expired - will send to backend for validation');
        }
        return this.accessToken;
      } else {
        // Token format is invalid, clear it
        console.warn('[AuthService] Token in memory has invalid format, clearing');
        this.accessToken = null;
      }
    }
    
    // Then check localStorage
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    if (storedToken) {
      const isValidFormat = this.isTokenFormatValid(storedToken);
      
      if (isValidFormat) {
        // Restore to memory (even if expired - let backend validate)
        this.accessToken = storedToken;
        const isExpired = this.isTokenExpired(storedToken);
        if (isExpired) {
          console.log('[AuthService] Token retrieved but appears expired - interceptor will attempt refresh on 401');
        } else {
          console.log('[AuthService] Token retrieved from localStorage and restored to memory');
        }
        return storedToken;
      } else {
        // Stored token format is invalid, clear it
        console.warn('[AuthService] Stored token has invalid format, clearing');
        localStorage.removeItem(this.TOKEN_KEY);
      }
    } else {
      console.log('[AuthService] No token found in memory or localStorage');
    }
    
    return null;
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    console.log('[AuthService] Clearing auth data');
    this.accessToken = null;
    this.csrfToken = null;
    this.currentUser = null;
    this.isRefreshing = false; // Reset refresh flag
    
    // Clear from localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.CSRF_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get HTTP headers with authorization token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): string {
    let errorMessage = 'An error occurred during login';

    // Log the full error for debugging
    console.error('Login error:', error);

    if (error.error) {
      // Backend returns errors in format: {"error": "message"}
      if (error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.details) {
        errorMessage = error.error.details;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your credentials.';
          break;
        case 401:
          errorMessage = 'Invalid email or password';
          break;
        case 404:
          errorMessage = 'Login endpoint not found. Please contact support.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `HTTP error ${error.status}. Please try again.`;
      }
    }

    return errorMessage;
  }

  /**
   * Get CSRF token from cookie
   */
  private getCsrfTokenFromCookie(): string | null {
    const name = 'csrf-token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<string> {
    if (this.isRefreshing) {
      // If already refreshing, wait a bit and return current token
      return of(this.accessToken || '').pipe(
        switchMap(token => token ? of(token) : throwError(() => new Error('No token')))
      );
    }

    this.isRefreshing = true;
    const url = `${this.apiUrl}/api/auth/refresh`;
    
    console.log('[AuthService] Attempting token refresh');
    
    // Don't send CSRF header for refresh - it uses HttpOnly cookies for security
    // The refresh endpoint doesn't require CSRF protection
    const headers = new HttpHeaders();

    return this.http.post<RefreshResponse>(url, {}, {
      headers,
      withCredentials: true // Critical: must send cookies for refresh token
    }).pipe(
      tap(response => {
        console.log('[AuthService] Token refresh successful, storing new token');
        // Store new token IMMEDIATELY in memory (synchronous)
        this.accessToken = response.accessToken;
        this.csrfToken = response.csrfToken;
        
        // Persist to localStorage IMMEDIATELY
        localStorage.setItem(this.TOKEN_KEY, this.accessToken);
        if (this.csrfToken) {
          localStorage.setItem(this.CSRF_TOKEN_KEY, this.csrfToken);
        }
        
        console.log('[AuthService] New token stored, length:', this.accessToken?.length || 0);
        this.isRefreshing = false;
      }),
      map(response => response.accessToken),
      catchError(error => {
        const status = error?.status || 'unknown';
        const message = error?.error?.error || error?.message || 'Unknown error';
        console.error(`[AuthService] Token refresh FAILED (${status}):`, message);
        this.isRefreshing = false;
        this.clearAuthData();
        // Don't call logout() here as it might cause recursion
        // Just clear data, the interceptor will handle logout
        return throwError(() => error);
      })
    );
  }

  /**
   * Reset password
   * @param email email address
   */
  resetPassword(email: string): Observable<any> {
    // Implementation for password reset
    // This would typically call a password reset endpoint
    return throwError(() => new Error('Password reset not implemented'));
  }

  /**
   * Get current user from store or memory
   */
  getCurrentUser(): Observable<User | null> {
    // First check memory
    if (this.currentUser) {
      return of(this.currentUser);
    }
    
    // Then check store
    return this.store.select(state => state.auth.user);
  }

  /**
   * Get current user synchronously
   */
  getCurrentUserValue(): User | null {
    return this.currentUser;
  }

  /**
   * Get authentication state from store
   */
  getAuthState(): Observable<{
    isLoggedIn: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
    loading: boolean;
  }> {
    return this.store.select(state => state.auth);
  }
}

