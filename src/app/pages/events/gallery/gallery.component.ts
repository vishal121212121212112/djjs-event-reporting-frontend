import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventApiService } from 'src/app/core/services/event-api.service';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';

interface GalleryItem {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  category: string;
  date: Date;
  id?: number; // For deletion
  eventId?: number; // Associated event ID
}
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  // File type filter tabs
  types = ['All', 'image', 'video', 'audio', 'file'];

  // Category filter tabs
  categories = ['All', 'Event Photos', 'Video Coverage', 'Testimonials', 'Press Release'];

  // Current selections
  selectedType = 'All';
  selectedCategory = 'All';
  selectedItem: GalleryItem | null = null;
  isPopupOpen = false;
  eventId: number | null = null;
  loading = false;
  uploading = false;
  uploadProgress = 0;
  currentUploadFile = '';
  imageErrors: { [key: number]: boolean } = {}; // Track image load errors
  videoErrors: { [key: number]: boolean } = {}; // Track video load errors
  audioErrors: { [key: number]: boolean } = {}; // Track audio load errors

  // Data with dates - will be loaded from backend
  items: GalleryItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private eventApiService: EventApiService,
    private messageService: MessageService,
    private confirmationDialog: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    // Get event ID from route params or query params
    this.route.params.subscribe(params => {
      if (params['eventId']) {
        this.eventId = Number(params['eventId']);
        this.loadGalleryItems();
      } else {
        // Check query params
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['eventId']) {
            this.eventId = Number(queryParams['eventId']);
            this.loadGalleryItems();
          } else {
            // Load all gallery items if no event ID
            this.loadGalleryItems();
          }
        });
      }
    });
  }

  /**
   * Load gallery items from backend
   */
  loadGalleryItems(): void {
    this.loading = true;

    this.eventApiService.getEventMedia(this.eventId || undefined).subscribe({
      next: (response: any) => {
        // Handle response structure: { message: string, data: EventMedia[] }
        const mediaList = response.data || response || [];

        // Map backend EventMedia to GalleryItem format
        this.items = mediaList.map((media: any) => {
          // Reset errors for reloaded items
          if (media.id) {
            if (this.imageErrors[media.id]) delete this.imageErrors[media.id];
            if (this.videoErrors[media.id]) delete this.videoErrors[media.id];
            if (this.audioErrors[media.id]) delete this.audioErrors[media.id];
          }
          // Use file_type from backend if available, otherwise infer from media coverage type
          let fileType: 'image' | 'video' | 'audio' | 'file' = 'file';

          if (media.file_type) {
            // Use file_type directly from backend (image, video, audio, file)
            const ft = media.file_type.toLowerCase();
            if (ft === 'image') fileType = 'image';
            else if (ft === 'video') fileType = 'video';
            else if (ft === 'audio') fileType = 'audio';
            else fileType = 'file';
          } else {
            // Fallback: infer from media coverage type
            const mediaType = media.media_coverage_type?.media_type?.toLowerCase() || '';
            if (mediaType.includes('photo') || mediaType.includes('image')) {
              fileType = 'image';
            } else if (mediaType.includes('video')) {
              fileType = 'video';
            } else if (mediaType.includes('audio')) {
              fileType = 'audio';
            }
          }

          // Map category - prefer file_type based category, fallback to media coverage type
          let category = 'Event Photos';

          // If file_url exists, try to determine category from file_type or URL
          if (media.file_url) {
            const ft = (media.file_type || '').toLowerCase();
            if (ft === 'video' || media.file_url.includes('/videos/')) {
              category = 'Video Coverage';
            } else if (ft === 'audio' || media.file_url.includes('/audio/')) {
              category = 'Testimonials';
            } else if (media.file_url.includes('/files/') || media.file_url.includes('press')) {
              category = 'Press Release';
            } else {
              category = 'Event Photos';
            }
          } else {
            // Fallback to media coverage type
            const mediaType = media.media_coverage_type?.media_type?.toLowerCase() || '';
            if (mediaType.includes('video')) {
              category = 'Video Coverage';
            } else if (mediaType.includes('testimonial')) {
              category = 'Testimonials';
            } else if (mediaType.includes('press') || mediaType.includes('release')) {
              category = 'Press Release';
            }
          }

          // Create name from company or person details
          const name = media.company_name ||
            `${media.first_name || ''} ${media.last_name || ''}`.trim() ||
            `Media ${media.id}`;

          // Use created date or current date
          const date = media.created_on ? new Date(media.created_on) : new Date();

          // Get file URL - use file_url from database
          let url = media.file_url || media.url || '';

          // If URL is empty, log for debugging
          if (!url && media.id) {
            console.warn(`No file URL found for media ID: ${media.id}, file_type: ${media.file_type}`);
          }

          return {
            type: fileType,
            url: url,
            name: name,
            category: category,
            date: date,
            id: media.id,
            eventId: media.event_id
          } as GalleryItem;
        });

        this.loading = false;

        // Don't show message if we're loading for a specific event and it's empty
        // The UI will show an empty state instead
      },
      error: (error) => {
        console.error('Error loading gallery items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load gallery items. Please try again.',
          life: 3000
        });
        this.loading = false;
        // Fallback to empty array
        this.items = [];
      }
    });
  }

  /**
   * Download gallery item
   */
  downloadItem(item: GalleryItem, event: Event): void {
    event.stopPropagation();
    if (!item.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Item ID not available',
        life: 3000
      });
      return;
    }

    // Get presigned download URL from backend
    this.eventApiService.getDownloadUrl(item.id).subscribe({
      next: async (response: any) => {
        const downloadUrl = response.download_url || response.data?.download_url || item.url;
        const fileName = response.file_name || response.data?.file_name || item.name || `download_${item.id}`;

        try {
          // Fetch the file as a blob to force download
          const fileResponse = await fetch(downloadUrl);
          if (!fileResponse.ok) {
            throw new Error('Failed to fetch file');
          }

          const blob = await fileResponse.blob();

          // Create a blob URL and trigger download
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'File downloaded successfully',
            life: 3000
          });
        } catch (error) {
          console.error('Error downloading file:', error);
          // Fallback: try direct download
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'File download initiated',
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error getting download URL:', error);
        // Fallback to direct URL if presigned URL fails
        if (item.url) {
          fetch(item.url)
            .then(response => response.blob())
            .then(blob => {
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = item.name || `download_${item.id}`;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => {
              // Final fallback: direct link
              const link = document.createElement('a');
              link.href = item.url;
              link.download = item.name || `download_${item.id}`;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to get download URL',
            life: 3000
          });
        }
      }
    });
  }

  /**
   * Delete gallery item
   */
  deleteItem(item: GalleryItem, event: Event): void {
    event.stopPropagation();
    if (!item.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Item ID not available',
        life: 3000
      });
      return;
    }

    // Validate that item belongs to current event if event ID is set
    if (this.eventId && item.eventId !== this.eventId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'This file does not belong to the current event',
        life: 3000
      });
      return;
    }

    this.confirmationDialog.confirmDelete({
      title: 'Delete Item',
      text: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      showSuccessMessage: false // We'll use PrimeNG message service instead
    }).then((result) => {
      if (result.value) {
        if (!item.id) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Cannot delete: Item ID not available',
            life: 3000
          });
          return;
        }

        // Double-check event ID match
        if (this.eventId && item.eventId !== this.eventId) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Cannot delete: File does not belong to this event',
            life: 3000
          });
          return;
        }

        this.loading = true;
        // Delete from S3 and database (pass event ID for validation)
        this.eventApiService.deleteFile(item.id, this.eventId || undefined, true).subscribe({
          next: () => {
            // Remove from local array
            this.items = this.items.filter(i => i.id !== item.id);

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Item deleted successfully',
              life: 3000
            });

            // Close popup if deleted item was selected
            if (this.selectedItem?.id === item.id) {
              this.closePopup();
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting gallery item:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error?.error?.error || 'Failed to delete item. Please try again.',
              life: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  // Grouped and filtered items by Month-Year
  get filteredItemsByMonth() {
    const filtered = this.items.filter(item => {
      // Filter by event ID if specified
      const matchEvent = !this.eventId || item.eventId === this.eventId;
      const matchType = this.selectedType === 'All' || item.type === this.selectedType;
      const matchCategory = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      return matchEvent && matchType && matchCategory;
    });

    // Group by Month-Year
    const groups: { [key: string]: GalleryItem[] } = {};
    filtered.forEach(item => {
      const key = item.date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }

  // Month-Year keys sorted (latest first)
  getMonthYearKeys() {
    return Object.keys(this.filteredItemsByMonth)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  openPopup(item: GalleryItem) {
    this.selectedItem = item;
    this.isPopupOpen = true;
    // Don't prevent body scroll - let sidebar/navbar remain functional
    // Only prevent scroll in main content if needed
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedItem = null;
  }

  /**
   * Handle image load errors - try to get presigned URL
   */
  onImageError(event: any, item: GalleryItem): void {
    console.error('Image load error for item:', item.id, 'URL:', item.url);

    if (item.id) {
      this.imageErrors[item.id] = true;

      // Try to get presigned URL if direct URL fails
      this.eventApiService.getDownloadUrl(item.id).subscribe({
        next: (response: any) => {
          const presignedUrl = response.download_url || response.data?.download_url;
          if (presignedUrl) {
            // Update the item URL with presigned URL and reload image
            const imgElement = event.target as HTMLImageElement;
            imgElement.src = presignedUrl;
            item.url = presignedUrl;
            delete this.imageErrors[item.id];
            console.log('Updated image URL to presigned URL for item:', item.id);
          }
        },
        error: (error) => {
          console.error('Failed to get presigned URL for image:', error);
          // Keep error state so placeholder shows
        }
      });
    } else {
      console.error('Cannot retry image load: item ID is missing');
    }
  }

  /**
   * Handle video load errors - try to get presigned URL
   */
  onVideoError(event: any, item: GalleryItem): void {
    console.error('Video load error for item:', item.id, 'URL:', item.url);

    if (item.id) {
      this.videoErrors[item.id] = true;

      // Try to get presigned URL if direct URL fails
      this.eventApiService.getDownloadUrl(item.id).subscribe({
        next: (response: any) => {
          const presignedUrl = response.download_url || response.data?.download_url;
          if (presignedUrl) {
            // Update the item URL with presigned URL and reload video
            const videoElement = event.target as HTMLVideoElement;
            videoElement.src = presignedUrl;
            item.url = presignedUrl;
            delete this.videoErrors[item.id];
            console.log('Updated video URL to presigned URL for item:', item.id);
          }
        },
        error: (error) => {
          console.error('Failed to get presigned URL for video:', error);
          // Keep error state so placeholder shows
        }
      });
    } else {
      console.error('Cannot retry video load: item ID is missing');
    }
  }

  /**
   * Handle audio load errors - try to get presigned URL
   */
  onAudioError(event: any, item: GalleryItem): void {
    console.error('Audio load error for item:', item.id, 'URL:', item.url);

    if (item.id) {
      this.audioErrors[item.id] = true;

      // Try to get presigned URL if direct URL fails
      this.eventApiService.getDownloadUrl(item.id).subscribe({
        next: (response: any) => {
          const presignedUrl = response.download_url || response.data?.download_url;
          if (presignedUrl) {
            // Update the item URL with presigned URL and reload audio
            const audioElement = event.target as HTMLAudioElement;
            audioElement.src = presignedUrl;
            item.url = presignedUrl;
            delete this.audioErrors[item.id];
            console.log('Updated audio URL to presigned URL for item:', item.id);
          }
        },
        error: (error) => {
          console.error('Failed to get presigned URL for audio:', error);
          // Keep error state so placeholder shows
        }
      });
    } else {
      console.error('Cannot retry audio load: item ID is missing');
    }
  }

  /**
   * Handle file selection for manual upload
   */
  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.eventId) {
      return;
    }

    const files = Array.from(input.files);
    this.uploadFiles(files);

    // Reset input
    input.value = '';
  }

  /**
   * Upload files to S3 (multiple files in a single request)
   */
  uploadFiles(files: File[]): void {
    if (!this.eventId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select an event first',
        life: 3000
      });
      return;
    }

    if (files.length === 0) {
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.currentUploadFile = `Uploading ${files.length} file(s)...`;

    // Determine category based on first file type (or use default)
    let category = 'Event Photos';
    const firstFile = files[0];
    if (firstFile.type.startsWith('video/')) {
      category = 'Video Coverage';
    } else if (firstFile.type.startsWith('audio/')) {
      category = 'Testimonials';
    } else if (firstFile.type === 'application/pdf' || firstFile.name.toLowerCase().includes('press')) {
      category = 'Press Release';
    }

    // Upload all files in a single request
    this.eventApiService.uploadMultipleFiles(files, this.eventId!, category).subscribe({
      next: (response: any) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.currentUploadFile = '';

        const successCount = response.success || response.results?.length || 0;
        const failedCount = response.failed || 0;

        if (successCount > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Upload Complete',
            detail: `Successfully uploaded ${successCount} file(s)${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
            life: 5000
          });
        }

        if (failedCount > 0 && response.errors) {
          // Show errors for failed files
          response.errors.forEach((error: string) => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Upload Warning',
              detail: error,
              life: 5000
            });
          });
        }

        // Reload gallery items
        this.loadGalleryItems();
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploading = false;
        this.uploadProgress = 0;
        this.currentUploadFile = '';

        // Extract error message from various possible error structures
        let errorMessage = 'Unknown error';
        if (error?.error?.error) {
          errorMessage = error.error.error;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error?.error === 'string') {
          errorMessage = error.error;
        } else if (error?.error?.detail) {
          errorMessage = error.error.detail;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: `Failed to upload files: ${errorMessage}`,
          life: 5000
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Restore body scroll when component is destroyed
    document.body.style.overflow = '';
  }
}
