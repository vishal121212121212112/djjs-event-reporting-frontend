import { Injectable } from '@angular/core';
import { 
  HttpClient, 
  HttpParams, 
  HttpHeaders, 
  HttpErrorResponse,
  HttpContext
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap, take, catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';
import { AppError, normalizeError } from '../models/app-error.model';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [500, 502, 503, 504] // Server errors
};

/**
 * Safe API client service with:
 * - Centralized base URL management
 * - Automatic retry for idempotent requests (GET/HEAD)
 * - Exponential backoff
 * - Error normalization
 * - Request ID support
 */
@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  /**
   * Safe GET request with automatic retry
   * @param endpoint API endpoint (e.g., '/events' or 'events')
   * @param params Optional query parameters
   * @param retryConfig Optional retry configuration
   */
  safeGet<T>(
    endpoint: string,
    params?: HttpParams | { [key: string]: any },
    retryConfig?: RetryConfig
  ): Observable<T> {
    const url = this.apiConfig.buildApiUrl(endpoint);
    const httpParams = this.convertToHttpParams(params);
    
    return this.http.get<T>(url, { params: httpParams }).pipe(
      this.addRetryLogic('GET', retryConfig),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Safe POST request (NO retry by default)
   * @param endpoint API endpoint
   * @param body Request body
   * @param options Optional HTTP options
   */
  safePost<T>(
    endpoint: string,
    body: any,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [key: string]: any };
    }
  ): Observable<T> {
    const url = this.apiConfig.buildApiUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: this.convertToHttpParams(options?.params),
      observe: 'body' as const
    };

    return this.http.post<T>(url, body, httpOptions).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Safe PUT request (NO retry by default)
   * @param endpoint API endpoint
   * @param body Request body
   * @param options Optional HTTP options
   */
  safePut<T>(
    endpoint: string,
    body: any,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [key: string]: any };
    }
  ): Observable<T> {
    const url = this.apiConfig.buildApiUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: this.convertToHttpParams(options?.params),
      observe: 'body' as const
    };

    return this.http.put<T>(url, body, httpOptions).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Safe PATCH request (NO retry by default)
   * @param endpoint API endpoint
   * @param body Request body
   * @param options Optional HTTP options
   */
  safePatch<T>(
    endpoint: string,
    body: any,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [key: string]: any };
    }
  ): Observable<T> {
    const url = this.apiConfig.buildApiUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: this.convertToHttpParams(options?.params),
      observe: 'body' as const
    };

    return this.http.patch<T>(url, body, httpOptions).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Safe DELETE request (NO retry by default)
   * @param endpoint API endpoint
   * @param options Optional HTTP options
   */
  safeDelete<T>(
    endpoint: string,
    options?: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?: HttpParams | { [key: string]: any };
    }
  ): Observable<T> {
    const url = this.apiConfig.buildApiUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: this.convertToHttpParams(options?.params),
      observe: 'body' as const
    };

    return this.http.delete<T>(url, httpOptions).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Add retry logic for idempotent requests (GET/HEAD only)
   */
  private addRetryLogic<T>(
    method: string,
    retryConfig?: RetryConfig
  ): (source: Observable<T>) => Observable<T> {
    // Only retry GET/HEAD requests
    if (method !== 'GET' && method !== 'HEAD') {
      return (source: Observable<T>) => source;
    }

    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

    return (source: Observable<T>) =>
      source.pipe(
        retryWhen((errors: Observable<any>) =>
          errors.pipe(
            mergeMap((error: HttpErrorResponse, index: number) => {
              // Don't retry if we've exceeded max retries
              if (index >= config.maxRetries) {
                return throwError(() => error);
              }

              // Only retry on network errors or retryable status codes
              const shouldRetry =
                error.status === 0 || // Network error
                (error.status && config.retryableStatusCodes.includes(error.status));

              if (!shouldRetry) {
                return throwError(() => error);
              }

              // Calculate delay with exponential backoff
              const delay = Math.min(
                config.initialDelay * Math.pow(config.backoffMultiplier, index),
                config.maxDelay
              );

              console.log(
                `[ApiClientService] Retrying ${method} request (attempt ${index + 1}/${config.maxRetries}) after ${delay}ms`
              );

              return timer(delay);
            }),
            take(config.maxRetries + 1)
          )
        )
      );
  }

  /**
   * Convert params object to HttpParams
   */
  private convertToHttpParams(
    params?: HttpParams | { [key: string]: any }
  ): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    if (params instanceof HttpParams) {
      return params;
    }

    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
        if (Array.isArray(params[key])) {
          params[key].forEach((value: any) => {
            httpParams = httpParams.append(key, String(value));
          });
        } else {
          httpParams = httpParams.set(key, String(params[key]));
        }
      }
    }
    return httpParams;
  }

  /**
   * Handle errors and normalize them
   */
  private handleError(error: any): Observable<never> {
    const appError = normalizeError(error);
    // Attach normalized error to original error for convenience
    if (error instanceof HttpErrorResponse) {
      (error as any).appError = appError;
    }
    return throwError(() => error);
  }
}

