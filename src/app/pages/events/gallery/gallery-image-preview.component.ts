import { Component, Input, OnInit, OnDestroy, Inject, Optional, OnChanges, SimpleChanges } from '@angular/core';
import { EventApiService } from 'src/app/core/services/event-api.service';
import { Subject, of, EMPTY, Observable } from 'rxjs';
import { switchMap, distinctUntilChanged, tap, finalize, catchError, takeUntil } from 'rxjs/operators';

export interface GalleryItem {
  id?: number;
  name: string;
  url?: string;
  type: 'image' | 'video' | 'audio' | 'file';
  category?: string;
  date?: string;
  eventId?: number;
}

interface PresignedUrlCache {
  url: string;
  expiresAt: number;
}

@Component({
  selector: 'app-gallery-image-preview',
  templateUrl: './gallery-image-preview.component.html',
  styleUrls: ['./gallery-image-preview.component.scss']
})
export class GalleryImagePreviewComponent implements OnInit, OnDestroy, OnChanges {
  // Primitive inputs - stable references
  @Input() mediaId?: number;
  @Input() items: GalleryItem[] = [];
  @Input() currentIndex: number = 0;
  @Input() data?: { 
    item?: GalleryItem; 
    items?: GalleryItem[];
    currentIndex?: number;
    onDownload?: (item: GalleryItem) => void; 
    onDelete?: (item: GalleryItem) => void; 
    onClose?: () => void;
    onNavigate?: (index: number) => void;
  };
  
  // Display state
  item: GalleryItem | null = null;
  imageError = false;
  videoError = false;
  audioError = false;
  imageLoading = false;
  errorMessage = '';
  
  // Image URL for display
  imageUrl: string | null = null;
  
  // Active index for carousel (ensures first slide is active)
  activeIndex: number = 0;
  
  // Reactive pipeline
  private mediaId$ = new Subject<number | null>();
  private destroy$ = new Subject<void>();
  
  // URL cache for presigned URLs (15 min expiration)
  private urlCache = new Map<number, PresignedUrlCache>();
  private readonly CACHE_DURATION_MS = 15 * 60 * 1000;
  
  // Track last loaded URL to prevent duplicate loads
  private lastLoadedUrl: string | null = null;
  private currentImageLoadTimeout: any = null;

  constructor(
    @Optional() @Inject('MODAL_DATA') private modalData?: any,
    @Optional() private eventApiService?: EventApiService
  ) {
    this.setupKeyboardNavigation();
    this.setupImageLoadPipeline();
  }

  ngOnInit(): void {
    // TEMPORARY: Add click logger for debugging
    const clickLogger = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const computed = window.getComputedStyle(target);
      console.log('🔍 CLICK TARGET:', {
        tag: target.tagName,
        class: target.className,
        id: target.id,
        pointerEvents: computed.pointerEvents,
        zIndex: computed.zIndex,
        position: computed.position,
        isButton: target.tagName === 'BUTTON' || target.closest('button'),
        closestModal: target.closest('.modal'),
        closestBackdrop: target.closest('.modal-backdrop'),
        closestContent: target.closest('.modal-content')
      });
    };
    document.addEventListener('click', clickLogger, true);
    
    // Store logger for cleanup
    (this as any)._clickLogger = clickLogger;
    
    // Initialize from data input or injector (backward compatibility)
    const data = this.data || this.modalData;
    if (data) {
      if (data.items) {
        this.items = data.items;
      }
      if (data.currentIndex !== undefined) {
        this.currentIndex = data.currentIndex;
        this.activeIndex = data.currentIndex; // Set activeIndex from currentIndex
      }
      if (data.activeIndex !== undefined) {
        this.activeIndex = data.activeIndex;
        this.currentIndex = data.activeIndex; // Sync currentIndex with activeIndex
      }
      if (data.item) {
        this.item = data.item;
        // Extract mediaId from item (backward compatibility)
        if (data.item.id && !this.mediaId) {
          this.mediaId = data.item.id;
        }
      }
      // Use mediaId from data if provided (new pattern)
      if (data.mediaId && !this.mediaId) {
        this.mediaId = data.mediaId;
      }
    }
    
