import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiClientService } from './api-client.service';

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

/**
 * Master data service with caching
 * Caches all master data responses to reduce API calls
 * Cache is shared across subscribers and cleared when no one is subscribed (refCount: true)
 */
@Injectable({
    providedIn: 'root'
})
export class EventMasterDataService {
    // Cache TTL: 5 minutes (300000ms)
    private readonly CACHE_TTL = 300000;
    
    // Cache for each endpoint
    private eventTypesCache$?: Observable<EventType[]>;
    private eventCategoriesCache$?: Observable<EventCategory[]>;
    private promotionMaterialTypesCache$?: Observable<PromotionMaterialType[]>;
    private languagesCache$?: Observable<Language[]>;
    private oratorsCache$?: Observable<Orator[]>;
    private sevaTypesCache$?: Observable<SevaType[]>;
    private eventSubCategoriesCache$?: Observable<EventSubCategory[]>;
    private themesCache$?: Observable<Theme[]>;
    
    // Cache timestamps for TTL
    private cacheTimestamps: Map<string, number> = new Map();

    constructor(private apiClient: ApiClientService) { }

    /**
     * Get all event types (cached)
     */
    getEventTypes(forceRefresh: boolean = false): Observable<EventType[]> {
        if (forceRefresh || !this.eventTypesCache$ || this.isCacheExpired('eventTypes')) {
            this.eventTypesCache$ = this.apiClient.safeGet<EventType[]>('/event-types').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('eventTypes', Date.now());
        }
        return this.eventTypesCache$;
    }

    /**
     * Get all event categories (cached)
     */
    getEventCategories(forceRefresh: boolean = false): Observable<EventCategory[]> {
        if (forceRefresh || !this.eventCategoriesCache$ || this.isCacheExpired('eventCategories')) {
            this.eventCategoriesCache$ = this.apiClient.safeGet<EventCategory[]>('/event-categories').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('eventCategories', Date.now());
        }
        return this.eventCategoriesCache$;
    }

    /**
     * Get all promotion material types (cached)
     */
    getPromotionMaterialTypes(forceRefresh: boolean = false): Observable<PromotionMaterialType[]> {
        if (forceRefresh || !this.promotionMaterialTypesCache$ || this.isCacheExpired('promotionMaterialTypes')) {
            this.promotionMaterialTypesCache$ = this.apiClient.safeGet<PromotionMaterialType[]>('/promotion-material-types').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('promotionMaterialTypes', Date.now());
        }
        return this.promotionMaterialTypesCache$;
    }

    /**
     * Get all languages (cached)
     */
    getLanguages(forceRefresh: boolean = false): Observable<Language[]> {
        if (forceRefresh || !this.languagesCache$ || this.isCacheExpired('languages')) {
            this.languagesCache$ = this.apiClient.safeGet<Language[]>('/languages').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('languages', Date.now());
        }
        return this.languagesCache$;
    }

    /**
     * Get all orators (Coordinators & Preachers) (cached)
     */
    getOrators(forceRefresh: boolean = false): Observable<Orator[]> {
        if (forceRefresh || !this.oratorsCache$ || this.isCacheExpired('orators')) {
            this.oratorsCache$ = this.apiClient.safeGet<Orator[]>('/orators').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('orators', Date.now());
        }
        return this.oratorsCache$;
    }

    /**
     * Get all seva types (cached)
     */
    getSevaTypes(forceRefresh: boolean = false): Observable<SevaType[]> {
        if (forceRefresh || !this.sevaTypesCache$ || this.isCacheExpired('sevaTypes')) {
            this.sevaTypesCache$ = this.apiClient.safeGet<SevaType[]>('/seva-types').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('sevaTypes', Date.now());
        }
        return this.sevaTypesCache$;
    }

    /**
     * Get all event sub categories (cached)
     */
    getEventSubCategories(forceRefresh: boolean = false): Observable<EventSubCategory[]> {
        if (forceRefresh || !this.eventSubCategoriesCache$ || this.isCacheExpired('eventSubCategories')) {
            this.eventSubCategoriesCache$ = this.apiClient.safeGet<EventSubCategory[]>('/event-sub-categories').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('eventSubCategories', Date.now());
        }
        return this.eventSubCategoriesCache$;
    }

    /**
     * Get event sub categories by category ID (not cached - parameterized query)
     */
    getEventSubCategoriesByCategory(categoryId: number): Observable<EventSubCategory[]> {
        return this.apiClient.safeGet<EventSubCategory[]>('/event-sub-categories/by-category', {
            category_id: categoryId
        });
    }

    /**
     * Get all themes (cached)
     */
    getThemes(forceRefresh: boolean = false): Observable<Theme[]> {
        if (forceRefresh || !this.themesCache$ || this.isCacheExpired('themes')) {
            this.themesCache$ = this.apiClient.safeGet<Theme[]>('/themes').pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.cacheTimestamps.set('themes', Date.now());
        }
        return this.themesCache$;
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        this.eventTypesCache$ = undefined;
        this.eventCategoriesCache$ = undefined;
        this.promotionMaterialTypesCache$ = undefined;
        this.languagesCache$ = undefined;
        this.oratorsCache$ = undefined;
        this.sevaTypesCache$ = undefined;
        this.eventSubCategoriesCache$ = undefined;
        this.themesCache$ = undefined;
        this.cacheTimestamps.clear();
    }

    /**
     * Check if cache is expired
     */
    private isCacheExpired(key: string): boolean {
        const timestamp = this.cacheTimestamps.get(key);
        if (!timestamp) {
            return true;
        }
        return Date.now() - timestamp > this.CACHE_TTL;
    }
}

