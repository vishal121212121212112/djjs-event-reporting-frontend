import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface EventDetails {
  id: number;
  event_type_id?: number;
  event_category_id?: number;
  scale?: string;
  theme?: string;
  start_date?: string;
  end_date?: string;
  daily_start_time?: string;
  daily_end_time?: string;
  spiritual_orator?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  post_office?: string;
  pincode?: string;
  address?: string;
  beneficiary_men?: number;
  beneficiary_women?: number;
  beneficiary_child?: number;
  initiation_men?: number;
  initiation_women?: number;
  initiation_child?: number;
  status?: 'complete' | 'incomplete';
  created_on?: string;
  updated_on?: string;
  created_by?: string;
  updated_by?: string;
  event_type?: {
    id: number;
    name: string;
  };
  event_category?: {
    id: number;
    name: string;
    event_type_id: number;
  };
  special_guests_count?: number;
  volunteers_count?: number;
  media_count?: number;
}

export interface SpecialGuest {
  id?: number;
  gender?: string;
  prefix?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  designation?: string;
  organization?: string;
  email?: string;
  city?: string;
  state?: string;
  personal_number?: string;
  contact_person?: string;
  contact_person_number?: string;
  reference_branch_id?: string;
  reference_volunteer_id?: string;
  reference_person_name?: string;
  event_id?: number;
}

export interface Volunteer {
  id?: number;
  branch_id?: number;
  search_member?: string;
  name?: string;
  volunteer_name?: string; // Backend field name
  contact?: string;
  email?: string;
  days?: number;
  seva?: string;
  mention_seva?: string;
  event_id?: number;
  branch?: {
    id?: number;
    name?: string;
  };
}

export interface EventMedia {
  id?: number;
  company_name?: string;
  company_email?: string;
  company_website?: string;
  gender?: string;
  prefix?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  designation?: string;
  contact?: string;
  email?: string;
  media_coverage_type_id?: number;
  event_id?: number;
}