    // Ensure activeIndex is always valid (0 if items exist, otherwise 0)
    if (this.items && this.items.length > 0) {
      if (this.activeIndex < 0 || this.activeIndex >= this.items.length) {
        this.activeIndex = 0;
        this.currentIndex = 0;
      }
      // Ensure item is set from items array if not already set
      if (!this.item && this.items[this.activeIndex]) {
        this.item = this.items[this.activeIndex];
        if (this.item.id && !this.mediaId) {
          this.mediaId = this.item.id;
        }
      }
      // If item is set but doesn't match activeIndex, update to match
      if (this.item && this.items[this.activeIndex] && this.item.id !== this.items[this.activeIndex].id) {
        this.item = this.items[this.activeIndex];
        if (this.item.id && !this.mediaId) {
          this.mediaId = this.item.id;
        }
      }
    }
    
    // Start loading if we have a mediaId
    if (this.mediaId) {
      // Use setTimeout to ensure component is fully initialized
      setTimeout(() => {
        this.mediaId$.next(this.mediaId!);
      }, 100); // Increased delay to avoid race conditions
    }
    
    // Preload adjacent images
    this.preloadAdjacentImages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle data input changes (backward compatibility)
    if (changes['data'] && !changes['data'].firstChange) {
      const newData = changes['data'].currentValue;
      const oldData = changes['data'].previousValue;
      
      if (newData?.items) {
        this.items = newData.items;
      }
      if (newData?.currentIndex !== undefined) {
        this.currentIndex = newData.currentIndex;
      }
      if (newData?.item) {
        this.item = newData.item;
        const newMediaId = newData.item.id;
        const oldMediaId = oldData?.item?.id;
        
        // Only trigger load if mediaId actually changed
        if (newMediaId && newMediaId !== oldMediaId) {
          this.mediaId = newMediaId;
          this.mediaId$.next(newMediaId);
        }
      }
      return;
    }
    
    // Handle primitive input changes
    if (changes['mediaId'] && !changes['mediaId'].firstChange) {
      const newMediaId = changes['mediaId'].currentValue;
      const oldMediaId = changes['mediaId'].previousValue;
      
      // Only trigger load if mediaId actually changed
      if (newMediaId !== oldMediaId) {
        this.mediaId$.next(newMediaId || null);
      }
    }
    
