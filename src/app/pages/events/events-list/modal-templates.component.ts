import { Component, TemplateRef } from '@angular/core';
import { ModalPortalService } from '../../../core/services/modal-portal.service';

/**
 * Helper component to define modal templates for events-list
 * This keeps modal templates separate from the main component
 */
@Component({
  selector: 'app-events-list-modals',
  template: `
    <!-- More Details Modal Template -->
    <ng-template #moreDetailsModal let-modal>
      <div class="row">
        <!-- Theme/Message Section -->
        <div class="col-12 mb-4">
          <h6 class="fw-bold">Theme/ Message given:</h6>
          <p class="text-primary">{{ selectedEvent?.theme || 'Manthan' }}</p>
        </div>

        <!-- Donation Section -->
        <div class="col-12 mb-4" *ngIf="selectedEvent?.donations?.length">
          <h6 class="fw-bold">Donation:</h6>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Donation Type</th>
                  <th>Additional Details</th>
                  <th>Amount (in Rupees)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let donation of selectedEvent?.donations">
                  <td>{{ donation.type }}</td>
                  <td>{{ donation.details || '-' }}</td>
                  <td>Rs. {{ donation.amount | number }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Event Media Section -->
        <div class="col-12 mb-4" *ngIf="selectedEvent?.media">
          <h6 class="fw-bold">Event media:</h6>
          <div class="row">
            <div class="col-md-6">
              <p><strong>Media coverage type:</strong> <span class="text-primary">{{ selectedEvent?.media?.coverageType || 'link' }}</span></p>
              <p><strong>Organization/ Comp...:</strong> <span class="text-primary">{{ selectedEvent?.media?.organization || 'link' }}</span></p>
              <p><strong>Media email:</strong> <span class="text-primary">{{ selectedEvent?.media?.email || 'link.gmail.com' }}</span></p>
              <p><strong>Media website:</strong> <span class="text-primary">{{ selectedEvent?.media?.website || 'www.link.in' }}</span></p>
            </div>
            <div class="col-md-6">
              <p><strong>Media person:</strong> {{ selectedEvent?.media?.person || 'Mr. First middle last' }}</p>
              <p><strong>Designation:</strong> <span class="text-primary">{{ selectedEvent?.media?.designation || 'link' }}</span></p>
              <p><strong>Contact:</strong> {{ selectedEvent?.media?.contact || '000000000' }}</p>
              <p><strong>Email:</strong> <span class="text-primary">{{ selectedEvent?.media?.personEmail || 'name.gmail.com' }}</span></p>
              <p><strong>Reference person:</strong> {{ selectedEvent?.media?.referencePerson || 'Mr. First middle last' }}</p>
            </div>
          </div>
        </div>

        <!-- Promotional Material Section -->
        <div class="col-12 mb-4" *ngIf="selectedEvent?.promotionalMaterials?.length">
          <h6 class="fw-bold">Promotional material used:</h6>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let material of selectedEvent?.promotionalMaterials">
                  <td>{{ material.name }}</td>
                  <td>{{ material.quantity }}</td>
                  <td>{{ material.size }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Media and Documentation Section -->
        <div class="col-12 mb-4" *ngIf="selectedEvent?.media">
          <h6 class="fw-bold">Media and Documentation:</h6>
          <div class="d-flex flex-wrap gap-3">
            <span class="cursor-pointer" (click)="openMediaContent('photos'); $event.preventDefault()">{{ selectedEvent?.media?.photos || 'Event photos' }}</span>
            <span class="cursor-pointer" (click)="openMediaContent('video'); $event.preventDefault()">{{ selectedEvent?.media?.video || 'Video Coverage' }}</span>
            <span class="cursor-pointer" (click)="openMediaContent('pressRelease'); $event.preventDefault()">{{ selectedEvent?.media?.pressRelease || 'Press Release' }}</span>
            <span class="cursor-pointer" (click)="openMediaContent('testimonials'); $event.preventDefault()">{{ selectedEvent?.media?.testimonials || 'Testimonials' }}</span>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Media Content Modal Template -->
    <ng-template #mediaContentModal let-modal>
      <div class="text-center p-4">
        <div class="media-content-display">
          <i class="pi pi-image text-primary" style="font-size: 3rem;"></i>
          <h4 class="mt-3">{{ getMediaModalTitle() }}</h4>
          <p class="text-muted mt-2">{{ getMediaContentDescription() }}</p>
          <div class="mt-4">
            <button class="btn btn-primary me-2">
              <i class="pi pi-download me-2"></i>Download
            </button>
            <button class="btn btn-outline-secondary">
              <i class="pi pi-eye me-2"></i>View
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class EventsListModalTemplatesComponent {
  selectedEvent: any;
  selectedMediaType: string | null = null;

  constructor(private modalService: ModalPortalService) {}

  openMediaContent(type: string): void {
    this.selectedMediaType = type;
    // Close more details modal and open media content modal
    // This will be handled by the parent component
  }

  getMediaModalTitle(): string {
    const titles: { [key: string]: string } = {
      photos: 'Event Photos',
      video: 'Video Coverage',
      pressRelease: 'Press Release',
      testimonials: 'Testimonials'
    };
    return titles[this.selectedMediaType || ''] || 'Media Content';
  }

  getMediaContentDescription(): string {
    const descriptions: { [key: string]: string } = {
      photos: 'View and download event photos',
      video: 'Watch video coverage of the event',
      pressRelease: 'Read the press release',
      testimonials: 'Read participant testimonials'
    };
    return descriptions[this.selectedMediaType || ''] || 'Media content';
  }
}



