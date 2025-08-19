import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
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
    name: string;
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
}

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {

  // PrimeNG Table Configuration
  events: EventData[] = [];
  
  // Pagination
  first = 0;
  rows = 5;
  rowsPerPageOptions = [5, 10, 20];
  
  // Sorting
  sortField: string = '';
  sortOrder: number = 1;
  
  // Filtering - using custom filter system
  filters: { [key: string]: any } = {};
  
  // Column pinning
  pinnedColumns: string[] = [];
  
  // Additional filtering methods
  activeFilter: string | null = null;
  
  // Dropdown management
  openDropdown: string | null = null;
  
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
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.events = [...this.allEvents];
    this.initializeFilters();
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
    }
  }

  applyFilter(): void {
    // This method will be called when filter input changes
    // The filtering is handled automatically by PrimeNG
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

  // Close dropdown when clicking outside
  @HostListener('document:click')
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close dropdowns if clicking outside
    if (!target.closest('.dropdown-container')) {
      this.closeDropdown();
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

  // Pagination methods
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
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
    const modal = document.getElementById('specialGuestsModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  openVolunteersModal(event: EventData): void {
    this.selectedEvent = event;
    const modal = document.getElementById('volunteersModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  openBeneficiariesModal(event: EventData): void {
    this.selectedEvent = event;
    const modal = document.getElementById('beneficiariesModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  openInitiationModal(event: EventData): void {
    this.selectedEvent = event;
    const modal = document.getElementById('initiationModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  openMoreDetailsModal(event: EventData): void {
    // this.selectedEvent = event;
    // this.isMoreDetailsModalOpen = true; // Track that More Details modal is open
    // // Use a more reliable method to open the modal
    // const modal = document.getElementById('moreDetailsModal');
    // if (modal) {
    //   modal.classList.add('show');
    //   modal.style.display = 'block';
    //   modal.setAttribute('aria-hidden', 'false');
    //   // Add backdrop
    //   document.body.classList.add('modal-open');
    //   const backdrop = document.createElement('div');
    //   backdrop.className = 'modal-backdrop fade show';
    //   document.body.appendChild(backdrop);
    // }
     this.router.navigate(['/view']);
  }

   openGallery(event: EventData): void {   
     this.router.navigate(['/gallery']);
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
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      // Remove backdrop
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
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
    this.closeModal('beneficiariesModal');
    this.closeModal('initiationModal');
    this.closeModal('specialGuestsModal');
    this.closeModal('volunteersModal');
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
    console.log('Download event:', eventId);
    // Implement download functionality
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
