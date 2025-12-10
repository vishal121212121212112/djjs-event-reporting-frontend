import { Component, OnInit } from '@angular/core';
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
export class GalleryComponent implements OnInit {
  // File type filter tabs
  types = ['All', 'image', 'video', 'audio', 'file'];

  // Category filter tabs
  categories = ['All', 'Event Photos', 'Video Coverage', 'Testimonials','Press Release'];

  // Current selections
  selectedType = 'All';
  selectedCategory = 'All';
  selectedItem: GalleryItem | null = null;
  isPopupOpen = false;
  eventId: number | null = null;
  loading = false;

  // Data with dates - will be loaded from backend
  items: GalleryItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private eventApiService: EventApiService,
    private messageService: MessageService,
    private confirmationDialog: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    // Get event ID from route if provided
    this.route.params.subscribe(params => {
      if (params['eventId']) {
        this.eventId = Number(params['eventId']);
        this.loadGalleryItems();
      } else {
        // Load all gallery items
        this.loadGalleryItems();
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
          // Determine file type based on media coverage type or default to 'file'
          let fileType: 'image' | 'video' | 'audio' | 'file' = 'file';
          const mediaType = media.media_coverage_type?.media_type?.toLowerCase() || '';

          if (mediaType.includes('photo') || mediaType.includes('image')) {
            fileType = 'image';
          } else if (mediaType.includes('video')) {
            fileType = 'video';
          } else if (mediaType.includes('audio')) {
            fileType = 'audio';
          }

          // Map category based on media coverage type
          let category = 'Event Photos';
          if (mediaType.includes('video')) {
            category = 'Video Coverage';
          } else if (mediaType.includes('testimonial')) {
            category = 'Testimonials';
          } else if (mediaType.includes('press') || mediaType.includes('release')) {
            category = 'Press Release';
          }

          // Create name from company or person details
          const name = media.company_name ||
                      `${media.first_name || ''} ${media.last_name || ''}`.trim() ||
                      `Media ${media.id}`;

          // Use created date or current date
          const date = media.created_on ? new Date(media.created_on) : new Date();

          // Note: URL will be empty if files aren't stored yet
          // This can be extended when file upload is implemented
          const url = media.file_url || media.url || '';

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

        if (this.items.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'No Media Found',
            detail: this.eventId
              ? 'No media files found for this event.'
              : 'No media files found.',
            life: 3000
          });
        }
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
    if (!item.url) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Download URL not available',
        life: 3000
      });
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name || `download_${item.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'File downloaded successfully',
      life: 3000
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

      this.loading = true;
      this.eventApiService.deleteEventMedia(item.id).subscribe({
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
      const matchType = this.selectedType === 'All' || item.type === this.selectedType;
      const matchCategory = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      return matchType && matchCategory;
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
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedItem = null;
  }
}
