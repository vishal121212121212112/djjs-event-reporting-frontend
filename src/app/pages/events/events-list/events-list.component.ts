import { Component, OnInit, HostListener, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EventApiService, EventDetails } from 'src/app/core/services/event-api.service';
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface EventData {
  id: string;
  eventType: string;
  scale: string;
  name: string;
  duration: string;
  timing: string;
  state: string;
  city: string;
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
  // Additional properties for modals
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
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit, AfterViewChecked, OnDestroy {

  // PrimeNG Table Configuration
  events: EventData[] = [];
  allEventsData: EventData[] = []; // Store all events for pagination
  filteredEventsData: EventData[] = []; // Store filtered events

  // Pagination
  first = 0;
  rows = 10;
  rowsPerPageOptions = [10, 20, 50];

  // Sorting
  sortField: string = '';
  sortOrder: number = 1;

  // Filtering - using custom filter system
  filters: { [key: string]: any } = {};

  // Column pinning
  pinnedColumns: string[] = [];

  // Additional filtering methods
  activeFilter: string | null = null;

  // Status filter
  statusFilter: 'all' | 'complete' | 'incomplete' = 'all';
  loadingEvents: boolean = false;

  // Drafts management
  draftsCount: number = 0;

  // Search functionality with debouncing
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Date range for export
  exportStartDate: Date | null = null;
  exportEndDate: Date | null = null;
  exporting: boolean = false;
  exportingVolunteers: boolean = false;
  exportingSpecialGuests: boolean = false;
  exportingMedia: boolean = false;
  isExportModalOpen: boolean = false;

  // Dropdown management
  openDropdown: string | null = null;
  openActionMenu: string | null = null; // Track which action menu is open (by event id)

  // Modal management
  selectedEvent: EventData | null = null;
  selectedMediaType: string | null = null; // Track which media type was clicked
  isMoreDetailsModalOpen: boolean = false; // Track if More Details modal was open

  // Sample data with simple events structure
  allEvents: EventData[] = [
    {
      id: '1',
      eventType: 'Katha',
      scale: 'S',
      name: 'Bhagwat Katha',
      duration: '5 May 2024 - 16 May 2024',
      timing: '5:30pm - 7:30pm',
      state: 'Karnataka',
      city: 'Bangalore',
      spiritualOrator: 'Dr. Anya Sharma',
      language: 'English',
      branch: 'Bangalore Central Branch',
      beneficiaries: { total: 50, men: 30, women: 15, children: 5 },
      initiation: { total: 50, men: 30, women: 15, children: 5 },
      specialGuests: 3,
      volunteers: 32,
      theme: 'Manthan',
      specialGuestsList: [
        {
          name: 'Jane Doe',
          phone: '000000000',
          gender: 'Female',
          designation: 'Manager',
          organization: 'ABC Corp',
          email: 'jane@abc.com',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '12345',
          contactPerson: 'John Doe',
          contactPhone: '111111111',
          referencePerson: 'Jane Doe',
          referencePhone: '000000000'
        }
      ],
      volunteersList: [
        {
          name: 'Jane Doe',
          days: 4,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 40000 },
        { type: 'In-kind', details: 'Rice 5kg bed-sheet - 2', amount: 5000 }
      ],
      media: {
        coverageType: 'link',
        organization: 'link',
        email: 'link.gmail.com',
        website: 'www.link.in',
        person: 'Mr. First middle last',
        designation: 'link',
        contact: '000000000',
        personEmail: 'name.gmail.com',
        referencePerson: 'Mr. First middle last',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Jane Doe', quantity: 4, size: 'A3' }
      ]
    },
    {
      id: '2',
      eventType: 'Katha',
      scale: 'M',
      name: 'Bhagwat Katha',
      duration: '5 May 2024 - 16 May 2024',
      timing: '5:30pm - 7:30pm',
      state: 'Karnataka',
      city: 'Bangalore',
      spiritualOrator: 'Mr. Rohan Verma',
      language: 'Hindi',
      branch: 'Bangalore Central Branch',
      beneficiaries: { total: 100, men: 60, women: 30, children: 10 },
      initiation: { total: 100, men: 60, women: 30, children: 10 },
      specialGuests: 3,
      volunteers: 32,
      theme: 'Dharma',
      specialGuestsList: [
        {
          name: 'Dr. Rajesh Kumar',
          phone: '9876543210',
          gender: 'Male',
          designation: 'Professor',
          organization: 'Bangalore University',
          email: 'rajesh@bangalore.edu',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '54321',
          contactPerson: 'Mrs. Rajesh Kumar',
          contactPhone: '9876543211',
          referencePerson: 'Dr. Anil Sharma',
          referencePhone: '9876543212'
        },
        {
          name: 'Mrs. Priya Singh',
          phone: '8765432109',
          gender: 'Female',
          designation: 'Director',
          organization: 'Cultural Society',
          email: 'priya@culturalsociety.org',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '54322',
          contactPerson: 'Mr. Priya Singh',
          contactPhone: '8765432110',
          referencePerson: 'Dr. Rajesh Kumar',
          referencePhone: '9876543210'
        }
      ],
      volunteersList: [
        {
          name: 'Rahul Sharma',
          days: 5,
          seva: 'Seva involved'
        },
        {
          name: 'Priya Patel',
          days: 3,
          seva: 'Seva involved'
        },
        {
          name: 'Amit Kumar',
          days: 4,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 75000 },
        { type: 'In-kind', details: 'Books 10kg, Clothes 5 sets', amount: 8000 }
      ],
      media: {
        coverageType: 'TV Coverage',
        organization: 'DD News',
        email: 'news@ddnews.in',
        website: 'www.ddnews.gov.in',
        person: 'Mr. Sanjay Verma',
        designation: 'Senior Reporter',
        contact: '9876543213',
        personEmail: 'sanjay@ddnews.in',
        referencePerson: 'Mr. Rohan Verma',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Banners', quantity: 8, size: 'A2' },
        { name: 'Pamphlets', quantity: 500, size: 'A4' }
      ]
    },
    {
      id: '3',
      eventType: 'Cultural',
      scale: 'M',
      name: 'Festivals: Mahashivratri',
      duration: '8 Mar 2024 - 8 Mar 2024',
      timing: '6:00pm - 9:00pm',
      state: 'Karnataka',
      city: 'Bangalore',
      spiritualOrator: '',
      language: 'Hindi',
      branch: 'Bangalore Central Branch',
      beneficiaries: { total: 150, men: 80, women: 60, children: 10 },
      initiation: { total: 150, men: 80, women: 60, children: 10 },
      specialGuests: 5,
      volunteers: 45,
      theme: 'Shiva Bhakti',
      specialGuestsList: [
        {
          name: 'Swami Ji',
          phone: '7654321098',
          gender: 'Male',
          designation: 'Spiritual Leader',
          organization: 'Shiva Ashram',
          email: 'swamiji@shivaashram.org',
          city: 'Varanasi',
          state: 'Uttar Pradesh',
          personalNo: '12346',
          contactPerson: 'Shri Ram Das',
          contactPhone: '7654321099',
          referencePerson: 'Swami Ji',
          referencePhone: '7654321098'
        },
        {
          name: 'Dr. Meera Patel',
          phone: '6543210987',
          gender: 'Female',
          designation: 'Cultural Director',
          organization: 'Art Council',
          email: 'meera@artcouncil.in',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '12347',
          contactPerson: 'Mr. Meera Patel',
          contactPhone: '6543210988',
          referencePerson: 'Swami Ji',
          referencePhone: '7654321098'
        }
      ],
      volunteersList: [
        {
          name: 'Krishna Das',
          days: 6,
          seva: 'Seva involved'
        },
        {
          name: 'Radha Rani',
          days: 4,
          seva: 'Seva involved'
        },
        {
          name: 'Hanuman Ji',
          days: 5,
          seva: 'Seva involved'
        },
        {
          name: 'Ganesh Ji',
          days: 3,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 120000 },
        { type: 'In-kind', details: 'Flowers 20kg, Incense 50 packets', amount: 15000 }
      ],
      media: {
        coverageType: 'Print Media',
        organization: 'Times of India',
        email: 'bangalore@timesofindia.com',
        website: 'www.timesofindia.com',
        person: 'Ms. Anjali Sharma',
        designation: 'Feature Writer',
        contact: '6543210989',
        personEmail: 'anjali@timesofindia.com',
        referencePerson: 'Dr. Meera Patel',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Posters', quantity: 100, size: 'A3' },
        { name: 'Brochures', quantity: 200, size: 'A4' },
        { name: 'Digital Banners', quantity: 15, size: 'Digital' }
      ]
    },
    {
      id: '4',
      eventType: 'Peace Procession',
      scale: 'L',
      name: 'Peace Procession',
      duration: '15 Jan 2024 - 15 Jan 2024',
      timing: '4:00pm - 6:00pm',
      state: 'Karnataka',
      city: 'Bangalore',
      spiritualOrator: '',
      language: 'Hindi',
      branch: 'Bangalore Central Branch',
      beneficiaries: { total: 120, men: 70, women: 45, children: 5 },
      initiation: { total: 120, men: 70, women: 45, children: 5 },
      specialGuests: 8,
      volunteers: 60,
      theme: 'World Peace',
      specialGuestsList: [
        {
          name: 'Dr. Mahatma Gandhi',
          phone: '5432109876',
          gender: 'Male',
          designation: 'Peace Activist',
          organization: 'Peace Foundation',
          email: 'gandhi@peacefoundation.org',
          city: 'Ahmedabad',
          state: 'Gujarat',
          personalNo: '12348',
          contactPerson: 'Mrs. Gandhi',
          contactPhone: '5432109877',
          referencePerson: 'Dr. Gandhi',
          referencePhone: '5432109876'
        },
        {
          name: 'Mother Teresa',
          phone: '4321098765',
          gender: 'Female',
          designation: 'Humanitarian',
          organization: 'Charity Mission',
          email: 'teresa@charitymission.org',
          city: 'Kolkata',
          state: 'West Bengal',
          personalNo: '12349',
          contactPerson: 'Sister Teresa',
          contactPhone: '4321098766',
          referencePerson: 'Dr. Gandhi',
          referencePhone: '5432109876'
        }
      ],
      volunteersList: [
        {
          name: 'Peace Worker 1',
          days: 7,
          seva: 'Seva involved'
        },
        {
          name: 'Peace Worker 2',
          days: 6,
          seva: 'Seva involved'
        },
        {
          name: 'Peace Worker 3',
          days: 5,
          seva: 'Seva involved'
        },
        {
          name: 'Peace Worker 4',
          days: 4,
          seva: 'Seva involved'
        },
        {
          name: 'Peace Worker 5',
          days: 3,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 200000 },
        { type: 'In-kind', details: 'White flags 1000, Peace symbols 500', amount: 25000 }
      ],
      media: {
        coverageType: 'International Media',
        organization: 'BBC News',
        email: 'bangalore@bbc.com',
        website: 'www.bbc.com/news',
        person: 'Mr. John Smith',
        designation: 'Foreign Correspondent',
        contact: '4321098767',
        personEmail: 'john.smith@bbc.com',
        referencePerson: 'Dr. Gandhi',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Peace Banners', quantity: 50, size: 'A1' },
        { name: 'White Doves', quantity: 100, size: 'Live' },
        { name: 'Peace Literature', quantity: 1000, size: 'A5' }
      ]
    },
    {
      id: '5',
      eventType: 'Katha',
      scale: 'S',
      name: 'Ram Katha',
      duration: '10 May 2024 - 20 May 2024',
      timing: '6:00pm - 8:00pm',
      state: 'Maharashtra',
      city: 'Mumbai',
      spiritualOrator: 'Swami Ji',
      language: 'Hindi',
      branch: 'Mumbai Western Branch',
      beneficiaries: { total: 80, men: 45, women: 30, children: 5 },
      initiation: { total: 80, men: 45, women: 30, children: 5 },
      specialGuests: 2,
      volunteers: 25,
      theme: 'Ram Bhakti',
      specialGuestsList: [
        {
          name: 'Pandit Ram Das',
          phone: '3210987654',
          gender: 'Male',
          designation: 'Spiritual Leader',
          organization: 'Ram Ashram',
          email: 'ramdas@ramashram.org',
          city: 'Ayodhya',
          state: 'Uttar Pradesh',
          personalNo: '12350',
          contactPerson: 'Mrs. Ram Das',
          contactPhone: '3210987655',
          referencePerson: 'Swami Ji',
          referencePhone: '3210987654'
        }
      ],
      volunteersList: [
        {
          name: 'Lakshman Das',
          days: 8,
          seva: 'Seva involved'
        },
        {
          name: 'Bharat Das',
          days: 6,
          seva: 'Seva involved'
        },
        {
          name: 'Shatrughna Das',
          days: 5,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 60000 },
        { type: 'In-kind', details: 'Books 8kg, Clothes 3 sets', amount: 4000 }
      ],
      media: {
        coverageType: 'Local Media',
        organization: 'Mumbai Mirror',
        email: 'mumbai@mumbaimirror.com',
        website: 'www.mumbaimirror.com',
        person: 'Mr. Rajesh Patel',
        designation: 'Reporter',
        contact: '3210987656',
        personEmail: 'rajesh@mumbaimirror.com',
        referencePerson: 'Swami Ji',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Banners', quantity: 6, size: 'A2' },
        { name: 'Pamphlets', quantity: 300, size: 'A4' }
      ]
    },
    {
      id: '6',
      eventType: 'Cultural',
      scale: 'L',
      name: 'Ganesh Chaturthi',
      duration: '15 Sep 2024 - 25 Sep 2024',
      timing: '7:00am - 9:00pm',
      state: 'Maharashtra',
      city: 'Mumbai',
      spiritualOrator: 'Pandit Sharma',
      language: 'Marathi',
      branch: 'Mumbai Western Branch',
      beneficiaries: { total: 200, men: 100, women: 80, children: 20 },
      initiation: { total: 200, men: 100, women: 80, children: 20 },
      specialGuests: 10,
      volunteers: 75,
      theme: 'Ganesh Bhakti',
      specialGuestsList: [
        {
          name: 'Lord Ganesha',
          phone: '9876543210',
          gender: 'Male',
          designation: 'God of Wealth',
          organization: 'Ganesh Temple',
          email: 'ganesh@ganesh.org',
          city: 'Mumbai',
          state: 'Maharashtra',
          personalNo: '12351',
          contactPerson: 'Mataji',
          contactPhone: '9876543211',
          referencePerson: 'Lord Ganesha',
          referencePhone: '9876543210'
        },
        {
          name: 'Sri Krishna',
          phone: '8765432109',
          gender: 'Male',
          designation: 'God of Protection',
          organization: 'Krishna Ashram',
          email: 'krishna@krishna.org',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '12352',
          contactPerson: 'Mataji',
          contactPhone: '8765432110',
          referencePerson: 'Lord Ganesha',
          referencePhone: '9876543210'
        }
      ],
      volunteersList: [
        {
          name: 'Gopal Das',
          days: 10,
          seva: 'Seva involved'
        },
        {
          name: 'Vishnu Das',
          days: 8,
          seva: 'Seva involved'
        },
        {
          name: 'Narayan Das',
          days: 7,
          seva: 'Seva involved'
        },
        {
          name: 'Mohan Das',
          days: 6,
          seva: 'Seva involved'
        },
        {
          name: 'Sita Das',
          days: 5,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 150000 },
        { type: 'In-kind', details: 'Flowers 15kg, Incense 40 packets', amount: 10000 }
      ],
      media: {
        coverageType: 'Local Media',
        organization: 'Mumbai Mirror',
        email: 'mumbai@mumbaimirror.com',
        website: 'www.mumbaimirror.com',
        person: 'Mr. Rajesh Patel',
        designation: 'Reporter',
        contact: '3210987656',
        personEmail: 'rajesh@mumbaimirror.com',
        referencePerson: 'Lord Ganesha',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Banners', quantity: 10, size: 'A2' },
        { name: 'Pamphlets', quantity: 500, size: 'A4' }
      ]
    },
    {
      id: '7',
      eventType: 'Katha',
      scale: 'M',
      name: 'Mahabharat Katha',
      duration: '20 Jun 2024 - 30 Jun 2024',
      timing: '6:30pm - 8:30pm',
      state: 'Delhi',
      city: 'New Delhi',
      spiritualOrator: 'Dr. Rajesh Kumar',
      language: 'Hindi',
      branch: 'Delhi North Branch',
      beneficiaries: { total: 120, men: 70, women: 40, children: 10 },
      initiation: { total: 120, men: 70, women: 40, children: 10 },
      specialGuests: 6,
      volunteers: 50,
      theme: 'Dharma Bhakti',
      specialGuestsList: [
        {
          name: 'Lord Krishna',
          phone: '5432109876',
          gender: 'Male',
          designation: 'God of Love',
          organization: 'Krishna Ashram',
          email: 'krishna@krishna.org',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '12353',
          contactPerson: 'Mataji',
          contactPhone: '5432109877',
          referencePerson: 'Lord Krishna',
          referencePhone: '5432109876'
        },
        {
          name: 'Lord Rama',
          phone: '4321098765',
          gender: 'Male',
          designation: 'God of Courage',
          organization: 'Rama Temple',
          email: 'rama@rama.org',
          city: 'Ayodhya',
          state: 'Uttar Pradesh',
          personalNo: '12354',
          contactPerson: 'Mataji',
          contactPhone: '4321098766',
          referencePerson: 'Lord Krishna',
          referencePhone: '5432109876'
        }
      ],
      volunteersList: [
        {
          name: 'Arjuna Das',
          days: 12,
          seva: 'Seva involved'
        },
        {
          name: 'Bhima Das',
          days: 10,
          seva: 'Seva involved'
        },
        {
          name: 'Nakul Das',
          days: 9,
          seva: 'Seva involved'
        },
        {
          name: 'Sahadev Das',
          days: 8,
          seva: 'Seva involved'
        },
        {
          name: 'Dhritarashtra Das',
          days: 7,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 180000 },
        { type: 'In-kind', details: 'Books 15kg, Clothes 8 sets', amount: 12000 }
      ],
      media: {
        coverageType: 'National Media',
        organization: 'NDTV',
        email: 'delhi@ndtv.com',
        website: 'www.ndtv.com',
        person: 'Ms. Priya Singh',
        designation: 'Senior Reporter',
        contact: '5432109878',
        personEmail: 'priya@ndtv.com',
        referencePerson: 'Lord Rama',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Banners', quantity: 15, size: 'A2' },
        { name: 'Pamphlets', quantity: 800, size: 'A4' }
      ]
    },
    {
      id: '8',
      eventType: 'Cultural',
      scale: 'S',
      name: 'Diwali Celebration',
      duration: '12 Nov 2024 - 12 Nov 2024',
      timing: '6:00pm - 10:00pm',
      state: 'Delhi',
      city: 'New Delhi',
      spiritualOrator: 'Pandit Gupta',
      language: 'Hindi',
      branch: 'Delhi North Branch',
      beneficiaries: { total: 80, men: 40, women: 30, children: 10 },
      initiation: { total: 80, men: 40, women: 30, children: 10 },
      specialGuests: 4,
      volunteers: 35,
      theme: 'Diwali Bhakti',
      specialGuestsList: [
        {
          name: 'Lord Lakshmi',
          phone: '3210987654',
          gender: 'Female',
          designation: 'Goddess of Wealth',
          organization: 'Lakshmi Temple',
          email: 'lakshmi@lakshmi.org',
          city: 'Mumbai',
          state: 'Maharashtra',
          personalNo: '12355',
          contactPerson: 'Lord Ganesha',
          contactPhone: '3210987655',
          referencePerson: 'Lord Lakshmi',
          referencePhone: '3210987654'
        },
        {
          name: 'Lord Hanuman',
          phone: '4321098765',
          gender: 'Male',
          designation: 'God of Strength',
          organization: 'Hanuman Temple',
          email: 'hanuman@hanuman.org',
          city: 'Bangalore',
          state: 'Karnataka',
          personalNo: '12356',
          contactPerson: 'Lord Ganesha',
          contactPhone: '4321098766',
          referencePerson: 'Lord Lakshmi',
          referencePhone: '3210987654'
        }
      ],
      volunteersList: [
        {
          name: 'Sita Das',
          days: 15,
          seva: 'Seva involved'
        },
        {
          name: 'Lakshmi Das',
          days: 12,
          seva: 'Seva involved'
        },
        {
          name: 'Hanuman Das',
          days: 10,
          seva: 'Seva involved'
        },
        {
          name: 'Ganesh Das',
          days: 8,
          seva: 'Seva involved'
        },
        {
          name: 'Krishna Das',
          days: 7,
          seva: 'Seva involved'
        }
      ],
      donations: [
        { type: 'Cash', details: '-', amount: 180000 },
        { type: 'In-kind', details: 'Flowers 15kg, Incense 40 packets', amount: 10000 }
      ],
      media: {
        coverageType: 'Local Media',
        organization: 'Mumbai Mirror',
        email: 'mumbai@mumbaimirror.com',
        website: 'www.mumbaimirror.com',
        person: 'Mr. Rajesh Patel',
        designation: 'Reporter',
        contact: '3210987656',
        personEmail: 'rajesh@mumbaimirror.com',
        referencePerson: 'Lord Lakshmi',
        photos: 'Event photos',
        video: 'Video Coverage',
        pressRelease: 'Press Release',
        testimonials: 'Testimonials'
      },
      promotionalMaterials: [
        { name: 'Banners', quantity: 10, size: 'A2' },
        { name: 'Pamphlets', quantity: 500, size: 'A4' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private eventApiService: EventApiService,
    private confirmationDialog: ConfirmationDialogService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEvents();
    this.initializeFilters();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup debounced search
   */
  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if value changed
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFiltersAndSearch();
    });
  }

  /**
   * Called when search input changes
   */
  onSearchChange(searchValue: string): void {
    this.searchSubject.next(searchValue);
  }

  /**
   * Load events from API
   */
  loadEvents(): void {
    this.loadingEvents = true;
    const status = this.statusFilter === 'all' ? undefined : this.statusFilter;

    this.eventApiService.getEvents(status).subscribe({
      next: (apiEvents) => {
        // Map API events to component EventData format
        this.allEventsData = apiEvents.map(event => this.mapApiEventToEventData(event));
        this.filteredEventsData = []; // Reset filtered data
        this.updatePaginatedEvents();

        // Count drafts (incomplete events)
        this.draftsCount = this.allEventsData.filter(e => e.status === 'incomplete').length;

        this.loadingEvents = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load events. Using sample data.',
          life: 3000
        });
        // Fallback to sample data - ensure all have status
        this.allEventsData = this.allEvents.map(e => ({
          ...e,
          status: e.status || 'incomplete'
        }));
        this.updatePaginatedEvents();
        this.draftsCount = this.allEventsData.filter(e => e.status === 'incomplete').length;
        this.loadingEvents = false;
      }
    });
  }

  /**
   * Update status filter and reload events
   */
  onStatusFilterChange(): void {
    this.first = 0; // Reset to first page
    this.loadEvents();
  }

  /**
   * Continue editing a draft
   */
  continueDraft(eventId: string): void {
    this.router.navigate(['/events/add', eventId]);
  }

  /**
   * Map API EventDetails to component EventData format
   */
  mapApiEventToEventData(event: EventDetails): EventData {
    const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString() : '';
    const endDate = event.end_date ? new Date(event.end_date).toLocaleDateString() : '';
    const duration = startDate && endDate ? `${startDate} - ${endDate}` : '';

    return {
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
      spiritualOrator: event.spiritual_orator || '',
      language: event.language || '',
      branch: event.branch?.name || '',
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
      specialGuests: event.special_guests_count || 0,
      volunteers: event.volunteers_count || 0,
      theme: event.theme || '',
      status: event.status || 'incomplete'
    };
  }

  goToAddEvent() {
    this.router.navigate(['/events/add']);
  }

  // Initialize filters
  initializeFilters(): void {
    this.filters = {
      eventType: '',
      name: '',
      duration: '',
      timing: '',
      state: '',
      city: '',
      branch: '',
      spiritualOrator: '',
      language: '',
      beneficiaries: '',
      initiation: '',
      specialGuests: '',
      volunteers: ''
    };
  }

  // Sorting methods
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  // Filtering methods
  showFilter(column: string): void {
    this.activeFilter = this.activeFilter === column ? null : column;
    this.openDropdown = null; // Close dropdown when opening filter
  }

  clearFilter(column: string): void {
    if (this.filters[column]) {
      this.filters[column] = '';
      this.applyFiltersAndSearch();
    }
  }

  applyFilter(): void {
    // This method is called when filter input changes
    this.applyFiltersAndSearch();
  }

  /**
   * Apply all filters and search
   */
  applyFiltersAndSearch(): void {
    let filtered = [...this.allEventsData];

    // Apply search term (searches in branch, city, state, and name)
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(event => {
        const branchMatch = event.branch?.toLowerCase().includes(searchLower) || false;
        const cityMatch = event.city?.toLowerCase().includes(searchLower) || false;
        const stateMatch = event.state?.toLowerCase().includes(searchLower) || false;
        const nameMatch = event.name?.toLowerCase().includes(searchLower) || false;
        return branchMatch || cityMatch || stateMatch || nameMatch;
      });
    }

    // Apply column filters
    Object.keys(this.filters).forEach(key => {
      const filterValue = this.filters[key];
      if (filterValue && filterValue.toString().trim()) {
        const filterLower = filterValue.toString().toLowerCase().trim();
        filtered = filtered.filter(event => {
          const fieldValue = this.getFieldValue(event, key);
          if (fieldValue === null || fieldValue === undefined) {
            return false;
          }
          return fieldValue.toString().toLowerCase().includes(filterLower);
        });
      }
    });

    this.filteredEventsData = filtered;
    this.first = 0; // Reset to first page when filtering
    this.updatePaginatedEvents();
  }

  /**
   * Get field value from event object
   */
  private getFieldValue(event: EventData, field: string): any {
    switch (field) {
      case 'eventType':
        return `${event.eventType} (${event.scale})`;
      case 'beneficiaries':
        return event.beneficiaries?.total?.toString() || '';
      case 'initiation':
        return event.initiation?.total?.toString() || '';
      case 'specialGuests':
        return event.specialGuests?.toString() || '';
      case 'volunteers':
        return event.volunteers?.toString() || '';
      default:
        return (event as any)[field] || '';
    }
  }

  // Dropdown methods
  toggleDropdown(column: string): void {
    this.openDropdown = this.openDropdown === column ? null : column;
  }

  closeDropdown(): void {
    this.openDropdown = null;
  }

  isDropdownOpen(column: string): boolean {
    return this.openDropdown === column;
  }

  // Action menu methods
  toggleActionMenu(eventId: string): void {
    this.openActionMenu = this.openActionMenu === eventId ? null : eventId;
    this.openDropdown = null; // Close column dropdowns when opening action menu
  }

  closeActionMenu(): void {
    this.openActionMenu = null;
  }

  isActionMenuOpen(eventId: string): boolean {
    return this.openActionMenu === eventId;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event | null): void {
    // Check if event exists and has target
    if (!event || !event.target) {
      return;
    }

    const target = event.target as HTMLElement;

    // Close dropdowns if clicking outside
    if (!target.closest('.dropdown-container') && !target.closest('.action-menu-container')) {
      this.closeDropdown();
      this.closeActionMenu();
    }

    // Close filters if clicking outside
    if (!target.closest('.filter-overlay')) {
      this.activeFilter = null;
    }

    // Close modals if clicking outside
    if (!target.closest('.modal') && !target.closest('.modal-backdrop')) {
      this.closeAllModals();
    }
  }

  // Column pinning methods
  toggleColumnPin(column: string): void {
    const index = this.pinnedColumns.indexOf(column);
    if (index > -1) {
      this.pinnedColumns.splice(index, 1);
    } else {
      this.pinnedColumns.push(column);
    }
    // Close dropdown after pinning/unpinning
    this.closeDropdown();
    // Also close any active filter
    this.activeFilter = null;
  }

  isColumnPinned(column: string): boolean {
    return this.pinnedColumns.includes(column);
  }

  // Update paginated events
  updatePaginatedEvents(): void {
    const start = this.first;
    const end = this.first + this.rows;
    // Use filteredEventsData if filters are applied, otherwise use allEventsData
    const sourceData = this.hasActiveFilters()
      ? this.filteredEventsData
      : this.allEventsData;
    this.events = sourceData.slice(start, end);
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!this.searchTerm || Object.values(this.filters).some(v => v && v.toString().trim());
  }

  // Pagination methods
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows || this.rows; // Keep current rows if not provided
    this.updatePaginatedEvents();
  }

  // Get total records for pagination component
  getTotalRecords(): number {
    const sourceData = this.hasActiveFilters()
      ? this.filteredEventsData
      : this.allEventsData;
    return sourceData.length;
  }

  // Utility methods for the template
  getEventTypeDisplay(event: EventData): string {
    return `${event.eventType}(${event.scale})`;
  }

  getSeverity(scale: string): string {
    switch (scale) {
      case 'S': return 'success';
      case 'M': return 'warning';
      case 'L': return 'danger';
      default: return 'info';
    }
  }

  // Navigation
  addEvent(): void {
    this.router.navigate(['/events/add']);
  }

  // Modal methods
  openSpecialGuestsModal(event: EventData): void {
    this.selectedEvent = event;

    // Fetch full event data with special guests if not already loaded
    if (!event.specialGuestsList || event.specialGuestsList.length === 0) {
      this.eventApiService.getEventById(Number(event.id)).subscribe({
        next: (response) => {
          if (response.specialGuests && response.specialGuests.length > 0) {
            // Map backend format to frontend format
            this.selectedEvent!.specialGuestsList = response.specialGuests.map((sg: any) => ({
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
              referencePhone: 'N/A' // Not in backend model
            }));
          } else {
            this.selectedEvent!.specialGuestsList = [];
          }
          // Force change detection before opening drawer
          this.cdr.detectChanges();
          this.openSpecialGuestsDrawer();
        },
        error: (error) => {
          console.error('Error loading special guests:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load special guests data.',
            life: 3000
          });
          this.selectedEvent!.specialGuestsList = [];
          // Force change detection before opening drawer
          this.cdr.detectChanges();
          this.openSpecialGuestsDrawer();
        }
      });
    } else {
      this.openSpecialGuestsDrawer();
    }
  }

  // Drawer States
  isVolunteerDrawerOpen: boolean = false;
  isBeneficiariesDrawerOpen: boolean = false;
  isInitiationDrawerOpen: boolean = false;
  isSpecialGuestsDrawerOpen: boolean = false;

  openVolunteersModal(event: EventData): void {
    this.selectedEvent = event;

    // Fetch full event data with volunteers if not already loaded
    if (!event.volunteersList || event.volunteersList.length === 0) {
      this.eventApiService.getEventById(Number(event.id)).subscribe({
        next: (response) => {
          if (response.volunteers && response.volunteers.length > 0) {
            // Map backend format to frontend format
            this.selectedEvent!.volunteersList = response.volunteers.map((vol: any) => ({
              branch: vol.branch?.name || 'Branch name',
              name: vol.volunteer_name || vol.name || 'N/A',
              gender: vol.gender || 'N/A', // Not in backend model, will show N/A
              contact: vol.contact || '000000000', // Not in backend model, will show default
              days: vol.number_of_days || vol.days || 0,
              seva: vol.seva_involved || vol.seva || vol.mention_seva || 'Seva involved'
            }));
            // Update volunteer count
            this.selectedEvent!.volunteers = this.selectedEvent!.volunteersList.length;
          } else {
            this.selectedEvent!.volunteersList = [];
            this.selectedEvent!.volunteers = 0;
          }
          // Force change detection before opening drawer
          this.cdr.detectChanges();
          this.openVolunteerDrawer();
        },
        error: (error) => {
          console.error('Error loading volunteers:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load volunteers data.',
            life: 3000
          });
          this.selectedEvent!.volunteersList = [];
          this.selectedEvent!.volunteers = 0;
          // Force change detection before opening drawer
          this.cdr.detectChanges();
          this.openVolunteerDrawer();
        }
      });
    } else {
      // Update volunteer count from list if available
      if (this.selectedEvent.volunteersList && this.selectedEvent.volunteersList.length > 0) {
        this.selectedEvent.volunteers = this.selectedEvent.volunteersList.length;
      }
      this.openVolunteerDrawer();
    }
  }

  // Get volunteer count for display
  getVolunteerCount(): number {
    if (this.selectedEvent?.volunteersList && this.selectedEvent.volunteersList.length > 0) {
      return this.selectedEvent.volunteersList.length;
    }
    return this.selectedEvent?.volunteers || 0;
  }

  // Open Volunteer Drawer
  openVolunteerDrawer(): void {
    // Close any other open drawers first (but not this one)
    if (this.isSpecialGuestsDrawerOpen) this.closeSpecialGuestsDrawer();
    if (this.isBeneficiariesDrawerOpen) this.closeBeneficiariesDrawer();
    if (this.isInitiationDrawerOpen) this.closeInitiationDrawer();

    this.isVolunteerDrawerOpen = true;
    this.lockBodyScroll();

    // Force change detection to render the drawer
    this.cdr.detectChanges();

    // Wait for Angular to render the drawer, then manipulate DOM
    setTimeout(() => {
      const drawers = document.querySelectorAll('.volunteer-drawer');
      const drawer = Array.from(drawers).find(d => d.querySelector('#volunteerDrawerTitle')) as HTMLElement;
      const backdrop = document.querySelector('.volunteer-drawer-backdrop') as HTMLElement;

      if (drawer && backdrop) {
        // Move to body if not already there
        if (drawer.parentElement && drawer.parentElement !== document.body) {
          document.body.appendChild(drawer);
        }
        if (backdrop.parentElement && backdrop.parentElement !== document.body) {
          document.body.appendChild(backdrop);
        }
        // Ensure show class is applied (HTML binding should handle this, but ensure it)
        drawer.classList.add('show');
        // Set accessibility attributes
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-labelledby', 'volunteerDrawerTitle');
        drawer.removeAttribute('aria-hidden');
        backdrop.classList.add('show');
      }
    }, 100);
  }

  ngAfterViewChecked(): void {
    // Ensure drawer and backdrop are at body level when visible
    if (this.isVolunteerDrawerOpen) {
      const drawer = document.querySelector('.volunteer-drawer');
      const backdrop = document.querySelector('.volunteer-drawer-backdrop');

      if (drawer && drawer.parentElement && drawer.parentElement !== document.body) {
        document.body.appendChild(drawer);
      }
      if (backdrop && backdrop.parentElement && backdrop.parentElement !== document.body) {
        document.body.appendChild(backdrop);
      }
    }
  }

  // Close Volunteer Drawer
  closeVolunteerDrawer(): void {
    // Remove show class first to trigger slide-out animation
    const drawers = document.querySelectorAll('.volunteer-drawer');
    const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
    const drawer = Array.from(drawers).find(d => d.querySelector('#volunteerDrawerTitle'));
    const backdrop = backdrops[0];

    if (drawer) {
      drawer.classList.remove('show');
    }
    if (backdrop) {
      backdrop.classList.remove('show');
    }

    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.isVolunteerDrawerOpen = false;
      if (!this.isBeneficiariesDrawerOpen && !this.isInitiationDrawerOpen && !this.isSpecialGuestsDrawerOpen) {
        this.unlockBodyScroll();
      }

      // Remove accessibility attributes when closing
      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        // Remove focus from drawer when closing
        const focusedElement = drawer.querySelector(':focus');
        if (focusedElement) {
          (focusedElement as HTMLElement).blur();
        }
      }
    }, 300);
  }

  // Lock body scroll when drawer is open
  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  // Unlock body scroll when drawer is closed
  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  openBeneficiariesModal(event: EventData): void {
    this.selectedEvent = event;
    this.openBeneficiariesDrawer();
  }

  openInitiationModal(event: EventData): void {
    this.selectedEvent = event;
    this.openInitiationDrawer();
  }

  // Open Beneficiaries Drawer
  openBeneficiariesDrawer(): void {
    // Close any other open drawers first
    this.closeAllDrawers();

    this.isBeneficiariesDrawerOpen = true;
    this.lockBodyScroll();
    this.cdr.detectChanges();

    setTimeout(() => {
      const drawers = document.querySelectorAll('.volunteer-drawer');
      const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
      const drawer = Array.from(drawers).find(d => d.querySelector('#beneficiariesDrawerTitle'));
      const backdrop = backdrops[0];

      if (drawer && drawer.parentElement && drawer.parentElement !== document.body) {
        document.body.appendChild(drawer);
      }
      if (backdrop && backdrop.parentElement && backdrop.parentElement !== document.body) {
        document.body.appendChild(backdrop);
      }

      if (drawer) {
        drawer.classList.add('show');
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-labelledby', 'beneficiariesDrawerTitle');
      }
      if (backdrop) {
        backdrop.classList.add('show');
      }
    }, 10);
  }

  // Close Beneficiaries Drawer
  closeBeneficiariesDrawer(): void {
    const drawers = document.querySelectorAll('.volunteer-drawer');
    const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
    const drawer = Array.from(drawers).find(d => d.querySelector('#beneficiariesDrawerTitle'));
    const backdrop = backdrops[0];

    if (drawer) drawer.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');

    setTimeout(() => {
      this.isBeneficiariesDrawerOpen = false;
      if (!this.isVolunteerDrawerOpen && !this.isInitiationDrawerOpen && !this.isSpecialGuestsDrawerOpen) {
        this.unlockBodyScroll();
      }

      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        const focusedElement = drawer.querySelector(':focus');
        if (focusedElement) {
          (focusedElement as HTMLElement).blur();
        }
      }
    }, 300);
  }

  // Open Initiation Drawer
  openInitiationDrawer(): void {
    // Close any other open drawers first
    this.closeAllDrawers();

    this.isInitiationDrawerOpen = true;
    this.lockBodyScroll();
    this.cdr.detectChanges();

    setTimeout(() => {
      const drawers = document.querySelectorAll('.volunteer-drawer');
      const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
      const drawer = Array.from(drawers).find(d => d.querySelector('#initiationDrawerTitle'));
      const backdrop = backdrops[0];

      if (drawer && drawer.parentElement && drawer.parentElement !== document.body) {
        document.body.appendChild(drawer);
      }
      if (backdrop && backdrop.parentElement && backdrop.parentElement !== document.body) {
        document.body.appendChild(backdrop);
      }

      if (drawer) {
        drawer.classList.add('show');
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-labelledby', 'initiationDrawerTitle');
      }
      if (backdrop) {
        backdrop.classList.add('show');
      }
    }, 10);
  }

  // Close Initiation Drawer
  closeInitiationDrawer(): void {
    const drawers = document.querySelectorAll('.volunteer-drawer');
    const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
    const drawer = Array.from(drawers).find(d => d.querySelector('#initiationDrawerTitle'));
    const backdrop = backdrops[0];

    if (drawer) drawer.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');

    setTimeout(() => {
      this.isInitiationDrawerOpen = false;
      if (!this.isVolunteerDrawerOpen && !this.isBeneficiariesDrawerOpen && !this.isSpecialGuestsDrawerOpen) {
        this.unlockBodyScroll();
      }

      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        const focusedElement = drawer.querySelector(':focus');
        if (focusedElement) {
          (focusedElement as HTMLElement).blur();
        }
      }
    }, 300);
  }

  // Open Special Guests Drawer
  openSpecialGuestsDrawer(): void {
    // Close any other open drawers first (but not this one)
    if (this.isVolunteerDrawerOpen) this.closeVolunteerDrawer();
    if (this.isBeneficiariesDrawerOpen) this.closeBeneficiariesDrawer();
    if (this.isInitiationDrawerOpen) this.closeInitiationDrawer();

    this.isSpecialGuestsDrawerOpen = true;
    this.lockBodyScroll();
    
    // Force change detection to render the drawer
    this.cdr.detectChanges();

    // Wait for Angular to render the drawer, then manipulate DOM
    setTimeout(() => {
      const drawers = document.querySelectorAll('.volunteer-drawer');
      const drawer = Array.from(drawers).find(d => d.querySelector('#specialGuestsDrawerTitle')) as HTMLElement;
      const backdrop = document.querySelector('.volunteer-drawer-backdrop') as HTMLElement;

      if (drawer && backdrop) {
        // Move to body if not already there
        if (drawer.parentElement && drawer.parentElement !== document.body) {
          document.body.appendChild(drawer);
        }
        if (backdrop.parentElement && backdrop.parentElement !== document.body) {
          document.body.appendChild(backdrop);
        }

        // Ensure show class is applied (HTML binding should handle this, but ensure it)
        drawer.classList.add('show');
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-labelledby', 'specialGuestsDrawerTitle');
        drawer.removeAttribute('aria-hidden');
        backdrop.classList.add('show');
      }
    }, 100);
  }

  // Close Special Guests Drawer
  closeSpecialGuestsDrawer(): void {
    const drawers = document.querySelectorAll('.volunteer-drawer');
    const backdrops = document.querySelectorAll('.volunteer-drawer-backdrop');
    const drawer = Array.from(drawers).find(d => d.querySelector('#specialGuestsDrawerTitle'));
    const backdrop = backdrops[0];

    if (drawer) drawer.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');

    setTimeout(() => {
      this.isSpecialGuestsDrawerOpen = false;
      if (!this.isVolunteerDrawerOpen && !this.isBeneficiariesDrawerOpen && !this.isInitiationDrawerOpen) {
        this.unlockBodyScroll();
      }

      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        const focusedElement = drawer.querySelector(':focus');
        if (focusedElement) {
          (focusedElement as HTMLElement).blur();
        }
      }
    }, 300);
  }

  // Close all drawers (helper method)
  private closeAllDrawers(): void {
    if (this.isVolunteerDrawerOpen) this.closeVolunteerDrawer();
    if (this.isBeneficiariesDrawerOpen) this.closeBeneficiariesDrawer();
    if (this.isInitiationDrawerOpen) this.closeInitiationDrawer();
    if (this.isSpecialGuestsDrawerOpen) this.closeSpecialGuestsDrawer();
  }

  /**
   * Helper method to open Bootstrap modal (right-side slide-in)
   */
  private openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      // CRITICAL: Move modal to body level to avoid layout container issues
      // This ensures the modal is not affected by parent overflow/positioning
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      // Add backdrop first
      const existingBackdrop = document.querySelector('.modal-backdrop');
      if (existingBackdrop) {
        existingBackdrop.remove();
      }
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.style.zIndex = '11000'; // Match global backdrop z-index
      // Add click handler to backdrop
      backdrop.addEventListener('click', () => {
        this.closeModal(modalId);
      });
      document.body.appendChild(backdrop);

      // Then show modal
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.zIndex = '11010'; // Match global modal z-index
      // Set aria-hidden to false when modal is open and focused
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      // Trigger animation by forcing reflow
      setTimeout(() => {
        const modalDialog = modal.querySelector('.modal-dialog');
        if (modalDialog) {
          modalDialog.classList.add('show');
        }
      }, 10);
    }
  }

  openMoreDetailsModal(event: EventData): void {
    // Navigate to view page instead of opening modal
    this.router.navigate(['/events/view', event.id]);
  }

   openGallery(event: EventData): void {
     // Navigate to gallery with event ID
     this.router.navigate(['/events/gallery'], { queryParams: { eventId: event.id } });
  }

  // Open media content modal
  openMediaContentModal(mediaType: string): void {
    this.selectedMediaType = mediaType;
    // Close the More Details modal first
    this.closeModal('moreDetailsModal');
    // Open the media content modal
    const modal = document.getElementById('mediaContentModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      // Add backdrop
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  // Close modal methods
  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Remove show class from modal-dialog first to trigger slide-out animation
      const modalDialog = modal.querySelector('.modal-dialog');
      if (modalDialog) {
        modalDialog.classList.remove('show');
      }

      // Wait for animation to complete before hiding modal
      setTimeout(() => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.style.position = '';
        modal.style.top = '';
        modal.style.left = '';
        modal.style.width = '';
        modal.style.height = '';
        modal.style.zIndex = '';
        // Set aria-hidden to true when modal is closed
        modal.setAttribute('aria-hidden', 'true');
        // Remove focus from modal when closing
        const focusedElement = modal.querySelector(':focus');
        if (focusedElement) {
          (focusedElement as HTMLElement).blur();
        }
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }, 300); // Match transition duration
    }
  }

  // Handle backdrop click
  onBackdropClick(event: MouseEvent, modalId: string): void {
    // Only close if clicking directly on the backdrop (modal element, not modal-content)
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('modal')) {
      this.closeModal(modalId);
    }
  }

  // Close media content modal and restore More Details modal if needed
  closeMediaContentModal(): void {
    this.closeModal('mediaContentModal');
    this.selectedMediaType = null;

    // If More Details modal was open, restore it
    if (this.isMoreDetailsModalOpen && this.selectedEvent) {
      setTimeout(() => {
        this.openMoreDetailsModal(this.selectedEvent!);
      }, 100); // Small delay to ensure smooth transition
    }
  }

  // Close all modals
  closeAllModals(): void {
    this.closeBeneficiariesDrawer();
    this.closeInitiationDrawer();
    this.closeSpecialGuestsDrawer();
    this.closeVolunteerDrawer(); // Close drawer instead of modal
    this.closeModal('moreDetailsModal');
    this.closeModal('mediaContentModal');
    this.selectedMediaType = null;
    this.isMoreDetailsModalOpen = false;
  }

  editEvent(eventId: string): void {
    console.log('Edit event:', eventId);
    // Implement edit functionality
  }

  viewEventDetails(eventId: string): void {
    console.log('View event details:', eventId);
    // Implement view details functionality
  }

  downloadEvent(eventId: string): void {
    if (!eventId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Event ID is required for download',
        life: 3000
      });
      return;
    }

    // Call backend API to download event data as PDF
    this.eventApiService.downloadEvent(Number(eventId)).subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `event_${eventId}_${new Date().getTime()}.pdf`;
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

  /**
   * Open export modal
   */
  openExportModal(): void {
    this.isExportModalOpen = true;
    this.openModal('exportExcelModal');
    // Force change detection to ensure calendar components are initialized
    this.cdr.detectChanges();
    // Small delay to ensure modal is fully rendered before calendar can attach
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Close export modal
   */
  closeExportModal(): void {
    this.closeModal('exportExcelModal');
    this.isExportModalOpen = false;
    // Reset dates
    this.exportStartDate = null;
    this.exportEndDate = null;
  }

  /**
   * Set quick date range
   */
  setQuickDateRange(range: string): void {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    this.exportEndDate = new Date(today);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Start of day

    switch (range) {
      case 'lastWeek':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'lastMonth':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'last3Months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'last6Months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'lastYear':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'last2Years':
        startDate.setFullYear(today.getFullYear() - 2);
        break;
      case 'all':
        this.exportStartDate = null;
        this.exportEndDate = null;
        return;
      default:
        return;
    }

    this.exportStartDate = startDate;
  }

  /**
   * Export events to Excel with date range filter
   */
  exportEventsToExcel(): void {
    // Validate date range
    if (this.exportStartDate && this.exportEndDate && this.exportStartDate > this.exportEndDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Start date must be before or equal to end date',
        life: 3000
      });
      return;
    }

    this.exporting = true;
    this.closeExportModal();

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date | null): string | undefined => {
      if (!date) return undefined;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(this.exportStartDate);
    const endDate = formatDate(this.exportEndDate);
    const status = this.statusFilter !== 'all' ? this.statusFilter : undefined;

    this.eventApiService.exportEventsToExcel(startDate, endDate, status).subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename
        let filename = 'events_export';
        if (startDate && endDate) {
          filename = `events_${startDate}_to_${endDate}`;
        } else if (startDate) {
          filename = `events_from_${startDate}`;
        } else if (endDate) {
          filename = `events_until_${endDate}`;
        }
        filename += '.xlsx';
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Events exported to Excel successfully',
          life: 3000
        });
        this.exporting = false;
        // Reset dates after export
        this.exportStartDate = null;
        this.exportEndDate = null;
      },
      error: (error) => {
        console.error('Error exporting events:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to export events to Excel',
          life: 5000
        });
        this.exporting = false;
      }
    });
  }

  deleteEvent(eventId: string): void {
    if (!eventId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Event ID is required for deletion',
        life: 3000
      });
      return;
    }

    // Show confirmation dialog
    this.confirmationDialog.confirmDelete({
      title: 'Delete Event',
      text: 'Are you sure you want to delete this event? This action cannot be undone.',
      showSuccessMessage: false // We'll use PrimeNG message service instead
    }).then((result) => {
      if (result.value) {
      this.eventApiService.deleteEvent(Number(eventId)).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Event deleted successfully',
            life: 3000
          });
          // Reload events list
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.error || 'Failed to delete event',
            life: 5000
          });
        }
      });
    }
    });
  }

  getTooltipText(type: 'beneficiaries' | 'initiation', event: EventData): string {
    const data = event[type];
    return `${data.men} Men, ${data.women} Women, ${data.children} Children`;
  }

  // Helper methods for media content modal
  getMediaModalTitle(): string {
    switch (this.selectedMediaType) {
      case 'photos': return 'Event Photos';
      case 'video': return 'Video Coverage';
      case 'pressRelease': return 'Press Release';
      case 'testimonials': return 'Testimonials';
      default: return 'Media Content';
    }
  }

  /**
   * Export volunteers to Excel
   */
  exportVolunteersToExcel(): void {
    if (!this.selectedEvent || !this.selectedEvent.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No event selected',
        life: 3000
      });
      return;
    }

    this.exportingVolunteers = true;

    this.eventApiService.exportVolunteersToExcel(Number(this.selectedEvent.id)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `volunteers_event_${this.selectedEvent!.id}_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Volunteers exported to Excel successfully',
          life: 3000
        });
        this.exportingVolunteers = false;
      },
      error: (error) => {
        console.error('Error exporting volunteers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to export volunteers to Excel',
          life: 5000
        });
        this.exportingVolunteers = false;
      }
    });
  }

  /**
   * Export special guests to Excel
   */
  exportSpecialGuestsToExcel(): void {
    if (!this.selectedEvent || !this.selectedEvent.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No event selected',
        life: 3000
      });
      return;
    }

    this.exportingSpecialGuests = true;

    this.eventApiService.exportSpecialGuestsToExcel(Number(this.selectedEvent.id)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `special_guests_event_${this.selectedEvent!.id}_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Special guests exported to Excel successfully',
          life: 3000
        });
        this.exportingSpecialGuests = false;
      },
      error: (error) => {
        console.error('Error exporting special guests:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to export special guests to Excel',
          life: 5000
        });
        this.exportingSpecialGuests = false;
      }
    });
  }

  /**
   * Export event media to Excel
   */
  exportEventMediaToExcel(): void {
    if (!this.selectedEvent || !this.selectedEvent.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No event selected',
        life: 3000
      });
      return;
    }

    this.exportingMedia = true;

    this.eventApiService.exportEventMediaToExcel(Number(this.selectedEvent.id)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `event_media_event_${this.selectedEvent!.id}_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event media exported to Excel successfully',
          life: 3000
        });
        this.exportingMedia = false;
      },
      error: (error) => {
        console.error('Error exporting event media:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.error || 'Failed to export event media to Excel',
          life: 5000
        });
        this.exportingMedia = false;
      }
    });
  }

  getMediaContentDescription(): string {
    switch (this.selectedMediaType) {
      case 'photos': return 'View and download event photographs and images captured during the event.';
      case 'video': return 'Watch video recordings and coverage of the event proceedings.';
      case 'pressRelease': return 'Read the official press release and media statements about this event.';
      case 'testimonials': return 'Read testimonials and feedback from participants and attendees.';
      default: return 'View the selected media content.';
    }
  }
}