export interface EventWithRelatedData {
  event: EventDetails;
  specialGuests?: SpecialGuest[];
  volunteers?: Volunteer[];
  media?: EventMedia[];
  specialGuestsCount?: number;
  volunteersCount?: number;
  mediaCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventApiService {
  private apiBaseUrl = environment.apiBaseUrl;
  private membersApiUrl = environment.membersApiUrl;
  private membersApiToken = environment.membersApiToken;

  constructor(private http: HttpClient) { }

  /**
   * Get all events, optionally filtered by status
   * @param status Optional status filter: 'complete' or 'incomplete'
   */
  getEvents(status?: 'complete' | 'incomplete'): Observable<EventDetails[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<EventDetails[]>(`${this.apiBaseUrl}/api/events`, { params });
  }

  /**
   * Get event by ID with related data (special guests, volunteers, media)
   */
  getEventById(eventId: number): Observable<EventWithRelatedData> {
    return this.http.get<EventWithRelatedData>(`${this.apiBaseUrl}/api/events/${eventId}`);
  }

  /**
   * Update event status
   */
  updateEventStatus(eventId: number, status: 'complete' | 'incomplete'): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}/api/events/${eventId}/status`, { status });
  }

  /**
   * Search events
   */
  searchEvents(searchTerm: string): Observable<EventDetails[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<EventDetails[]>(`${this.apiBaseUrl}/api/events/search`, { params });
  }

  /**
   * Create a new event (as draft or complete)
   * @param eventData Event data to create (can be nested structure or flat)
   * @param status 'complete' or 'incomplete' (draft) - will be added to payload if not already present
   */
  createEvent(eventData: any, status: 'complete' | 'incomplete' = 'incomplete'): Observable<EventDetails> {
    // If status is not already in eventData, add it
    const payload = eventData.status ? eventData : { ...eventData, status };
    return this.http.post<EventDetails>(`${this.apiBaseUrl}/api/events`, payload);
  }

  /**
   * Update an existing event
   * @param eventId Event ID to update
   * @param eventData Event data to update
   * @param status 'complete' or 'incomplete' (draft)
   */
  updateEvent(eventId: number, eventData: Partial<EventDetails>, status?: 'complete' | 'incomplete'): Observable<EventDetails> {
    const payload = { ...eventData };
    if (status) {
      payload.status = status;
    }
    return this.http.put<EventDetails>(`${this.apiBaseUrl}/api/events/${eventId}`, payload);
  }

  /**
   * Delete an event
   * @param eventId Event ID to delete
   */
  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/api/events/${eventId}`);
  }

  /**
   * Download event data as PDF/JSON
   * @param eventId Event ID to download
   */
  downloadEvent(eventId: number): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/api/events/${eventId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Get event media files for gallery
   * @param eventId Optional event ID. If not provided, returns all media
   */
  getEventMedia(eventId?: number): Observable<any> {
    if (eventId) {
      return this.http.get(`${this.apiBaseUrl}/api/event-media/event/${eventId}`);
    } else {
      return this.http.get(`${this.apiBaseUrl}/api/event-media`);
    }
  }

  /**
   * Delete event media
   * @param mediaId Media ID to delete
   */
  deleteEventMedia(mediaId: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/api/event-media/${mediaId}`);
  }

  /**
   * Get presigned download URL for a file
   * @param mediaId Media ID
   */
  getDownloadUrl(mediaId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/api/files/${mediaId}/download`);
  }

  /**
   * Upload file to S3
   * @param file File to upload
   * @param eventId Event ID
   * @param mediaId Optional media ID (for updating existing media)
   * @param category File category (Event Photos, Video Coverage, Testimonials, Press Release)
   */
  uploadFile(file: File, eventId: number, mediaId?: number, category?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_id', eventId.toString());
    if (mediaId) {
      formData.append('media_id', mediaId.toString());
    }
    if (category) {
      formData.append('category', category);
    }
    return this.http.post(`${this.apiBaseUrl}/api/files/upload`, formData);
  }

  /**
   * Upload multiple files to S3 in a single request
   * @param files Array of files to upload
   * @param eventId Event ID
   * @param category File category (Event Photos, Video Coverage, Testimonials, Press Release)
   */
  uploadMultipleFiles(files: File[], eventId: number, category?: string): Observable<any> {
    const formData = new FormData();

    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });

    formData.append('event_id', eventId.toString());
    if (category) {
      formData.append('category', category);
    }

    return this.http.post(`${this.apiBaseUrl}/api/files/upload-multiple`, formData);
  }

  /**
   * Delete file from S3
   * @param mediaId Media ID
   * @param eventId Optional event ID for validation
   * @param deleteRecord Whether to delete the media record (default: true)
   */
  deleteFile(mediaId: number, eventId?: number, deleteRecord: boolean = true): Observable<any> {
    let params = new HttpParams().set('delete_record', deleteRecord.toString());
    if (eventId) {
      params = params.set('event_id', eventId.toString());
    }
    return this.http.delete(`${this.apiBaseUrl}/api/files/${mediaId}`, { params });
  }

  /**
   * Search volunteers by name, contact, or email from external members API
   * @param searchTerm Search term (name, contact number, or email)
   * @param branchCode Optional branch code to filter by
   */
  searchVolunteers(searchTerm: string, branchCode?: string): Observable<Volunteer[]> {
    // Prepare headers with bearer token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.membersApiToken}`,
      'Content-Type': 'application/json'
    });

    // Prepare request body for external API
    // The API expects search term in filters.search field
    const requestBody: any = {
      branch_code: branchCode || '',
      filters: {
        search: searchTerm
      },
      first: 0,
      rows: 20 // Limit to 20 results for autocomplete
    };

    console.log('[EventApiService] Searching volunteers:', { searchTerm, branchCode, requestBody });

    // Call external members API
    return this.http.post<any>(`${this.membersApiUrl}/volunteers`, requestBody, { headers }).pipe(
      map((response: any) => {
        console.log('[EventApiService] Raw API response:', response);
        
        // Map the external API response to our Volunteer interface
        // The response structure may vary, so we'll handle different possible formats
        let volunteers: any[] = [];
        
        // Check various possible response structures (prioritize 'rows' as it's the actual API format)
        if (response.rows && Array.isArray(response.rows)) {
          volunteers = response.rows;
        } else if (Array.isArray(response)) {
          volunteers = response;
        } else if (response.data && Array.isArray(response.data)) {
          volunteers = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Nested data structure
          volunteers = response.data.data;
        } else if (response.volunteers && Array.isArray(response.volunteers)) {
          volunteers = response.volunteers;
        } else if (response.results && Array.isArray(response.results)) {
          volunteers = response.results;
        } else if (response.items && Array.isArray(response.items)) {
          volunteers = response.items;
        } else if (response.records && Array.isArray(response.records)) {
          volunteers = response.records;
        } else if (response.list && Array.isArray(response.list)) {
          volunteers = response.list;
        } else {
          // Log the full response structure for debugging
          console.warn('[EventApiService] Unexpected API response structure:', JSON.stringify(response, null, 2));
          return [];
        }
        
        console.log('[EventApiService] Extracted volunteers array:', volunteers.length, 'items');
        
        // Map each volunteer to our interface
        let mappedVolunteers = volunteers.map((vol: any) => this.mapExternalVolunteerToVolunteer(vol));
        
        // Client-side filtering as fallback (in case API doesn't filter properly)
        // Filter by name, phone, or email (case-insensitive, partial match)
        if (searchTerm && searchTerm.trim().length > 0) {
          const searchLower = searchTerm.toLowerCase().trim();
          // Split search term into words for better matching
          const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
          
          mappedVolunteers = mappedVolunteers.filter((vol: Volunteer) => {
            const name = (vol.volunteer_name || vol.name || '').toLowerCase();
            const contact = (vol.contact || '').toLowerCase();
            const email = (vol.email || '').toLowerCase();
            
            // For multi-word searches (e.g., "varsha meena")
            if (searchWords.length > 1) {
              // Check if all words appear in the name (most common case)
              const allWordsInName = searchWords.every(word => name.includes(word));
              // Or check if all words appear in contact or email
              const allWordsInContact = searchWords.every(word => contact.includes(word));
              const allWordsInEmail = searchWords.every(word => email.includes(word));
              
              return allWordsInName || allWordsInContact || allWordsInEmail;
            } else {
              // Single word search - match if found in any field
              return name.includes(searchLower) || 
                     contact.includes(searchLower) || 
                     email.includes(searchLower);
            }
          });
          console.log('[EventApiService] Filtered volunteers after client-side filtering:', mappedVolunteers.length, 'items');
        }
        
        console.log('[EventApiService] Final mapped volunteers:', mappedVolunteers);
        return mappedVolunteers;
      }),
      catchError((error) => {
        console.error('[EventApiService] Error searching volunteers:', error);
        // Return empty array on error instead of throwing
        return of([]);
      })
    );
  }

  /**
   * Map external API volunteer object to our Volunteer interface
   */
  private mapExternalVolunteerToVolunteer(externalVol: any): Volunteer {
    // The API returns: id, name, phone, email, state, area, branch_code, departments
    const branchCode = externalVol.branch_code || '';
    
    return {
      id: externalVol.id || externalVol.volunteer_id || externalVol.member_id,
      // Set branch_id to branch_code (string like "DL-PP")
      branch_id: externalVol.branch_id || branchCode || undefined,
      volunteer_name: externalVol.name || externalVol.volunteer_name || externalVol.full_name || externalVol.member_name || '',
      name: externalVol.name || externalVol.volunteer_name || externalVol.full_name || externalVol.member_name || '',
      contact: externalVol.phone || externalVol.contact || externalVol.contact_number || externalVol.mobile || externalVol.phone_number || '',
      email: externalVol.email || externalVol.email_id || externalVol.email_address || '',
      // Create branch object with branch_code as name
      branch: externalVol.branch ? {
        id: externalVol.branch.id || externalVol.branch.branch_id,
        name: externalVol.branch.name || externalVol.branch.branch_name || externalVol.branch.code || branchCode || ''
      } : (branchCode ? {
        id: undefined,
        name: branchCode
      } : undefined)
    };
  }
}



