import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  contact?: string;
  days?: number;
  seva?: string;
  mention_seva?: string;
  event_id?: number;
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
}



