import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { TokenStorageService } from './token-storage.service';

export interface DraftSaveRequest {
  draftId?: string | number | null; // Changed from eventId to draftId
  step: 'generalDetails' | 'mediaPromotion' | 'specialGuests' | 'volunteers' | 'donations';
  data: any;
}

export interface DraftSaveResponse {
  draftId: string | number; // Changed from eventId to draftId
  message?: string;
}

export interface DraftData {
  draftId: number;
  generalDetails?: any;
  mediaPromotion?: any;
  specialGuests?: any;
  volunteers?: any;
  donations?: any;
  createdOn?: string;
  updatedOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventDraftService {
  private readonly DRAFT_ID_STORAGE_PREFIX = 'event_draft_id_';

  constructor(
    private apiClient: ApiClientService,
    private tokenStorage: TokenStorageService
  ) { }

  /**
   * Get storage key based on user email
   */
  private getStorageKey(): string | null {
    const user = this.tokenStorage.getUser();
    if (user && user.email) {
      return `${this.DRAFT_ID_STORAGE_PREFIX}${user.email}`;
    }
    return null;
  }

  /**
   * Save draft data for a specific step
   * @param payload Draft save request payload
   */
  saveDraft(payload: DraftSaveRequest): Observable<DraftSaveResponse> {
    return this.apiClient.safePost<DraftSaveResponse>('/events/draft', payload);
  }

  /**
   * Get draft data by draft ID
   * @param draftId Draft ID
   */
  getDraft(draftId: string | number): Observable<DraftData> {
    return this.apiClient.safeGet<DraftData>(`/events/draft/${draftId}`);
  }

  /**
   * Get latest draft for current user
   * Used to restore draft after logout/login
   */
  getLatestDraft(): Observable<DraftData> {
    return this.apiClient.safeGet<DraftData>('/events/draft/latest');
  }

  /**
   * Save draft ID to localStorage (keyed by user email)
   */
  saveDraftIdToStorage(draftId: string | number | null): void {
    const storageKey = this.getStorageKey();
    if (storageKey) {
      if (draftId) {
        localStorage.setItem(storageKey, String(draftId));
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }

  /**
   * Get draft ID from localStorage (keyed by user email)
   */
  getDraftIdFromStorage(): string | null {
    const storageKey = this.getStorageKey();
    if (storageKey) {
      return localStorage.getItem(storageKey);
    }
    return null;
  }

  /**
   * Clear draft ID from localStorage (keyed by user email)
   */
  clearDraftIdFromStorage(): void {
    const storageKey = this.getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }
}