    if (changes['currentIndex'] && !changes['currentIndex'].firstChange) {
      const newIndex = changes['currentIndex'].currentValue;
      const oldIndex = changes['currentIndex'].previousValue;
      
      // Update item from items array if index changed
      if (newIndex !== oldIndex && this.items && this.items[newIndex]) {
        this.item = this.items[newIndex];
        const newMediaId = this.items[newIndex].id;
        if (newMediaId && newMediaId !== this.mediaId) {
          this.mediaId = newMediaId;
          this.mediaId$.next(newMediaId);
        }
      }
    }
  }

  /**
   * Setup reactive pipeline for image loading
   * Uses switchMap to cancel in-flight requests when mediaId changes
   */
  private setupImageLoadPipeline(): void {
    this.mediaId$.pipe(
      distinctUntilChanged(), // Only proceed if mediaId actually changed
      tap(() => {
        // Reset state when starting new load
        this.imageLoading = true;
        this.imageError = false;
        this.errorMessage = '';
        this.imageUrl = null;
      }),
      switchMap((mediaId) => {
        if (!mediaId) {
          return EMPTY;
        }
        
        // Find item from items array
        const item = this.items.find(i => i.id === mediaId) || this.item;
        if (!item || item.type !== 'image') {
          this.imageLoading = false;
          return EMPTY;
        }
        
        // Check cache first
        const cached = this.urlCache.get(mediaId);
        if (cached && cached.expiresAt > Date.now()) {
          // Use cached URL
          const cachedUrl = cached.url;
          
          // Guard: Don't reload if URL is same as last loaded
          if (cachedUrl === this.lastLoadedUrl && this.imageUrl === cachedUrl) {
            this.imageLoading = false;
            return EMPTY;
          }
          
          this.lastLoadedUrl = cachedUrl;
          return of(cachedUrl);
        }
        
        // Check if item already has a valid presigned URL
        if (item.url && this.isPresignedUrl(item.url)) {
          // Cache it
          this.urlCache.set(mediaId, {
            url: item.url,
            expiresAt: Date.now() + this.CACHE_DURATION_MS
          });
          
          // Guard: Don't reload if URL is same as last loaded
          if (item.url === this.lastLoadedUrl && this.imageUrl === item.url) {
            this.imageLoading = false;
            return EMPTY;
          }
          
          this.lastLoadedUrl = item.url;
          return of(item.url);
        }
        
        // Need to fetch presigned URL
        if (!this.eventApiService) {
          this.imageError = true;
          this.imageLoading = false;
          this.errorMessage = 'Service not available';
          return EMPTY;
        }
        
        return this.eventApiService.getDownloadUrl(mediaId).pipe(
          distinctUntilChanged((prev, curr) => {
            const prevUrl = prev?.download_url || prev?.data?.download_url;
            const currUrl = curr?.download_url || curr?.data?.download_url;
            return prevUrl === currUrl;
          }),
          switchMap((response: any) => {
            const presignedUrl = response.download_url || response.data?.download_url;
            
            if (!presignedUrl) {
              // Fallback to blob fetch
              return this.eventApiService!.getFileBlob(mediaId).pipe(
                switchMap((blob: Blob) => {
                  if (blob && blob.size > 0) {
                    const blobUrl = URL.createObjectURL(blob);
                    return of(blobUrl);
                  }
                  throw new Error('Empty blob received');
                })
              );
            }
            
            // Cache the presigned URL
            this.urlCache.set(mediaId, {
              url: presignedUrl,
              expiresAt: Date.now() + this.CACHE_DURATION_MS
            });
            
            // Guard: Don't reload if URL is same as last loaded
            if (presignedUrl === this.lastLoadedUrl && this.imageUrl === presignedUrl) {
              return EMPTY;
            }
            
            this.lastLoadedUrl = presignedUrl;
            return of(presignedUrl);
          }),
          catchError((error) => {
            // Only log actual errors, not expected failures
            if (error.status !== 404) {
              console.error('Error fetching presigned URL:', error);
            }
            this.imageError = true;
            this.errorMessage = this.getErrorMessage(error);
            return EMPTY;
          })
        );
      }),
      // Load the image element - set URL and let browser handle loading
      // The template's (load) event will handle completion
      tap((url: string) => {
        if (!url) {
          return;
        }
        
        // Set the URL - browser will load it
        this.imageUrl = url;
        
        // Set timeout for loading
        if (this.currentImageLoadTimeout) {
          clearTimeout(this.currentImageLoadTimeout);
        }
        this.currentImageLoadTimeout = setTimeout(() => {
          if (this.imageLoading) {
            console.warn('Image loading timeout after 30s');
            this.imageError = true;
            this.imageLoading = false;
            this.errorMessage = 'Image loading timed out';
          }
        }, 30000);
      }),
      // Return the URL for the subscription
      switchMap((url: string) => {
        return of(url);
      }),
      finalize(() => {
        this.imageLoading = false;
      }),
      catchError((error) => {
        // Only log if it's not a timeout (timeout is handled in tap)
        if (!error.message || !error.message.includes('timeout')) {
          console.error('Error loading image:', error);
        }
        this.imageError = true;
        this.errorMessage = error.message || 'Failed to load image';
        this.imageLoading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe((url: string) => {
      // URL is already set in tap above
      // Image load/error handlers will update loading state
    });
  }

  /**
   * Check if URL is a presigned URL
   */
  private isPresignedUrl(url: string): boolean {
    if (!url) return false;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    // Presigned URLs contain signature parameters
    if (url.includes('.amazonaws.com/') && !url.includes('X-Amz-') && !url.includes('Signature=')) {
      return false;
    }
    return true;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Authentication required. Please log in again.';
    } else if (error.status === 403) {
      return 'You do not have permission to view this image.';
    } else if (error.status === 404) {
      return 'Image not found.';
    } else if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return `Failed to load image (status: ${error.status || 'unknown'})`;
  }

  /**
   * Retry loading the current image
   */
  retryLoad(): void {
    if (this.mediaId) {
      // Clear cache and reload
      this.urlCache.delete(this.mediaId);
      this.lastLoadedUrl = null;
      this.mediaId$.next(this.mediaId);
    }
  }

  ngOnDestroy(): void {
    // Remove click logger
    if ((this as any)._clickLogger) {
      document.removeEventListener('click', (this as any)._clickLogger, true);
      delete (this as any)._clickLogger;
    }
    
    // Clean up keyboard listener
    this.removeKeyboardNavigation();
    
    // Clear timeout
    if (this.currentImageLoadTimeout) {
      clearTimeout(this.currentImageLoadTimeout);
    }
    
    // Revoke ObjectURL to prevent memory leaks
    if (this.imageUrl && this.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageUrl);
    }
    
    // Complete subjects
    this.mediaId$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear cache
    this.urlCache.clear();
  }

  /**
   * Setup keyboard navigation (arrow keys, ESC)
   */
  private keyboardHandler?: (event: KeyboardEvent) => void;
  
  setupKeyboardNavigation(): void {
    this.keyboardHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        this.navigatePrevious();
      } else if (event.key === 'ArrowRight') {
        this.navigateNext();
      } else if (event.key === 'Escape') {
        this.handleClose(new Event('keydown'));
      }
    };
    document.addEventListener('keydown', this.keyboardHandler);
  }

  removeKeyboardNavigation(): void {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
    }
  }

  /**
   * Preload adjacent images for faster navigation
   */
  preloadAdjacentImages(): void {
    if (this.items.length === 0) return;
    
    // Preload next image
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    const nextItem = this.items[nextIndex];
    if (nextItem && nextItem.type === 'image' && nextItem.url) {
      const img = new Image();
      img.src = nextItem.url;
    }
    
    // Preload previous image
    const prevIndex = this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : this.items.length - 1;
    const prevItem = this.items[prevIndex];
    if (prevItem && prevItem.type === 'image' && prevItem.url) {
      const img = new Image();
      img.src = prevItem.url;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const failedUrl = img.src;
    
    // Log error for debugging
    console.error('Image load error:', {
      url: failedUrl,
      mediaId: this.mediaId,
      itemName: this.item?.name,
      imageUrl: this.imageUrl,
      matches: this.imageUrl && img.src === this.imageUrl
    });
    
    // Only update error state if this is for the current image
    if (this.imageUrl && img.src === this.imageUrl) {
      // Clear timeout
      if (this.currentImageLoadTimeout) {
        clearTimeout(this.currentImageLoadTimeout);
        this.currentImageLoadTimeout = null;
      }
      this.imageError = true;
      this.imageLoading = false;
      this.errorMessage = `Failed to load image: ${this.item?.name || 'Unknown'}. URL may be expired, invalid, or require authentication.`;
      
      // Log the failing URL (truncated for security)
      console.error('Failed URL (truncated):', failedUrl.substring(0, 200));
    }
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Only update loading state if this is for the current image
    if (this.imageUrl && img.src === this.imageUrl) {
      // Clear timeout
      if (this.currentImageLoadTimeout) {
        clearTimeout(this.currentImageLoadTimeout);
        this.currentImageLoadTimeout = null;
      }
      this.imageLoading = false;
      this.imageError = false;
      this.errorMessage = '';
    }
  }

  onVideoError(event: Event): void {
    this.videoError = true;
  }

  onAudioError(event: Event): void {
    this.audioError = true;
  }

  handleDownload(event: Event): void {
    event.stopPropagation();
    if (!this.item) return;
    const data = this.data || this.modalData;
    if (data?.onDownload) {
      data.onDownload(this.item);
    }
  }

  handleDelete(event: Event): void {
    event.stopPropagation();
    if (!this.item) return;
    const data = this.data || this.modalData;
    if (data?.onDelete) {
      data.onDelete(this.item);
    }
  }

  handleClose(event: Event): void {
    event.stopPropagation();
    const data = this.data || this.modalData;
    if (data?.onClose) {
      data.onClose();
    }
  }

  getFullFilename(item: GalleryItem | null): string {
    if (!item) return 'Untitled';
    return item.name || 'Untitled';
  }

  truncateFilename(filename: string, maxLength: number = 50): string {
    if (!filename) return '';
    if (filename.length <= maxLength) return filename;
    return filename.substring(0, maxLength - 3) + '...';
  }

  /**
   * Navigate to next item
   */
  navigateNext(): void {
    if (this.items.length === 0) return;
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    this.navigateToItem(nextIndex);
  }

  /**
   * Navigate to previous item
   */
  navigatePrevious(): void {
    if (this.items.length === 0) return;
    const prevIndex = this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : this.items.length - 1;
    this.navigateToItem(prevIndex);
  }

  /**
   * Navigate to specific item index
   */
  navigateToItem(index: number): void {
    if (index < 0 || index >= this.items.length) {
      return;
    }
    
    const newItem = this.items[index];
    if (!newItem) {
      return;
    }
    
    // Update current index and activeIndex
    this.currentIndex = index;
    this.activeIndex = index; // Ensure activeIndex is synced
    this.item = newItem;
    
    // Trigger load if mediaId changed
    if (newItem.id && newItem.id !== this.mediaId) {
      this.mediaId = newItem.id;
      this.mediaId$.next(newItem.id);
    }
    
    // Preload adjacent images for faster navigation
    this.preloadAdjacentImages();
    
    // Also call the parent's navigate handler if provided
    const data = this.data || this.modalData;
    if (data?.onNavigate) {
      data.onNavigate(index);
    }
  }

  /**
   * Check if navigation is available
   */
  get hasNext(): boolean {
    return this.items.length > 1;
  }

  get hasPrevious(): boolean {
    return this.items.length > 1;
  }
}
