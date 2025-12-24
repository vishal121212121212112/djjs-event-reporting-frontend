import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventApiService, EventWithRelatedData } from 'src/app/core/services/event-api.service';
import { MessageService } from 'primeng/api';

interface EventData {
  id: string;
  eventType: string;
  scale: string;
  name: string;
  duration: string;
  timing: string;
  state: string;
  city: string;
  district?: string;
  postOffice?: string;
  pincode?: string;
  address?: string;
  country?: string;
  spiritualOrator: string;
  language: string;
  branch: string;
  beneficiaries: {
    total: number;
    men: number;
    women: number;
    children: number;
  };
  initiation: {
    total: number;
    men: number;
    women: number;
    children: number;
  };
  specialGuests: number;
  volunteers: number;
  theme?: string;
  specialGuestsList?: Array<{
    name: string;
    phone: string;
    gender: string;
    designation: string;
    organization: string;
    email: string;
    city: string;
    state: string;
    personalNo: string;
    contactPerson: string;
    contactPhone: string;
    referencePerson: string;
    referencePhone: string;
  }>;
  volunteersList?: Array<{
    branch?: string;
    name: string;
    gender?: string;
    contact?: string;
    days: number;
    seva: string;
  }>;
  donations?: Array<{
    type: string;
    details: string;
    amount: number;
  }>;
  media?: {
    coverageType: string;
    organization: string;
    email: string;
    website: string;
    person: string;
    designation: string;
    contact: string;
    personEmail: string;
    referencePerson: string;
    photos: string;
    video: string;
    pressRelease: string;
    testimonials: string;
  };
  promotionalMaterials?: Array<{
    name: string;
    quantity: number;
    size: string;
  }>;
  status?: string;
}

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.scss']
})
export class ViewEventComponent implements OnInit {
  eventData: EventData | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventApiService: EventApiService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Event ID is required',
        life: 3000
      });
      this.router.navigate(['/events']);
      return;
    }

    this.loadEventDetails(Number(eventId));
  }

  loadEventDetails(eventId: number): void {
    this.loading = true;
    this.eventApiService.getEventById(eventId).subscribe({
      next: (response: EventWithRelatedData) => {
        const event = response.event;
        const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString() : '';
        const endDate = event.end_date ? new Date(event.end_date).toLocaleDateString() : '';
        const duration = startDate && endDate ? `${startDate} - ${endDate}` : '';

        this.eventData = {
          id: String(event.id),
          eventType: event.event_type?.name || '',
          scale: event.scale || '',
          name: event.event_category?.name || '',
          duration: duration,
          timing: event.daily_start_time && event.daily_end_time
            ? `${event.daily_start_time} - ${event.daily_end_time}`
            : '',
          state: event.state || '',
          city: event.city || '',
          district: event.district || '',
          postOffice: event.post_office || '',
          pincode: event.pincode || '',
          address: event.address || '',
          country: event.country || '',
          spiritualOrator: event.spiritual_orator || '',
          language: '',
          branch: '',
          beneficiaries: {
            total: (event.beneficiary_men || 0) + (event.beneficiary_women || 0) + (event.beneficiary_child || 0),
            men: event.beneficiary_men || 0,
            women: event.beneficiary_women || 0,
            children: event.beneficiary_child || 0
          },
          initiation: {
            total: (event.initiation_men || 0) + (event.initiation_women || 0) + (event.initiation_child || 0),
            men: event.initiation_men || 0,
            women: event.initiation_women || 0,
            children: event.initiation_child || 0
          },
          specialGuests: response.specialGuestsCount || 0,
          volunteers: response.volunteersCount || 0,
          theme: event.theme || '',
          status: event.status || 'incomplete'
        };

        // Map donations
        if (response.donations && response.donations.length > 0) {
          this.eventData.donations = response.donations.map((donation: any) => ({
            type: donation.donation_type || 'N/A',
            details: donation.kindtype || '-',
            amount: donation.amount || 0
          }));
        } else {
          this.eventData.donations = [];
        }

        // Map special guests
        if (response.specialGuests && response.specialGuests.length > 0) {
          this.eventData.specialGuestsList = response.specialGuests.map((sg: any) => ({
            name: `${sg.first_name || ''} ${sg.middle_name || ''} ${sg.last_name || ''}`.trim() || 'N/A',
            phone: sg.personal_number || sg.contact || 'N/A',
            gender: sg.gender || 'N/A',
            designation: sg.designation || 'N/A',
            organization: sg.organization || 'N/A',
            email: sg.email || 'N/A',
            city: sg.city || 'N/A',
            state: sg.state || 'N/A',
            personalNo: sg.personal_number || 'N/A',
            contactPerson: sg.contact_person || 'N/A',
            contactPhone: sg.contact_person_number || 'N/A',
            referencePerson: sg.reference_person_name || 'N/A',
            referencePhone: 'N/A'
          }));
        } else {
          this.eventData.specialGuestsList = [];
        }

        // Map volunteers
        if (response.volunteers && response.volunteers.length > 0) {
          this.eventData.volunteersList = response.volunteers.map((vol: any) => ({
            branch: vol.branch?.name || '',
            name: vol.volunteer_name || vol.name || 'N/A',
            gender: vol.gender || 'N/A',
            contact: vol.contact || '',
            days: vol.number_of_days || vol.days || 0,
            seva: vol.seva_involved || vol.seva || vol.mention_seva || 'N/A'
          }));
        } else {
          this.eventData.volunteersList = [];
        }

        // Map media - take the first media entry if available
        if (response.media && response.media.length > 0) {
          const firstMedia = response.media[0] as any;
          this.eventData.media = {
            coverageType: firstMedia.media_coverage_type?.media_type || 'N/A',
            organization: firstMedia.company_name || 'N/A',
            email: firstMedia.company_email || 'N/A',
            website: firstMedia.company_website || 'N/A',
            person: `${firstMedia.prefix || ''} ${firstMedia.first_name || ''} ${firstMedia.middle_name || ''} ${firstMedia.last_name || ''}`.trim() || 'N/A',
            designation: firstMedia.designation || 'N/A',
            contact: firstMedia.contact || 'N/A',
            personEmail: firstMedia.email || 'N/A',
            referencePerson: 'N/A',
            photos: 'Event photos',
            video: 'Video Coverage',
            pressRelease: 'Press Release',
            testimonials: 'Testimonials'
          };
        }

        // Map promotional materials
        if (response.promotionMaterials && response.promotionMaterials.length > 0) {
          this.eventData.promotionalMaterials = response.promotionMaterials.map((material: any) => ({
            name: material.promotion_material?.material_type || 'N/A',
            quantity: material.quantity || 0,
            size: material.size || 'N/A'
          }));
        } else {
          this.eventData.promotionalMaterials = [];
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load event details',
          life: 3000
        });
        this.router.navigate(['/events']);
        this.loading = false;
      }
    });
  }

  downloadPDF(): void {
    if (this.eventData) {
      this.eventApiService.downloadEvent(Number(this.eventData.id)).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `event_${this.eventData?.id}_${new Date().getTime()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Event PDF downloaded successfully',
            life: 3000
          });
        },
        error: (error) => {
          console.error('Error downloading event:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.error || 'Failed to download event PDF',
            life: 5000
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  getTotalDonations(): number {
    if (!this.eventData || !this.eventData.donations) {
      return 0;
    }
    return this.eventData.donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
  }
}
