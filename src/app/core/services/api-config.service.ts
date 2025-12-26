import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * Centralized API configuration service
 * Provides base URLs and helper methods for building API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiBaseUrl: string;
  private readonly membersApiUrl: string;
  private readonly membersApiToken: string;

  constructor() {
    this.apiBaseUrl = environment.apiBaseUrl;
    this.membersApiUrl = environment.membersApiUrl;
    this.membersApiToken = environment.membersApiToken;
  }

  /**
   * Get the base API URL
   */
  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  /**
   * Get the members API URL
   */
  getMembersApiUrl(): string {
    return this.membersApiUrl;
  }

  /**
   * Get the members API token
   */
  getMembersApiToken(): string {
    return this.membersApiToken;
  }

  /**
   * Build a full API endpoint URL
   * @param endpoint API endpoint (e.g., '/api/events' or 'api/events')
   * @returns Full URL (e.g., 'http://localhost:8080/api/events')
   */
  buildApiUrl(endpoint: string): string {
    // Normalize endpoint (remove leading slash if present, add /api if missing)
    let normalizedEndpoint = endpoint.trim();
    
    // If endpoint doesn't start with /api, add it
    if (!normalizedEndpoint.startsWith('/api')) {
      normalizedEndpoint = normalizedEndpoint.startsWith('/') 
        ? `/api${normalizedEndpoint}` 
        : `/api/${normalizedEndpoint}`;
    } else if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }

    // Combine base URL with endpoint
    const baseUrl = this.apiBaseUrl.endsWith('/') 
      ? this.apiBaseUrl.slice(0, -1) 
      : this.apiBaseUrl;
    
    return `${baseUrl}${normalizedEndpoint}`;
  }

  /**
   * Build a members API endpoint URL
   * @param endpoint Members API endpoint (e.g., '/volunteers')
   * @returns Full URL (e.g., 'https://members.djjs.org/events/volunteers')
   */
  buildMembersApiUrl(endpoint: string): string {
    let normalizedEndpoint = endpoint.trim();
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }

    const baseUrl = this.membersApiUrl.endsWith('/') 
      ? this.membersApiUrl.slice(0, -1) 
      : this.membersApiUrl;
    
    return `${baseUrl}${normalizedEndpoint}`;
  }
}

