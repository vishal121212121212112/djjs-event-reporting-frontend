import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface EventType {
    id: number;
    name: string;
}

export interface EventCategory {
    id: number;
    name: string;
    event_type_id: number;
    event_type?: {
        id: number;
        name: string;
    };
}

export interface PromotionMaterialType {
    id: number;
    material_type: string;
}

export interface Language {
    id: number;
    name: string;
    code: string;
    created_on?: string;
    updated_on?: string;
}

export interface Orator {
    id: number;
    name: string;
}

export interface SevaType {
    id: number;
    name: string;
    description?: string;
    created_on?: string;
    updated_on?: string;
}

export interface EventSubCategory {
    id: number;
    name: string;
    event_category_id: number;
    description?: string;
    event_category?: EventCategory;
    created_on?: string;
    updated_on?: string;
}

export interface Theme {
    id: number;
    name: string;
    created_on?: string;
    updated_on?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EventMasterDataService {
    private apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    /**
     * Get all event types
     */
    getEventTypes(): Observable<EventType[]> {
        return this.http.get<EventType[]>(`${this.apiBaseUrl}/api/event-types`);
    }

    /**
     * Get all event categories
     */
    getEventCategories(): Observable<EventCategory[]> {
        return this.http.get<EventCategory[]>(`${this.apiBaseUrl}/api/event-categories`);
    }

    /**
     * Get all promotion material types
     */
    getPromotionMaterialTypes(): Observable<PromotionMaterialType[]> {
        return this.http.get<PromotionMaterialType[]>(`${this.apiBaseUrl}/api/promotion-material-types`);
    }

    /**
     * Get all languages
     */
    getLanguages(): Observable<Language[]> {
        return this.http.get<Language[]>(`${this.apiBaseUrl}/api/languages`);
    }

    /**
     * Get all orators (Coordinators & Preachers)
     */
    getOrators(): Observable<Orator[]> {
        return this.http.get<Orator[]>(`${this.apiBaseUrl}/api/orators`);
    }

    /**
     * Get all seva types
     */
    getSevaTypes(): Observable<SevaType[]> {
        return this.http.get<SevaType[]>(`${this.apiBaseUrl}/api/seva-types`);
    }

    /**
     * Get all event sub categories
     */
    getEventSubCategories(): Observable<EventSubCategory[]> {
        return this.http.get<EventSubCategory[]>(`${this.apiBaseUrl}/api/event-sub-categories`);
    }

    /**
     * Get event sub categories by category ID
     */
    getEventSubCategoriesByCategory(categoryId: number): Observable<EventSubCategory[]> {
        return this.http.get<EventSubCategory[]>(`${this.apiBaseUrl}/api/event-sub-categories/by-category?category_id=${categoryId}`);
    }

    /**
     * Get all themes
     */
    getThemes(): Observable<Theme[]> {
        return this.http.get<Theme[]>(`${this.apiBaseUrl}/api/themes`);
    }
}

