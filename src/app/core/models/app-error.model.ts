/**
 * Standardized application error interface
 * Maps backend error responses to a consistent format
 */
export interface AppError {
  code?: string;
  message: string;
  details?: any;
  status?: number;
  statusText?: string;
  requestId?: string;
  timestamp?: Date;
}

/**
 * Backend error response formats we support:
 * - { "error": "message" }
 * - { "message": "message" }
 * - { "error": { "code": "...", "message": "...", "details": ... } }
 * - { "message": "...", "code": "...", "details": ... }
 */
export interface BackendErrorResponse {
  error?: string | AppError;
  message?: string;
  code?: string;
  details?: any;
}

/**
 * Normalize backend error response to AppError
 * @param error HttpErrorResponse or any error object
 * @param requestId Optional request ID for correlation
 * @returns Normalized AppError
 */
export function normalizeError(error: any, requestId?: string): AppError {
  const appError: AppError = {
    message: 'An unknown error occurred',
    timestamp: new Date(),
    requestId
  };

  // Extract status information
  if (error.status) {
    appError.status = error.status;
  }
  if (error.statusText) {
    appError.statusText = error.statusText;
  }

  // Handle network errors (status 0)
  if (error.status === 0 || !error.status) {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      appError.message = error.error.message || 'Network error. Please check your connection.';
      appError.code = 'NETWORK_ERROR';
    } else {
      appError.message = 'Network error. Please check your connection.';
      appError.code = 'NETWORK_ERROR';
    }
    return appError;
  }

  // Handle HTTP error responses
  const errorResponse: BackendErrorResponse = error.error || {};

  // Case 1: { "error": "message" } (string)
  if (typeof errorResponse.error === 'string') {
    appError.message = errorResponse.error;
    appError.code = errorResponse.code || `HTTP_${error.status}`;
  }
  // Case 2: { "error": { "code": "...", "message": "...", "details": ... } } (object)
  else if (errorResponse.error && typeof errorResponse.error === 'object') {
    const errorObj = errorResponse.error as AppError;
    appError.message = errorObj.message || 'An error occurred';
    appError.code = errorObj.code || `HTTP_${error.status}`;
    appError.details = errorObj.details;
  }
  // Case 3: { "message": "message" }
  else if (errorResponse.message) {
    appError.message = errorResponse.message;
    appError.code = errorResponse.code || `HTTP_${error.status}`;
    appError.details = errorResponse.details;
  }
  // Case 4: Fallback to status-based messages
  else {
    appError.code = `HTTP_${error.status}`;
    switch (error.status) {
      case 400:
        appError.message = 'Invalid request. Please check your input.';
        break;
      case 401:
        appError.message = 'Authentication required. Please log in again.';
        break;
      case 403:
        appError.message = 'Access denied. You do not have permission to perform this action.';
        break;
      case 404:
        appError.message = 'Resource not found.';
        break;
      case 409:
        appError.message = 'Conflict. The resource may have been modified.';
        break;
      case 422:
        appError.message = 'Validation error. Please check your input.';
        break;
      case 429:
        appError.message = 'Too many requests. Please try again later.';
        break;
      case 500:
        appError.message = 'Server error. Please try again later.';
        break;
      case 502:
        appError.message = 'Bad gateway. The server is temporarily unavailable.';
        break;
      case 503:
        appError.message = 'Service unavailable. Please try again later.';
        break;
      case 504:
        appError.message = 'Gateway timeout. The request took too long.';
        break;
      default:
        appError.message = `Error ${error.status}. Please try again.`;
    }
  }

  return appError;
}

