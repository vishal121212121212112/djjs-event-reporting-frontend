// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-add-event',
//   templateUrl: './add-event.component.html',
//   styleUrls: ['./add-event.component.scss']
// })
// export class AddEventComponent implements OnInit {

//   currentStep = 1;
//   totalSteps = 3;

//   // Form data for different steps
//   generalDetailsForm: FormGroup;
//   mediaPromotionForm: FormGroup;
//   involvedParticipantsForm: FormGroup;

//   // Dynamic arrays for additional items
//   donationTypes: any[] = [{ type: 'Cash', amount: '', description: '' }];
//   materialTypes: any[] = [{ type: '', quantity: '', size: '', description: '' }];
//   specialGuests: any[] = [];
//   volunteers: any[] = [];

//   // File upload data
//   uploadedFiles: any = {
//     eventPhotos: [],
//     videoCoverage: '',
//     pressRelease: [],
//     testimonials: []
//   };

//   // Dropdown options
//   eventTypes = ['Spiritual', 'Cultural', 'Educational', 'Social Service', 'Others'];
//   kathaTypes = ['Bhagwat Katha', 'Ram Katha', 'Mahabharat Katha', 'Other'];
//   scales = ['Small (S)', 'Medium (M)', 'Large (L)'];
//   languages = ['Hindi', 'English', 'Sanskrit', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
//   countries = ['India', 'USA', 'UK', 'Canada', 'Australia'];
//   states = ['Karnataka', 'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu'];
//   cities = ['Bangalore', 'Mumbai', 'Delhi', 'Lucknow', 'Ahmedabad', 'Chennai'];
//   addressTypes = ['Residential', 'Commercial', 'Temple', 'Community Center', 'Other'];
//   donationTypeOptions = ['Cash', 'In-kind', 'Bank Transfer', 'Cheque'];
//   mediaCoverageTypes = ['Print', 'Digital', 'TV', 'Radio', 'Social Media'];
//   materialTypeOptions = ['Banner', 'Pamphlet', 'Poster', 'Social Media Post', 'TV Advertisement'];
//   materialSizes = ['Small', 'Medium', 'Large', 'Custom'];
//   prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Shri', 'Smt.'];
//   sevaTypes = ['Event Management', 'Catering', 'Decoration', 'Transportation', 'Registration', 'Other'];

//   constructor(
//     private fb: FormBuilder,
//     private router: Router
//   ) { }

//   ngOnInit(): void {
//     this.initializeForms();
//   }

//   initializeForms(): void {
//     // General Details Form - removed validators
//     this.generalDetailsForm = this.fb.group({
//       eventType: ['Spiritual'],
//       eventName: ['Katha'],
//       kathaType: ['Bhagwat Katha'],
//       scale: [''],
//       theme: [''],
//       language: [''],
//       duration: [''],
//       dailyStartTime: [''],
//       dailyEndTime: [''],
//       spiritualOrator: [''],
//       country: [''],
//       pincode: [''],
//       postOffice: ['Karnataka'],
//       thana: [''],
//       tehsil: [''],
//       state: ['Karnataka'],
//       city: ['Bangalore'],
//       addressType: [''],
//       address: [''],
//       prachar: [['Area 1', 'Area 2']],
//       areaCovered: ['0.00'],
//       donationType: ['Cash'],
//       cashAmount: [''],
//       inKindType: [''],
//       inKindItems: [['Rice 5kg', 'bed-sheet - 2']],
//       estimatedAmount: [''],
//       akhandGyan: [''],
//       sellAmount: ['']
//     });

//     // Media & Promotion Form - removed validators
//     this.mediaPromotionForm = this.fb.group({
//       mediaCoverageType: [''],
//       organizationName: [''],
//       mediaEmail: [''],
//       mediaWebsite: [''],
//       prefix: [''],
//       firstName: [''],
//       middleName: [''],
//       lastName: [''],
//       designation: [''],
//       contact: [''],
//       email: [''],
//       referenceBranchId: [''],
//       referenceMemberId: [''],
//       referencePersonName: ['--------'],
//       materialType: [''],
//       quantity: [''],
//       size: [''],
//       eventPhotos: [''],
//       videoCoverage: [''],
//       pressRelease: [''],
//       testimonials: ['']
//     });

//     // Involved Participants Form - removed validators
//     this.involvedParticipantsForm = this.fb.group({
//       specialGuests: this.fb.array([]),
//       beneficiariesMen: [0],
//       beneficiariesWomen: [0],
//       beneficiariesChildren: [0],
//       initiationMen: [0],
//       initiationWomen: [0],
//       initiationChildren: [0],
//       volunteers: this.fb.array([])
//     });
//   }

//   // Add donation type functionality
//   addDonationType(): void {
//     this.donationTypes.push({ type: 'Cash', amount: '', description: '' });
//   }

//   removeDonationType(index: number): void {
//     if (this.donationTypes.length > 1) {
//       this.donationTypes.splice(index, 1);
//     }
//   }

//   // Add material type functionality
//   addMaterialType(): void {
//     this.materialTypes.push({ type: '', quantity: '', size: '', description: '' });
//   }

//   removeMaterialType(index: number): void {
//     if (this.materialTypes.length > 1) {
//       this.materialTypes.splice(index, 1);
//     }
//   }

//   // Add special guest functionality
//   addSpecialGuest(): void {
//     this.specialGuests.push({
//       gender: '',
//       prefix: '',
//       firstName: '',
//       middleName: '',
//       lastName: '',
//       designation: '',
//       organization: '',
//       email: '',
//       contact: '',
//       contactPerson: ''
//     });
//   }

//   removeSpecialGuest(index: number): void {
//     this.specialGuests.splice(index, 1);
//   }

//   // Add volunteer functionality
//   addVolunteer(): void {
//     this.volunteers.push({
//       name: '',
//       days: 0,
//       seva: ''
//     });
//   }

//   removeVolunteer(index: number): void {
//     this.volunteers.splice(index, 1);
//   }

//   // File upload functionality
//   onFileSelected(event: any, fileType: string): void {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       if (fileType === 'eventPhotos' || fileType === 'pressRelease' || fileType === 'testimonials') {
//         this.uploadedFiles[fileType] = Array.from(files);
//       } else {
//         this.uploadedFiles[fileType] = files[0];
//       }
//       console.log(`${fileType} files uploaded:`, this.uploadedFiles[fileType]);
//     }
//   }

//   // Video coverage input
//   onVideoCoverageChange(event: any): void {
//     this.uploadedFiles.videoCoverage = event.target.value;
//   }

//   nextStep(): void {
//     if (this.currentStep < this.totalSteps) {
//       this.currentStep++;
//     }
//   }

//   previousStep(): void {
//     if (this.currentStep > 1) {
//       this.currentStep--;
//     }
//   }

//   goToStep(step: number): void {
//     this.currentStep = step;
//   }

//   // Removed validation check - always allow navigation
//   isStepValid(step: number): boolean {
//     return true; // Always return true to allow navigation
//   }

//   onSubmit(): void {
//     if (this.currentStep === this.totalSteps) {
//       // Collect all form data
//       const formData = {
//         generalDetails: this.generalDetailsForm.value,
//         mediaPromotion: this.mediaPromotionForm.value,
//         involvedParticipants: this.involvedParticipantsForm.value,
//         donationTypes: this.donationTypes,
//         materialTypes: this.materialTypes,
//         specialGuests: this.specialGuests,
//         volunteers: this.volunteers,
//         uploadedFiles: this.uploadedFiles
//       };

//       // Console all details as requested
//       console.log('=== EVENT FORM COMPLETE DATA ===');
//       console.log('General Details:', formData.generalDetails);
//       console.log('Media & Promotion:', formData.mediaPromotion);
//       console.log('Involved Participants:', formData.involvedParticipants);
//       console.log('Donation Types:', formData.donationTypes);
//       console.log('Material Types:', formData.materialTypes);
//       console.log('Special Guests:', formData.specialGuests);
//       console.log('Volunteers:', formData.volunteers);
//       console.log('Uploaded Files:', formData.uploadedFiles);
//       console.log('=== END OF FORM DATA ===');

//       // Navigate back to events list
//       this.router.navigate(['/events']);
//     } else {
//       this.nextStep();
//     }
//   }

//   goBack(): void {
//     this.router.navigate(['/events']);
//   }
// }
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationService, Country, State, District, City } from 'src/app/core/services/location.service';
import { EventMasterDataService, EventType, EventCategory, PromotionMaterialType } from 'src/app/core/services/event-master-data.service';
import { EventDraftService } from 'src/app/core/services/event-draft.service';
import { EventApiService, EventDetails, EventWithRelatedData, SpecialGuest, Volunteer, EventMedia } from 'src/app/core/services/event-api.service';
import { MessageService } from 'primeng/api';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit, OnDestroy {

  currentStep = 1;
  totalSteps = 4;

  // Success and error messages
  successMessage: string = '';
  errorMessage: string = '';

  // Draft ID for draft saving (separate from event ID)
  draftId: string | number | null = null;

  // Event ID for editing existing events/drafts
  eventId: number | null = null;

  // Date pickers for duration
  startDate: Date | null = null;
  endDate: Date | null = null;
  isEditing: boolean = false;
  loadingEvent: boolean = false;

  // Form data for different steps
  generalDetailsForm: FormGroup;
  mediaPromotionForm: FormGroup;
  specialGuestsForm: FormGroup;
  volunteersForm: FormGroup;
  involvedParticipantsForm: FormGroup;

  // Subscriptions for auto-save
  private subscriptions: Subscription[] = [];

  // Dynamic arrays for additional items
  donationTypes: any[] = [
    {
      type: 'cash',
      amount: '',
      tags: [],
      currentInput: '',
      materialValue: ''
    }
  ];

  materialTypes: any[] = [{ type: '', quantity: '', size: '', description: '' }];
  specialGuests: any[] = [];
  volunteers: any[] = [];
  eventMediaList: any[] = [];

  // Getters for template compatibility
  get specialGuestList(): any[] {
    return this.specialGuests;
  }

  get volunteerList(): any[] {
    return this.volunteers;
  }

  get mediaTypes(): string[] {
    return this.mediaCoverageTypes;
  }

  // File upload data
  uploadedFiles: any = {
    eventPhotos: [],
    videoCoverage: '',
    pressRelease: [],
    testimonials: []
  };

  // Mock data for testing
  mockEvents = [
    {
      id: 'EV001',
      eventName: 'Bhagwat Katha - Spiritual Enlightenment',
      eventType: 'Spiritual',
      kathaType: 'Bhagwat Katha',
      scale: 'Large (L)',
      theme: 'Devotional',
      language: 'Hindi',
      duration: '15 Jan 2024 - 20 Jan 2024',
      dailyStartTime: '06:00',
      dailyEndTime: '08:00',
      spiritualOrator: 'Swami Ji',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      address: 'Central Ashram, MG Road, Bangalore',
      areaCovered: '2.5',
      coordinatorName: 'Ramesh Kumar',
      contactNumber: '+91-9876543210',
      email: 'ramesh.kumar@ashram.com'
    },
    {
      id: 'EV002',
      eventName: 'Cultural Festival - Unity in Diversity',
      eventType: 'Cultural',
      kathaType: 'Other',
      scale: 'Medium (M)',
      theme: 'Cultural',
      language: 'English',
      duration: '25 Feb 2024 - 27 Feb 2024',
      dailyStartTime: '17:30',
      dailyEndTime: '20:30',
      spiritualOrator: 'Dr. Anya Sharma',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'Community Center, Bandra West, Mumbai',
      areaCovered: '1.8',
      coordinatorName: 'Priya Singh',
      contactNumber: '+91-8765432109',
      email: 'priya.singh@community.org'
    },
    {
      id: 'EV003',
      eventName: 'Educational Workshop - Life Skills',
      eventType: 'Educational',
      kathaType: 'Other',
      scale: 'Small (S)',
      theme: 'Educational',
      language: 'English',
      duration: '10 Mar 2024 - 12 Mar 2024',
      dailyStartTime: '09:00',
      dailyEndTime: '17:00',
      spiritualOrator: 'Mr. Rohan Verma',
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      address: 'Learning Center, Connaught Place, Delhi',
      areaCovered: '0.8',
      coordinatorName: 'Amit Sharma',
      contactNumber: '+91-7654321098',
      email: 'amit.sharma@learning.org'
    }
  ];

  // Sample data for quick fill
  sampleEventData = {
    eventName: 'Sample Event Name',
    eventType: 'Spiritual',
    kathaType: 'Bhagwat Katha',
    scale: 'Medium (M)',
    theme: 'Devotional',
    language: 'Hindi',
    duration: '01 Apr 2024 - 05 Apr 2024',
    dailyStartTime: '06:00',
    dailyEndTime: '08:00',
    spiritualOrator: 'Swami Ji',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    address: 'Sample Address, Sample City',
    areaCovered: '1.5',
    coordinatorName: 'Sample Coordinator',
    contactNumber: '+91-9999999999',
    email: 'sample@example.com'
  };

  // Dropdown options
  eventTypes: EventType[] = [];
  loadingEventTypes = false;
  eventCategories: EventCategory[] = [];
  filteredEventCategories: EventCategory[] = [];
  loadingEventCategories = false;

  // Event names based on event type
  eventNamesByType: { [key: string]: string[] } = {
    'Spiritual': [
      'Bhagwat Katha',
      'Ram Katha',
      'Mahabharat Katha',
      'Shiv Puran Katha',
      'Devi Bhagwat Katha',
      'Hanuman Chalisa Path',
      'Satsang',
      'Spiritual Discourse',
      'Meditation Session',
      'Prayer Meeting'
    ],
    'Cultural': [
      'Cultural Festival',
      'Dance Performance',
      'Music Concert',
      'Drama/Theatre',
      'Art Exhibition',
      'Literature Meet',
      'Folk Dance',
      'Classical Music',
      'Poetry Recitation'
    ],
    'Educational': [
      'Educational Seminar',
      'Workshop',
      'Training Program',
      'Conference',
      'Skill Development',
      'Career Guidance',
      'Academic Competition',
      'Science Fair',
      'Book Fair'
    ],
    'Social Service': [
      'Blood Donation Camp',
      'Health Check-up Camp',
      'Tree Plantation',
      'Cleanliness Drive',
      'Food Distribution',
      'Clothes Distribution',
      'Educational Support',
      'Disaster Relief',
      'Community Service'
    ],
    'Others': [
      'Community Gathering',
      'Sports Event',
      'Youth Meet',
      'Senior Citizen Meet',
      'Anniversary Celebration',
      'Foundation Day',
      'Inauguration',
      'Award Ceremony',
      'General Meeting'
    ]
  };

  // Katha types based on event name
  kathaTypesByEventName: { [key: string]: string[] } = {
    'Bhagwat Katha': [
      'Bhagwat Puran Katha',
      'Shrimad Bhagwat Katha',
      'Bhagwat Gita Katha',
      'Krishna Leela Katha'
    ],
    'Ram Katha': [
      'Ramayan Katha',
      'Ram Charitra Katha',
      'Tulsi Ramayan',
      'Valmiki Ramayan',
      'Hanuman Katha'
    ],
    'Mahabharat Katha': [
      'Mahabharat Puran',
      'Gita Mahabharat',
      'Pandav Katha',
      'Krishna Mahabharat'
    ],
    'Shiv Puran Katha': [
      'Shiv Mahima Katha',
      'Shiv Charitra',
      'Rudra Katha',
      'Mahadev Katha'
    ],
    'Devi Bhagwat Katha': [
      'Durga Katha',
      'Mata Rani Katha',
      'Devi Mahatmya',
      'Navratri Katha'
    ],
    'Hanuman Chalisa Path': [
      'Hanuman Chalisa Paath',
      'Sundarkand Path',
      'Hanuman Mahima',
      'Bajrang Baan Path'
    ],
    'Satsang': [
      'Spiritual Satsang',
      'Bhajan Satsang',
      'Kirtan Satsang',
      'Gyan Satsang'
    ],
    'Spiritual Discourse': [
      'Dharma Pravachan',
      'Spiritual Talk',
      'Religious Discourse',
      'Vedic Teaching'
    ],
    'Meditation Session': [
      'Guided Meditation',
      'Silent Meditation',
      'Group Meditation',
      'Yoga & Meditation'
    ],
    'Prayer Meeting': [
      'Group Prayer',
      'Evening Prayer',
      'Morning Prayer',
      'Special Prayer'
    ]
  };

  // Available options based on selections
  availableEventNames: string[] = [];
  availableKathaTypes: string[] = [];

  scales = ['Small (S)', 'Medium (M)', 'Large (L)'];
  languages = ['Hindi', 'English', 'Sanskrit', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
  countries: Country[] = [];
  filteredStates: State[] = [];
  filteredDistricts: District[] = [];
  filteredCities: City[] = [];
  loadingCities = false;
  addressTypes = ['Residential', 'Commercial', 'Temple', 'Community Center', 'Other'];
  donationTypeOptions = ['Cash', 'In-kind', 'Bank Transfer', 'Cheque'];
  mediaCoverageTypes = ['Print', 'Digital', 'TV', 'Radio', 'Social Media'];
  materialTypeOptions: string[] = []; // Will be loaded from API
  promotionMaterialTypes: PromotionMaterialType[] = [];
  loadingMaterialTypes = false;
  materialSizes = ['Small', 'Medium', 'Large', 'Custom'];
  prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Shri', 'Smt.'];
  sevaTypes = ['Event Management', 'Catering', 'Decoration', 'Transportation', 'Registration', 'Other'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private eventMasterDataService: EventMasterDataService,
    private eventDraftService: EventDraftService,
    private eventApiService: EventApiService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadEventTypes();

    // Check if we're editing an existing event (from route params)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.eventId = Number(params['id']);
        this.isEditing = true;
        this.loadEventForEditing(this.eventId);
      }
    });
    this.loadEventCategories();
    this.loadPromotionMaterialTypes();
    this.setupCountryChangeListener();
    this.setupStateChangeListener();
    this.setupFormValueChanges();
    this.setupAutoSave();

    // Load countries first, then load draft (draft needs countries list to be populated)
    this.loadCountriesAndThenDraft();
  }

  /**
   * Load countries first, then load draft data
   * This ensures countries list is available when populating draft
   */
  loadCountriesAndThenDraft(): void {
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        // Now that countries are loaded, load draft
        this.loadDraftData();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load countries. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        // Still try to load draft even if countries fail
        this.loadDraftData();
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeForms(): void {
    // General Details Form
    this.generalDetailsForm = this.fb.group({
      eventType: [''],
      eventCategory: [''],
      eventSubCategory: [''],
      eventName: [''],
      kathaType: [''],
      scale: [''],
      theme: [''],
      language: [''],
      duration: [''],
      dailyStartTime: [''],
      dailyEndTime: [''],
      spiritualOrator: [''],
      country: [''],
      pincode: [''],
      postOffice: ['Karnataka'],
      thana: [''],
      tehsil: [''],
      state: ['Karnataka'],
      district: [''],
      city: ['Bangalore'],
      addressType: [''],
      address: [''],
      prachar: [['Area 1', 'Area 2']],
      areaCovered: ['0.00'],
      donationType: ['Cash'],
      cashAmount: [''],
      inKindType: [''],
      inKindItems: [['Rice 5kg', 'bed-sheet - 2']],
      estimatedAmount: [''],
      akhandGyan: [''],
      sellAmount: [''],
      // Beneficiaries fields
      beneficiariesMen: [0],
      beneficiariesWomen: [0],
      beneficiariesChildren: [0],
      // Initiation fields
      initiationMen: [0],
      initiationWomen: [0],
      initiationChildren: [0]
    });

    // Media & Promotion Form
    this.mediaPromotionForm = this.fb.group({
      mediaCoverageType: [''],
      companyName: [''],
      companyEmail: [''],
      companyWebsite: [''],
      mediaGender: [''],
      mediaPrefix: [''],
      mediaFirstName: [''],
      mediaMiddleName: [''],
      mediaLastName: [''],
      mediaDesignation: [''],
      mediaContact: [''],
      mediaEmail: [''],
      referenceBranchId: [''],
      referenceVolunteerId: [''],
      referencePersonName: [''],
      materialType: [''],
      quantity: [''],
      size: [''],
      // File inputs are handled via (change) events, not form controls
      // eventPhotos, videoCoverage, pressRelease, testimonials removed from form
    });

    // Special Guests Form (Step 3)
    this.specialGuestsForm = this.fb.group({
      guestGender: [''],
      guestPrefix: [''],
      guestFirstName: [''],
      guestMiddleName: [''],
      guestLastName: [''],
      guestDesignation: [''],
      guestOrganization: [''],
      guestEmail: [''],
      guestCity: [''],
      guestState: [''],
      guestPersonalNumber: [''],
      guestContactPerson: [''],
      guestContactPersonNumber: [''],
      guestReferenceBranchId: [''],
      guestReferenceVolunteerId: [''],
      guestReferencePersonName: ['']
    });

    // Volunteers Form (Step 4)
    this.volunteersForm = this.fb.group({
      volBranchId: [''],
      volSearchMember: [''],
      volName: [''],
      volContact: [''],
      volDays: [0],
      volSeva: [''],
      volMentionSeva: ['']
    });

    // Involved Participants Form
    this.involvedParticipantsForm = this.fb.group({
      specialGuests: this.fb.array([]),
      beneficiariesMen: [0],
      beneficiariesWomen: [0],
      beneficiariesChildren: [0],
      initiationMen: [0],
      initiationWomen: [0],
      initiationChildren: [0],
      volunteers: this.fb.array([])
    });
  }

  setupFormValueChanges(): void {
    // Listen for event type changes
    this.generalDetailsForm.get('eventType')?.valueChanges.subscribe(eventType => {
      this.onEventTypeChange(eventType);
      // Filter categories when event type changes
      this.filterEventCategoriesByType();
      // Reset event category field when event type changes
      this.generalDetailsForm.patchValue({ eventCategory: '' });
    });

    // Listen for event name changes
    this.generalDetailsForm.get('eventName')?.valueChanges.subscribe(eventName => {
      this.onEventNameChange(eventName);
    });
  }

  /**
   * Setup auto-save for all form groups
   * Auto-save triggers 800ms after user stops typing
   */
  setupAutoSave(): void {
    // Auto-save for generalDetailsForm
    const generalDetailsSub = this.generalDetailsForm.valueChanges
      .pipe(
        debounceTime(800) // Wait 800ms after user stops typing
      )
      .subscribe(value => {
        this.autoSave('generalDetails', value);
      });
    this.subscriptions.push(generalDetailsSub);

    // Auto-save for mediaPromotionForm
    const mediaPromotionSub = this.mediaPromotionForm.valueChanges
      .pipe(
        debounceTime(800)
      )
      .subscribe(value => {
        this.autoSave('mediaPromotion', value);
      });
    this.subscriptions.push(mediaPromotionSub);

    // Auto-save for specialGuestsForm
    const specialGuestsSub = this.specialGuestsForm.valueChanges
      .pipe(
        debounceTime(800)
      )
      .subscribe(value => {
        // Include the specialGuests array in the data
        const data = {
          ...value,
          specialGuestsList: this.specialGuests
        };
        this.autoSave('specialGuests', data);
      });
    this.subscriptions.push(specialGuestsSub);

    // Auto-save for volunteersForm
    const volunteersSub = this.volunteersForm.valueChanges
      .pipe(
        debounceTime(800)
      )
      .subscribe(value => {
        // Include the volunteers array in the data
        const data = {
          ...value,
          volunteersList: this.volunteers
        };
        this.autoSave('volunteers', data);
      });
    this.subscriptions.push(volunteersSub);
  }

  /**
   * Auto-save function
   * Called automatically when user types (after 800ms debounce)
   */
  autoSave(step: string, value: any): void {
    const payload = {
      draftId: this.draftId ?? null, // Changed from eventId to draftId
      step: step as 'generalDetails' | 'mediaPromotion' | 'specialGuests' | 'volunteers',
      data: value
    };

    this.eventDraftService.saveDraft(payload).subscribe({
      next: (response) => {
        // Store the draftId if it's a new draft
        if (response.draftId && !this.draftId) {
          // Ensure draftId is stored as number
          this.draftId = typeof response.draftId === 'number' ? response.draftId : parseInt(String(response.draftId), 10);
          // Save to localStorage for persistence across refreshes
          this.eventDraftService.saveDraftIdToStorage(this.draftId);
        } else if (response.draftId) {
          // Update localStorage
          this.eventDraftService.saveDraftIdToStorage(response.draftId);
        }
        // Silent save - no UI feedback to avoid blocking user
      },
      error: () => {
        // Silent error - don't show validation errors during auto-save
      }
    });
  }

  /**
   * Load draft data from API and populate forms
   */
  loadDraftData(): void {
    // First, try to get draftId from localStorage
    const storedDraftId = this.eventDraftService.getDraftIdFromStorage();

    if (storedDraftId) {
      // Convert stored draftId (string) to number
      this.draftId = parseInt(storedDraftId, 10);

      // Load draft data from API
      this.eventDraftService.getDraft(storedDraftId).subscribe({
        next: (draftData) => {
          this.populateFormsFromDraft(draftData);
        },
        error: (error) => {
          // If draft not found, try to get latest draft from backend
          if (error.status === 404) {
            this.eventDraftService.clearDraftIdFromStorage();
            this.loadLatestDraftFromBackend();
          }
        }
      });
    } else {
      // No draftId in localStorage - try to get latest draft from backend
      // This handles the case when user logs out and logs back in
      this.loadLatestDraftFromBackend();
    }
  }

  /**
   * Load latest draft from backend (for logout/login scenario)
   */
  loadLatestDraftFromBackend(): void {
    this.eventDraftService.getLatestDraft().subscribe({
      next: (draftData) => {
        // Store draftId as number (backend expects number)
        this.draftId = typeof draftData.draftId === 'number' ? draftData.draftId : parseInt(String(draftData.draftId), 10);
        // Save to localStorage for future use (as string for storage)
        this.eventDraftService.saveDraftIdToStorage(this.draftId);
        this.populateFormsFromDraft(draftData);
      },
      error: (error) => {
        // No draft exists - user can start fresh
        this.draftId = null;
      }
    });
  }

  /**
   * Populate all forms with draft data
   */
  populateFormsFromDraft(draftData: any): void {
    // Populate general details form
    if (draftData.generalDetails && Object.keys(draftData.generalDetails).length > 0) {
      const generalDetails = draftData.generalDetails;

      // Store the location values to set after dropdowns are populated
      const countryName = generalDetails.country;
      const stateName = generalDetails.state;
      const districtName = generalDetails.district;
      const cityName = generalDetails.city;

      // Store event type and category separately to handle filtering
      const eventTypeName = generalDetails.eventType;
      const eventCategoryName = generalDetails.eventCategory;

      // Set non-location fields first (without emitting events to prevent listeners from firing)
      const nonLocationFields = { ...generalDetails };
      delete nonLocationFields.country;
      delete nonLocationFields.state;
      delete nonLocationFields.district;
      delete nonLocationFields.city;
      delete nonLocationFields.eventType;
      delete nonLocationFields.eventCategory;

      // Set non-location fields first
      this.generalDetailsForm.patchValue(nonLocationFields, { emitEvent: false });

      // Handle event type and category with proper sequencing
      if (eventTypeName) {
        // Wait for event types to be loaded before filtering categories
        const checkEventTypesLoaded = () => {
          if (this.eventTypes.length > 0) {
            // Set event type first
            this.generalDetailsForm.patchValue({ eventType: eventTypeName }, { emitEvent: false });
            // Filter categories for the selected event type
            this.filterEventCategoriesByType();
            // Set event category after categories are filtered
            if (eventCategoryName) {
              setTimeout(() => {
                if (this.filteredEventCategories.length > 0) {
                  this.generalDetailsForm.patchValue({ eventCategory: eventCategoryName }, { emitEvent: false });
                }
              }, 300);
            }
          } else {
            // If event types not loaded yet, wait and try again
            setTimeout(checkEventTypesLoaded, 100);
          }
        };
        checkEventTypesLoaded();
      }

      // Handle location fields with proper sequencing
      if (countryName) {
        const selectedCountry = this.countries.find(c => c.name === countryName);
        if (selectedCountry) {
          // Load states and districts for the country first
          this.locationService.getStatesByCountry(selectedCountry.id).subscribe({
            next: (states) => {
              this.filteredStates = states;

              // Now set state value and load districts/cities
              if (stateName) {
                const selectedState = this.filteredStates.find(s => s.name === stateName);
                if (selectedState) {
                  // Load districts by state and country
                  this.locationService.getDistrictsByStateAndCountry(selectedState.id, selectedCountry.id).subscribe({
                    next: (districts) => {
                      this.filteredDistricts = districts;

                      // Load cities by state
                      this.locationService.getCitiesByState(selectedState.id).subscribe({
                        next: (cities) => {
                          this.filteredCities = cities;
                          // Now set all location values at once (without emitting events)
                          this.generalDetailsForm.patchValue({
                            country: countryName,
                            state: stateName,
                            district: districtName || '',
                            city: cityName || ''
                          }, { emitEvent: false });
                        },
                        error: () => {
                          // Set values even if cities fail to load
                          this.generalDetailsForm.patchValue({
                            country: countryName,
                            state: stateName,
                            district: districtName || '',
                            city: cityName || ''
                          }, { emitEvent: false });
                        }
                      });
                    },
                    error: () => {
                      // Try to load cities even if districts fail
                      this.locationService.getCitiesByState(selectedState.id).subscribe({
                        next: (cities) => {
                          this.filteredCities = cities;
                        },
                        error: () => { }
                      });
                      // Set values even if districts fail to load
                      this.generalDetailsForm.patchValue({
                        country: countryName,
                        state: stateName,
                        district: districtName || '',
                        city: cityName || ''
                      }, { emitEvent: false });
                    }
                  });
                } else {
                  // State not found, but set values anyway
                  this.generalDetailsForm.patchValue({
                    country: countryName,
                    state: stateName,
                    district: districtName || '',
                    city: cityName || ''
                  }, { emitEvent: false });
                }
              } else {
                // No state, just set country
                this.generalDetailsForm.patchValue({
                  country: countryName
                }, { emitEvent: false });
              }
            },
            error: () => {
              // Set values anyway even if API fails
              this.generalDetailsForm.patchValue({
                country: countryName,
                state: stateName || '',
                district: districtName || '',
                city: cityName || ''
              }, { emitEvent: false });
            }
          });
        } else {
          // Country not found in list, but set values anyway
          this.generalDetailsForm.patchValue({
            country: countryName,
            state: stateName || '',
            district: districtName || '',
            city: cityName || ''
          }, { emitEvent: false });
        }
      } else {
        // No country, just set other location fields if they exist
        this.generalDetailsForm.patchValue({
          state: stateName || '',
          district: districtName || '',
          city: cityName || ''
        }, { emitEvent: false });
      }
    }

    // Handle duration from draft - parse and set date pickers
    if (draftData.generalDetails && draftData.generalDetails.duration) {
      const duration = String(draftData.generalDetails.duration).trim();
      if (duration.includes(' - ')) {
        const dates = duration.split(' - ');
        if (dates.length === 2) {
          try {
            const startDateStr = dates[0].trim();
            const endDateStr = dates[1].trim();
            const start = new Date(startDateStr);
            const end = new Date(endDateStr);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              this.startDate = start;
              this.endDate = end;
              // Update duration string in form
              this.updateDurationString();
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }

    // Populate media promotion form
    if (draftData.mediaPromotion && Object.keys(draftData.mediaPromotion).length > 0) {
      this.mediaPromotionForm.patchValue(draftData.mediaPromotion);
      // Load event media list if it exists
      if (draftData.mediaPromotion.eventMediaList && Array.isArray(draftData.mediaPromotion.eventMediaList)) {
        this.eventMediaList = draftData.mediaPromotion.eventMediaList;
      }
    }

    // Populate special guests
    if (draftData.specialGuests) {
      if (draftData.specialGuests.specialGuestsList && Array.isArray(draftData.specialGuests.specialGuestsList)) {
        this.specialGuests = draftData.specialGuests.specialGuestsList;
      } else if (draftData.specialGuests.specialGuests && Array.isArray(draftData.specialGuests.specialGuests)) {
        this.specialGuests = draftData.specialGuests.specialGuests;
      }
      // Also populate form fields if they exist
      if (draftData.specialGuests.guestGender || draftData.specialGuests.guestPrefix) {
        this.specialGuestsForm.patchValue(draftData.specialGuests);
      }
    }

    // Populate volunteers
    if (draftData.volunteers) {
      if (draftData.volunteers.volunteersList && Array.isArray(draftData.volunteers.volunteersList)) {
        this.volunteers = draftData.volunteers.volunteersList;
      } else if (draftData.volunteers.volunteers && Array.isArray(draftData.volunteers.volunteers)) {
        this.volunteers = draftData.volunteers.volunteers;
      }
      // Also populate form fields if they exist
      if (draftData.volunteers.volBranchId || draftData.volunteers.volName) {
        this.volunteersForm.patchValue(draftData.volunteers);
      }
    }

    this.successMessage = 'Draft data loaded successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  /**
   * Load countries from API
   */
  loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: () => {
        this.errorMessage = 'Failed to load countries. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  /**
   * Load event types from API
   */
  loadEventTypes(): void {
    this.loadingEventTypes = true;
    this.eventMasterDataService.getEventTypes().subscribe({
      next: (eventTypes) => {
        this.eventTypes = eventTypes;
        this.loadingEventTypes = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load event types. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        this.loadingEventTypes = false;
        // Fallback to empty array if API fails
        this.eventTypes = [];
      }
    });
  }

  /**
   * Load promotion material types from API
   */
  loadPromotionMaterialTypes(): void {
    this.loadingMaterialTypes = true;
    this.eventMasterDataService.getPromotionMaterialTypes().subscribe({
      next: (types: PromotionMaterialType[]) => {
        this.promotionMaterialTypes = types;
        // Extract material_type values for dropdown options
        this.materialTypeOptions = types.map(type => type.material_type);
        this.loadingMaterialTypes = false;
      },
      error: (error) => {
        console.error('Error loading promotion material types:', error);
        // Fallback to hardcoded values if API fails
        this.materialTypeOptions = ['Banner', 'Pamphlet', 'Poster', 'Social Media Post', 'TV Advertisement'];
        this.loadingMaterialTypes = false;
      }
    });
  }

  loadEventCategories(): void {
    this.loadingEventCategories = true;
    this.eventMasterDataService.getEventCategories().subscribe({
      next: (categories) => {
        this.eventCategories = categories;
        this.loadingEventCategories = false;
        // Filter categories based on selected event type
        this.filterEventCategoriesByType();
      },
      error: () => {
        this.errorMessage = 'Failed to load event categories. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        this.loadingEventCategories = false;
        // Fallback to empty array if API fails
        this.eventCategories = [];
        this.filteredEventCategories = [];
      }
    });
  }

  /**
   * Filter event categories based on selected event type
   */
  filterEventCategoriesByType(): void {
    const selectedEventTypeName = this.generalDetailsForm.get('eventType')?.value;

    if (!selectedEventTypeName) {
      this.filteredEventCategories = [];
      return;
    }

    // Find the selected event type
    const selectedEventType = this.eventTypes.find(et => et.name === selectedEventTypeName);

    if (selectedEventType) {
      // Filter categories by event_type_id
      this.filteredEventCategories = this.eventCategories.filter(
        cat => cat.event_type_id === selectedEventType.id
      );
    } else {
      this.filteredEventCategories = [];
    }
  }


  /**
   * Load states by country ID from API
   */
  loadStatesByCountry(countryId: number): void {
    this.locationService.getStatesByCountry(countryId).subscribe({
      next: (states) => {
        this.filteredStates = states;
      },
      error: () => {
        this.errorMessage = 'Failed to load states. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        this.filteredStates = [];
      }
    });
  }

  /**
   * Setup listener for country selection changes
   */
  setupCountryChangeListener(): void {
    this.generalDetailsForm.get('country')?.valueChanges.subscribe(selectedCountryName => {
      this.onCountryChange(selectedCountryName);
    });
  }

  /**
   * Load districts by country ID from API
   */
  loadDistrictsByCountry(countryId: number): void {
    this.locationService.getDistrictsByCountry(countryId).subscribe({
      next: (districts) => {
        this.filteredDistricts = districts;
      },
      error: () => {
        this.errorMessage = 'Failed to load districts. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        this.filteredDistricts = [];
      }
    });
  }

  /**
   * Load districts by state ID and country ID from API
   */
  loadDistrictsByStateAndCountry(stateId: number, countryId: number): void {
    this.locationService.getDistrictsByStateAndCountry(stateId, countryId).subscribe({
      next: (districts) => {
        this.filteredDistricts = districts;
      },
      error: () => {
        this.errorMessage = 'Failed to load districts. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        this.filteredDistricts = [];
      }
    });
  }

  /**
   * Load cities by state ID from API
   */
  loadCitiesByState(stateId: number): void {
    this.loadingCities = true;
    this.locationService.getCitiesByState(stateId).subscribe({
      next: (cities) => {
        this.filteredCities = cities;
        this.loadingCities = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load cities. Please refresh the page.';
        setTimeout(() => this.errorMessage = '', 5000);
        this.loadingCities = false;
        this.filteredCities = [];
      }
    });
  }

  /**
   * Setup listener for state selection changes
   */
  setupStateChangeListener(): void {
    this.generalDetailsForm.get('state')?.valueChanges.subscribe(selectedStateName => {
      this.onStateChange(selectedStateName);
    });
  }

  /**
   * Handle country selection change - load states and districts by selected country
   */
  onCountryChange(selectedCountryName: string): void {
    if (!selectedCountryName) {
      // If no country selected, clear states, districts, and cities
      this.filteredStates = [];
      this.filteredDistricts = [];
      this.filteredCities = [];
      // Reset state, district, and city fields
      this.generalDetailsForm.patchValue({ state: '', district: '', city: '' });
      return;
    }

    // Find the selected country object
    const selectedCountry = this.countries.find(c => c.name === selectedCountryName);

    if (selectedCountry) {
      // Load states for the selected country from API
      this.loadStatesByCountry(selectedCountry.id);
      // Load districts for the selected country from API
      this.loadDistrictsByCountry(selectedCountry.id);
      // Clear cities when country changes (will be loaded when state is selected)
      this.filteredCities = [];
      // Reset state, district, and city fields when country changes
      this.generalDetailsForm.patchValue({ state: '', district: '', city: '' });
    } else {
      // If country not found, clear states and districts
      this.filteredStates = [];
      this.filteredDistricts = [];
    }
  }

  /**
   * Handle state selection change - load districts by selected state and country
   */
  onStateChange(selectedStateName: string): void {
    if (!selectedStateName) {
      // If no state selected, load districts filtered by country (if country is selected)
      const selectedCountryName = this.generalDetailsForm.get('country')?.value;
      if (selectedCountryName) {
        const selectedCountry = this.countries.find(c => c.name === selectedCountryName);
        if (selectedCountry) {
          this.loadDistrictsByCountry(selectedCountry.id);
        } else {
          this.filteredDistricts = [];
        }
      } else {
        this.filteredDistricts = [];
      }
      // Reset district and city fields
      this.generalDetailsForm.patchValue({ district: '', city: '' });
      this.filteredCities = [];
      return;
    }

    // Find the selected state object
    const selectedState = this.filteredStates.find(s => s.name === selectedStateName);

    if (selectedState) {
      // Get the selected country to pass both state_id and country_id
      const selectedCountryName = this.generalDetailsForm.get('country')?.value;
      const selectedCountry = this.countries.find(c => c.name === selectedCountryName);

      if (selectedCountry) {
        // Load districts by state_id and country_id from API
        this.loadDistrictsByStateAndCountry(selectedState.id, selectedCountry.id);
      } else {
        // If country not found, clear districts
        this.filteredDistricts = [];
      }
      // Load cities by state_id from API
      this.loadCitiesByState(selectedState.id);
      // Only reset district and city fields if they don't match the new state
      // This prevents clearing when user manually selects a district
      const currentDistrict = this.generalDetailsForm.get('district')?.value;
      const currentCity = this.generalDetailsForm.get('city')?.value;
      if (currentDistrict || currentCity) {
        // Check if current district/city is still valid for the new state
        // If not, reset them
        setTimeout(() => {
          const districtStillValid = this.filteredDistricts.some(d => d.name === currentDistrict);
          const cityStillValid = this.filteredCities.some(c => c.name === currentCity);
          if (!districtStillValid || !cityStillValid) {
            this.generalDetailsForm.patchValue({
              district: districtStillValid ? currentDistrict : '',
              city: cityStillValid ? currentCity : ''
            });
          }
        }, 500);
      }
    } else {
      // If state not found, load districts filtered by country (if country is selected)
      const selectedCountryName = this.generalDetailsForm.get('country')?.value;
      if (selectedCountryName) {
        const selectedCountry = this.countries.find(c => c.name === selectedCountryName);
        if (selectedCountry) {
          this.loadDistrictsByCountry(selectedCountry.id);
        } else {
          this.filteredDistricts = [];
        }
      } else {
        this.filteredDistricts = [];
      }
    }
  }

  onEventTypeChange(eventType: string): void {
    // Reset dependent fields
    this.generalDetailsForm.patchValue({
      eventName: '',
      kathaType: ''
    });

    // Update available event names
    this.availableEventNames = this.eventNamesByType[eventType] || [];
    this.availableKathaTypes = [];
  }

  /**
   * Handle start date change
   */
  onStartDateChange(date: Date | null): void {
    this.startDate = date;
    this.updateDurationString();
  }

  /**
   * Handle end date change
   */
  onEndDateChange(date: Date | null): void {
    this.endDate = date;
    this.updateDurationString();
  }

  /**
   * Update duration string from start and end dates
   */
  updateDurationString(): void {
    if (this.startDate && this.endDate) {
      // Validate that end date is after start date
      if (this.endDate < this.startDate) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Invalid Date Range',
          detail: 'End date must be after start date',
          life: 3000
        });
        // Clear end date if invalid
        this.endDate = null;
        this.generalDetailsForm.patchValue({
          duration: ''
        }, { emitEvent: false });
        return;
      }

      // Format dates to "dd MMM yyyy - dd MMM yyyy" format
      const startDateStr = this.formatDate(this.startDate);
      const endDateStr = this.formatDate(this.endDate);
      const durationString = `${startDateStr} - ${endDateStr}`;

      // Update form control
      this.generalDetailsForm.patchValue({
        duration: durationString
      }, { emitEvent: false });
    } else if (!this.startDate && !this.endDate) {
      // Clear duration if both dates are cleared
      this.generalDetailsForm.patchValue({
        duration: ''
      }, { emitEvent: false });
    }
  }

  /**
   * Get duration display string
   */
  getDurationDisplay(): string {
    if (this.startDate && this.endDate) {
      return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
    }
    return '';
  }

  /**
   * Format date to "dd MMM yyyy" format
   */
  formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  /**
   * Format date range from ISO strings
   */
  formatDateRange(startDateStr: string, endDateStr: string): string {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      }
    } catch (e) {
      // Ignore errors
    }
    return '';
  }

  onEventNameChange(eventName: string): void {
    // Reset katha type
    this.generalDetailsForm.patchValue({
      kathaType: ''
    });

    // Update available katha types
    this.availableKathaTypes = this.kathaTypesByEventName[eventName] || [];

    // If no katha types available for this event name, hide the katha type field
    if (this.availableKathaTypes.length === 0) {
      this.availableKathaTypes = [];
    }
  }

  // Check if katha type field should be visible
  shouldShowKathaType(): boolean {
    const eventType = this.generalDetailsForm.get('eventType')?.value;
    const eventName = this.generalDetailsForm.get('eventName')?.value;

    // Show katha type only for spiritual events with specific event names
    return eventType === 'Spiritual' && this.availableKathaTypes.length > 0;
  }

  // Add donation type functionality
  // addDonationType(): void {
  //   this.donationTypes.push({ type: 'Cash', amount: '', description: '' });
  // }

  // removeDonationType(index: number): void {
  //   if (this.donationTypes.length > 1) {
  //     this.donationTypes.splice(index, 1);
  //   }
  // }

  // Add material type functionality
  addMaterialType(): void {
    this.materialTypes.push({ type: '', quantity: '', size: '', description: '' });
  }

  removeMaterialType(index: number): void {
    if (this.materialTypes.length > 1) {
      this.materialTypes.splice(index, 1);
    }
  }

  // Add special guest functionality
  addSpecialGuest(): void {
    // Collect data from form
    const formValue = this.specialGuestsForm.value;
    this.specialGuests.push({
      gender: formValue.guestGender || '',
      prefix: formValue.guestPrefix || '',
      firstName: formValue.guestFirstName || '',
      middleName: formValue.guestMiddleName || '',
      lastName: formValue.guestLastName || '',
      designation: formValue.guestDesignation || '',
      organization: formValue.guestOrganization || '',
      email: formValue.guestEmail || '',
      city: formValue.guestCity || '',
      state: formValue.guestState || '',
      personalNumber: formValue.guestPersonalNumber || '',
      contactPerson: formValue.guestContactPerson || '',
      contactPersonNumber: formValue.guestContactPersonNumber || '',
      referenceBranchId: formValue.guestReferenceBranchId || '',
      referenceVolunteerId: formValue.guestReferenceVolunteerId || '',
      referencePersonName: formValue.guestReferencePersonName || ''
    });

    // Clear form after adding
    this.specialGuestsForm.reset();

    // Trigger auto-save
    this.autoSave('specialGuests', {
      ...this.specialGuestsForm.value,
      specialGuestsList: this.specialGuests
    });
  }

  removeSpecialGuest(index: number): void {
    this.specialGuests.splice(index, 1);

    // Trigger auto-save after removal
    this.autoSave('specialGuests', {
      ...this.specialGuestsForm.value,
      specialGuestsList: this.specialGuests
    });
  }

  // Add volunteer functionality
  addVolunteer(): void {
    // Collect data from form
    const formValue = this.volunteersForm.value;
    this.volunteers.push({
      branchId: formValue.volBranchId || '',
      searchMember: formValue.volSearchMember || '',
      name: formValue.volName || '',
      contact: formValue.volContact || '',
      days: formValue.volDays || 0,
      seva: formValue.volSeva || '',
      mentionSeva: formValue.volMentionSeva || ''
    });

    // Clear form after adding
    this.volunteersForm.reset();

    // Trigger auto-save
    this.autoSave('volunteers', {
      ...this.volunteersForm.value,
      volunteersList: this.volunteers
    });
  }

  removeVolunteer(index: number): void {
    this.volunteers.splice(index, 1);

    // Trigger auto-save after removal
    this.autoSave('volunteers', {
      ...this.volunteersForm.value,
      volunteersList: this.volunteers
    });
  }

  // Add event media functionality
  addEventMedia(): void {
    // Collect data from form
    const formValue = this.mediaPromotionForm.value;
    this.eventMediaList.push({
      mediaCoverageType: formValue.mediaCoverageType || '',
      companyName: formValue.companyName || '',
      companyEmail: formValue.companyEmail || '',
      companyWebsite: formValue.companyWebsite || '',
      gender: formValue.mediaGender || '',
      designation: formValue.mediaDesignation || '',
      contact: formValue.mediaContact || '',
      referencePersonName: formValue.referencePersonName || ''
    });

    // Clear only the event media related fields after adding
    this.mediaPromotionForm.patchValue({
      mediaCoverageType: '',
      companyName: '',
      companyEmail: '',
      companyWebsite: '',
      mediaGender: '',
      mediaPrefix: '',
      mediaFirstName: '',
      mediaMiddleName: '',
      mediaLastName: '',
      mediaDesignation: '',
      mediaContact: '',
      mediaEmail: '',
      referenceBranchId: '',
      referenceVolunteerId: '',
      referencePersonName: ''
    }, { emitEvent: false });

    // Trigger auto-save after adding
    this.autoSave('mediaPromotion', {
      ...this.mediaPromotionForm.value,
      eventMediaList: this.eventMediaList
    });
  }

  removeEventMedia(index: number): void {
    this.eventMediaList.splice(index, 1);

    // Trigger auto-save after removal
    this.autoSave('mediaPromotion', {
      ...this.mediaPromotionForm.value,
      eventMediaList: this.eventMediaList
    });
  }

  // File upload functionality
  onFileSelected(event: any, fileType: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (fileType === 'eventPhotos' || fileType === 'pressRelease' || fileType === 'testimonials') {
        this.uploadedFiles[fileType] = Array.from(files);
      } else {
        this.uploadedFiles[fileType] = files[0];
      }
    }
  }

  // Video coverage input
  onVideoCoverageChange(event: any): void {
    this.uploadedFiles.videoCoverage = event.target.value;
  }

  nextStep(): void {
    // Save current step before moving to next
    this.saveCurrentStep();
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    // Save current step before moving to previous
    this.saveCurrentStep();
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Save current step data immediately
   */
  saveCurrentStep(): void {
    let step: 'generalDetails' | 'mediaPromotion' | 'specialGuests' | 'volunteers';
    let data: any;

    switch (this.currentStep) {
      case 1:
        step = 'generalDetails';
        data = this.generalDetailsForm.value;
        break;
      case 2:
        step = 'mediaPromotion';
        data = {
          ...this.mediaPromotionForm.value,
          eventMediaList: this.eventMediaList
        };
        break;
      case 3:
        step = 'specialGuests';
        data = {
          ...this.specialGuestsForm.value,
          specialGuestsList: this.specialGuests
        };
        break;
      case 4:
        step = 'volunteers';
        data = {
          ...this.volunteersForm.value,
          volunteersList: this.volunteers
        };
        break;
      default:
        return;
    }

    const payload = {
      draftId: this.draftId ?? null, // Changed from eventId to draftId
      step,
      data
    };

    this.eventDraftService.saveDraft(payload).subscribe({
      next: (response) => {
        if (response.draftId && !this.draftId) {
          this.draftId = response.draftId;
        }
      },
      error: () => {
      }
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  isStepValid(step: number): boolean {
    return true;
  }

  /**
   * Load event data for editing
   */
  loadEventForEditing(eventId: number): void {
    this.loadingEvent = true;
    this.eventApiService.getEventById(eventId).subscribe({
      next: (response: EventWithRelatedData) => {
        this.populateFormsFromEvent(response);
        this.loadingEvent = false;
        this.messageService.add({
          severity: 'info',
          summary: 'Event Loaded',
          detail: 'Event data loaded. You can continue editing.',
          life: 3000
        });
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loadingEvent = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load event data.',
          life: 3000
        });
      }
    });
  }

  /**
   * Populate forms with event data
   */
  populateFormsFromEvent(response: EventWithRelatedData): void {
    const event = response.event;
    // Parse duration dates - handle both date string and Date object
    let startDate = '';
    let endDate = '';

    if (event.start_date) {
      try {
        const start = new Date(event.start_date);
        startDate = start.toISOString().split('T')[0];
      } catch (e) {
        startDate = event.start_date.split('T')[0]; // If already in ISO format
      }
    }

    if (event.end_date) {
      try {
        const end = new Date(event.end_date);
        endDate = end.toISOString().split('T')[0];
      } catch (e) {
        endDate = event.end_date.split('T')[0]; // If already in ISO format
      }
    }

    // Wait for event types to load before setting values
    if (this.eventTypes.length === 0) {
      // If event types not loaded yet, wait a bit
      setTimeout(() => this.populateFormsFromEvent(response), 500);
      return;
    }

    // Set date pickers if we have dates
    if (startDate && endDate) {
      try {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
          this.startDate = startDateObj;
          this.endDate = endDateObj;
          // Update duration string
          this.updateDurationString();
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Update general details form
    this.generalDetailsForm.patchValue({
      eventType: event.event_type?.name || '',
      eventCategory: event.event_category?.name || '',
      scale: event.scale || '',
      theme: event.theme || '',
      duration: startDate && endDate ? this.formatDateRange(startDate, endDate) : '',
      dailyStartTime: event.daily_start_time || '',
      dailyEndTime: event.daily_end_time || '',
      spiritualOrator: event.spiritual_orator || '',
      country: event.country || '',
      state: event.state || '',
      district: event.district || '',
      city: event.city || '',
      pincode: event.pincode || '',
      postOffice: event.post_office || '',
      address: event.address || ''
    });

    // Update involved participants form
    this.involvedParticipantsForm.patchValue({
      beneficiariesMen: event.beneficiary_men || 0,
      beneficiariesWomen: event.beneficiary_women || 0,
      beneficiariesChildren: event.beneficiary_child || 0,
      initiationMen: event.initiation_men || 0,
      initiationWomen: event.initiation_women || 0,
      initiationChildren: event.initiation_child || 0
    });

    // Trigger event type change to load categories
    if (event.event_type?.name) {
      setTimeout(() => {
        this.onEventTypeChange(event.event_type!.name);
      }, 300);
    }

    // Populate special guests array
    if (response.specialGuests && response.specialGuests.length > 0) {
      this.specialGuests = response.specialGuests.map((sg: SpecialGuest) => ({
        gender: sg.gender || '',
        prefix: sg.prefix || '',
        firstName: sg.first_name || '',
        middleName: sg.middle_name || '',
        lastName: sg.last_name || '',
        designation: sg.designation || '',
        organization: sg.organization || '',
        email: sg.email || '',
        city: sg.city || '',
        state: sg.state || '',
        personalNumber: sg.personal_number || '',
        contactPerson: sg.contact_person || '',
        contactPersonNumber: sg.contact_person_number || '',
        referenceBranchId: sg.reference_branch_id || '',
        referenceVolunteerId: sg.reference_volunteer_id || '',
        referencePersonName: sg.reference_person_name || ''
      }));
    }

    // Populate volunteers array
    if (response.volunteers && response.volunteers.length > 0) {
      this.volunteers = response.volunteers.map((vol: any) => ({
        branchId: vol.branch_id?.toString() || '',
        searchMember: vol.search_member || '',
        name: vol.volunteer_name || vol.name || '',
        contact: vol.contact || '',
        days: vol.number_of_days || vol.days || 0,
        seva: vol.seva_involved || vol.seva || '',
        mentionSeva: vol.mention_seva || ''
      }));
    }

    // Populate event media list
    if (response.media && response.media.length > 0) {
      this.eventMediaList = response.media.map((media: EventMedia) => ({
        companyName: media.company_name || '',
        companyEmail: media.company_email || '',
        companyWebsite: media.company_website || '',
        gender: media.gender || '',
        prefix: media.prefix || '',
        firstName: media.first_name || '',
        middleName: media.middle_name || '',
        lastName: media.last_name || '',
        designation: media.designation || '',
        contact: media.contact || '',
        email: media.email || '',
        mediaType: media.media_coverage_type_id?.toString() || '',
        referenceVolunteerId: '' // Not stored in EventMedia model
      }));
    }
  }

  /**
   * Map form data to API format
   * @param isDraft If true, validation is more lenient (allows missing fields)
   */
  mapFormDataToApiFormat(isDraft: boolean = false): any {
    const generalDetails = this.generalDetailsForm.value;
    const involvedParticipants = this.involvedParticipantsForm.value;
    const mediaPromotion = this.mediaPromotionForm.value;

    // Validate required fields (only for final submission, not for drafts)
    if (!isDraft) {
      if (!generalDetails.eventType) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Event Type is required.',
          life: 3000
        });
        throw new Error('Event Type is required');
      }

      if (!generalDetails.eventCategory) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Event Category is required.',
          life: 3000
        });
        throw new Error('Event Category is required');
      }
    }

    // Parse duration string to start_date and end_date
    let startDate: string | undefined;
    let endDate: string | undefined;
    let durationString: string | undefined;

    if (generalDetails.duration) {
      const duration = String(generalDetails.duration).trim();

      // Check if duration is in the correct format (contains " - ")
      if (duration.includes(' - ')) {
        const dates = duration.split(' - ');
        if (dates.length === 2) {
          const startDateStr = dates[0].trim();
          const endDateStr = dates[1].trim();

          // Convert date format from "dd MMM yyyy" to "YYYY-MM-DD"
          try {
            const startDateObj = new Date(startDateStr);
            const endDateObj = new Date(endDateStr);

            if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
              startDate = startDateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
              endDate = endDateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
              durationString = duration; // Keep original format for backend
            } else {
              // Invalid date format - only throw if not a draft
              if (!isDraft) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Validation Error',
                  detail: 'Duration must be in format: "dd MMM yyyy - dd MMM yyyy" (e.g., "01 Jan 2024 - 05 Jan 2024")',
                  life: 5000
                });
                throw new Error('Invalid duration format');
              }
              // For drafts, just use the string as-is
              durationString = duration;
            }
          } catch (e) {
            // If parsing fails and not a draft, show error
            if (!isDraft) {
              this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Duration must be in format: "dd MMM yyyy - dd MMM yyyy" (e.g., "01 Jan 2024 - 05 Jan 2024")',
                life: 5000
              });
              throw new Error('Invalid duration format');
            }
            // For drafts, just use the string as-is
            durationString = duration;
          }
        } else {
          if (!isDraft) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validation Error',
              detail: 'Duration must include both start and end dates separated by " - "',
              life: 5000
            });
            throw new Error('Invalid duration format');
          }
          // For drafts, don't send invalid duration
          durationString = '';
        }
      } else {
        // Duration doesn't contain " - "
        if (!isDraft) {
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Duration must be in format: "dd MMM yyyy - dd MMM yyyy" (e.g., "01 Jan 2024 - 05 Jan 2024")',
            life: 5000
          });
          throw new Error('Invalid duration format');
        }
        // For drafts, don't send invalid duration - send empty string
        durationString = '';
      }
    } else {
      // Duration is required only for final submission
      if (!isDraft) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Duration is required. Please enter dates in format: "dd MMM yyyy - dd MMM yyyy" (e.g., "01 Jan 2024 - 05 Jan 2024")',
          life: 5000
        });
        throw new Error('Duration is required');
      }
      // For drafts, duration can be empty - set to empty string
      durationString = '';
    }

    // Final check: if durationString is still undefined and not a draft, it's an error
    if (!isDraft && !durationString) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Duration is required. Please enter dates in format: "dd MMM yyyy - dd MMM yyyy" (e.g., "01 Jan 2024 - 05 Jan 2024")',
        life: 5000
      });
      throw new Error('Duration is required');
    }

    // Return in the format expected by backend (nested structure)
    // Backend expects all fields, even if empty
    return {
      generalDetails: {
        eventType: generalDetails.eventType || '', // Send name, backend will look up ID
        eventCategory: generalDetails.eventCategory || '', // Send name, backend will look up ID
        scale: generalDetails.scale || '',
        theme: generalDetails.theme || '',
        duration: durationString || '', // Backend will parse this to start_date and end_date (empty if invalid)
        dailyStartTime: generalDetails.dailyStartTime || '',
        dailyEndTime: generalDetails.dailyEndTime || '',
        spiritualOrator: generalDetails.spiritualOrator || '',
        country: generalDetails.country || '',
        state: generalDetails.state || '',
        district: generalDetails.district || '',
        city: generalDetails.city || '',
        pincode: generalDetails.pincode || '',
        postOffice: generalDetails.postOffice || '',
        address: generalDetails.address || ''
      },
      involvedParticipants: {
        // Read from generalDetailsForm since these fields are in step 1
        beneficiariesMen: generalDetails.beneficiariesMen || involvedParticipants.beneficiariesMen || 0,
        beneficiariesWomen: generalDetails.beneficiariesWomen || involvedParticipants.beneficiariesWomen || 0,
        beneficiariesChildren: generalDetails.beneficiariesChildren || involvedParticipants.beneficiariesChildren || 0,
        initiationMen: generalDetails.initiationMen || involvedParticipants.initiationMen || 0,
        initiationWomen: generalDetails.initiationWomen || involvedParticipants.initiationWomen || 0,
        initiationChildren: generalDetails.initiationChildren || involvedParticipants.initiationChildren || 0
      },
      mediaPromotion: {
        ...mediaPromotion,
        eventMediaList: this.eventMediaList || []
      },
      donationTypes: this.donationTypes || [],
      materialTypes: this.materialTypes || [],
      specialGuests: this.specialGuests || [],
      volunteers: this.volunteers || [],
      uploadedFiles: this.uploadedFiles || {}
    };
  }

  /**
   * Helper to get event type ID from name
   */
  getEventTypeId(name: string): number | undefined {
    const type = this.eventTypes.find(t => t.name === name);
    return type?.id;
  }

  /**
   * Helper to get event category ID from name
   */
  getEventCategoryId(name: string): number | undefined {
    const category = this.filteredEventCategories.find(c => c.name === name);
    return category?.id;
  }

  /**
   * Save as draft (incomplete status)
   */
  saveAsDraft(): void {
    try {
      // For drafts, use lenient validation (isDraft = true)
      const eventData = this.mapFormDataToApiFormat(true);

      // Add status and draftId to the payload
      const payload: any = {
        ...eventData,
        status: 'incomplete'
      };

      // Only add draftId if it's a valid number
      if (this.draftId) {
        const draftIdNum = typeof this.draftId === 'string' ? parseInt(this.draftId, 10) : this.draftId;
        if (!isNaN(draftIdNum) && draftIdNum > 0) {
          payload.draftId = draftIdNum;
        }
      }

      if (this.isEditing && this.eventId) {
        // Update existing event as draft
        this.eventApiService.updateEvent(this.eventId, payload, 'incomplete').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Draft Saved',
              detail: 'Event saved as draft successfully.',
              life: 3000
            });
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error saving draft:', error);
            const errorMessage = error?.error?.error || error?.message || 'Failed to save draft.';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000
            });
          }
        });
      } else {
        // Create new event as draft
        this.eventApiService.createEvent(payload, 'incomplete').subscribe({
          next: (event) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Draft Saved',
              detail: 'Event saved as draft successfully.',
              life: 3000
            });
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error creating draft:', error);
            const errorMessage = error?.error?.error || error?.message || 'Failed to save draft.';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000
            });
          }
        });
      }
    } catch (error: any) {
      // Validation error caught in mapFormDataToApiFormat
      // Error message already shown
      console.error('Error in saveAsDraft:', error);
    }
  }

  /**
   * Submit event as complete
   */
  onSubmit(): void {
    if (this.currentStep === this.totalSteps) {
      try {
        // For final submission, use strict validation (isDraft = false)
        const eventData = this.mapFormDataToApiFormat(false);

        // Add status and draftId to the payload
        // Only include draftId if it exists and is a valid number
        const payload: any = {
          ...eventData,
          status: 'complete'
        };

        // Only add draftId if it's a valid number (not null, undefined, or 0)
        // Convert to number if it's a string
        if (this.draftId) {
          const draftIdNum = typeof this.draftId === 'string' ? parseInt(this.draftId, 10) : this.draftId;
          if (!isNaN(draftIdNum) && draftIdNum > 0) {
            payload.draftId = draftIdNum;
          }
        }

        if (this.isEditing && this.eventId) {
          // Update existing event and mark as complete
          this.eventApiService.updateEvent(this.eventId, payload, 'complete').subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Event submitted successfully.',
                life: 3000
              });
              // Clear draft after successful submission
              this.eventDraftService.clearDraftIdFromStorage();
              this.draftId = null;
              this.router.navigate(['/events']);
            },
            error: (error) => {
              console.error('Error updating event:', error);
              const errorMessage = error?.error?.error || error?.message || 'Failed to submit event.';
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
              });
            }
          });
        } else {
          // Create new event as complete
          console.log('Submitting event with payload:', JSON.stringify(payload, null, 2));
          this.eventApiService.createEvent(payload, 'complete').subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Event submitted successfully.',
                life: 3000
              });
              // Clear draft after successful submission
              this.eventDraftService.clearDraftIdFromStorage();
              this.draftId = null;
              this.router.navigate(['/events']);
            },
            error: (error) => {
              console.error('Error creating event:', error);
              console.error('Error response:', error?.error);
              const errorMessage = error?.error?.error || error?.message || 'Failed to submit event.';
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
              });
            }
          });
        }
      } catch (error: any) {
        // Validation error caught in mapFormDataToApiFormat
        // Error message already shown
        console.error('Validation error in onSubmit:', error);
        // Don't proceed with submission if validation fails
        return;
      }
    } else {
      this.nextStep();
    }
  }

  goBack(): void {
    // Save current step before closing
    this.saveCurrentStep();
    // Don't clear draft - keep it for when user returns
    // User can continue editing the same draft later
    this.router.navigate(['/events']);
  }

  /**
   * Clear current draft and start fresh
   */
  clearDraftAndStartFresh(): void {
    // Clear draft from localStorage
    this.eventDraftService.clearDraftIdFromStorage();
    this.draftId = null;

    // Reset all forms
    this.generalDetailsForm.reset();
    this.mediaPromotionForm.reset();
    this.specialGuestsForm.reset();
    this.volunteersForm.reset();
    this.involvedParticipantsForm.reset();

    // Clear all lists
    this.eventMediaList = [];
    this.specialGuests = [];
    this.volunteers = [];
    this.donationTypes = [{ type: 'cash', amount: '', tags: [], currentInput: '', materialValue: '' }];
    this.materialTypes = [{ type: '', quantity: '', size: '', description: '' }];

    // Clear location filter arrays
    this.filteredStates = [];
    this.filteredDistricts = [];
    this.filteredCities = [];

    // Clear arrays
    this.specialGuests = [];
    this.volunteers = [];
    this.donationTypes = [{
      type: 'cash',
      amount: '',
      tags: [],
      currentInput: '',
      materialValue: ''
    }];
    this.materialTypes = [{ type: '', quantity: '', size: '', description: '' }];

    // Reset to first step
    this.currentStep = 1;

    this.successMessage = 'Draft cleared. You can now start a new event.';
    setTimeout(() => this.successMessage = '', 3000);
  }

  // Mock data methods for testing
  fillWithSampleData(): void {
    this.generalDetailsForm.patchValue({
      eventName: this.sampleEventData.eventName,
      eventType: this.sampleEventData.eventType,
      kathaType: this.sampleEventData.kathaType,
      scale: this.sampleEventData.scale,
      theme: this.sampleEventData.theme,
      language: this.sampleEventData.language,
      duration: this.sampleEventData.duration,
      dailyStartTime: this.sampleEventData.dailyStartTime,
      dailyEndTime: this.sampleEventData.dailyEndTime,
      spiritualOrator: this.sampleEventData.spiritualOrator,
      country: this.sampleEventData.country,
      city: this.sampleEventData.city,
      address: this.sampleEventData.address,
      areaCovered: this.sampleEventData.areaCovered
    });

    // Set state after country is set to ensure proper filtering
    setTimeout(() => {
      this.generalDetailsForm.patchValue({ state: this.sampleEventData.state });
    }, 100);

    this.mediaPromotionForm.patchValue({
      organizationName: 'Sample Organization',
      mediaEmail: 'media@sample.org',
      mediaWebsite: 'www.sample.org',
      prefix: 'Mr.',
      firstName: 'Sample',
      lastName: 'Coordinator',
      designation: 'Event Coordinator',
      contact: '+91-9999999999',
      email: 'sample@example.com'
    });

    this.involvedParticipantsForm.patchValue({
      beneficiariesMen: 50,
      beneficiariesWomen: 45,
      beneficiariesChildren: 25,
      initiationMen: 15,
      initiationWomen: 12,
      initiationChildren: 8
    });

    this.successMessage = 'Sample data loaded successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  fillWithRandomMockData(): void {
    const randomIndex = Math.floor(Math.random() * this.mockEvents.length);
    const randomEvent = this.mockEvents[randomIndex];

    this.generalDetailsForm.patchValue({
      eventName: randomEvent.eventName,
      eventType: randomEvent.eventType,
      kathaType: randomEvent.kathaType,
      scale: randomEvent.scale,
      theme: randomEvent.theme,
      language: randomEvent.language,
      duration: randomEvent.duration,
      dailyStartTime: randomEvent.dailyStartTime,
      dailyEndTime: randomEvent.dailyEndTime,
      spiritualOrator: randomEvent.spiritualOrator,
      country: randomEvent.country,
      city: randomEvent.city,
      address: randomEvent.address,
      areaCovered: randomEvent.areaCovered
    });

    // Set state after country is set to ensure proper filtering
    setTimeout(() => {
      this.generalDetailsForm.patchValue({ state: randomEvent.state });
    }, 100);

    this.mediaPromotionForm.patchValue({
      organizationName: randomEvent.coordinatorName,
      mediaEmail: randomEvent.email,
      mediaWebsite: 'www.' + randomEvent.city.toLowerCase() + 'events.org',
      prefix: 'Mr.',
      firstName: randomEvent.coordinatorName.split(' ')[0],
      lastName: randomEvent.coordinatorName.split(' ')[1] || '',
      designation: 'Event Coordinator',
      contact: randomEvent.contactNumber,
      email: randomEvent.email
    });

    this.involvedParticipantsForm.patchValue({
      beneficiariesMen: Math.floor(Math.random() * 100) + 20,
      beneficiariesWomen: Math.floor(Math.random() * 80) + 15,
      beneficiariesChildren: Math.floor(Math.random() * 50) + 10,
      initiationMen: Math.floor(Math.random() * 30) + 5,
      initiationWomen: Math.floor(Math.random() * 25) + 5,
      initiationChildren: Math.floor(Math.random() * 20) + 3
    });

    this.successMessage = `Random mock data loaded: ${randomEvent.eventName}`;
    setTimeout(() => this.successMessage = '', 3000);
  }

  quickFillEventType(eventType: string): void {
    let eventData: any = {};

    switch (eventType) {
      case 'spiritual':
        eventData = {
          eventName: 'Bhagwat Katha - Spiritual Enlightenment',
          eventType: 'Spiritual',
          kathaType: 'Bhagwat Katha',
          scale: 'Large (L)',
          theme: 'Devotional',
          language: 'Hindi',
          duration: '15 Jan 2024 - 20 Jan 2024',
          dailyStartTime: '06:00',
          dailyEndTime: '08:00',
          spiritualOrator: 'Swami Ji',
          country: 'India',
          state: 'Karnataka',
          city: 'Bangalore',
          address: 'Central Ashram, MG Road, Bangalore',
          areaCovered: '2.5'
        };
        break;
      case 'cultural':
        eventData = {
          eventName: 'Cultural Festival - Unity in Diversity',
          eventType: 'Cultural',
          kathaType: 'Other',
          scale: 'Medium (M)',
          theme: 'Cultural',
          language: 'English',
          duration: '25 Feb 2024 - 27 Feb 2024',
          dailyStartTime: '17:30',
          dailyEndTime: '20:30',
          spiritualOrator: 'Dr. Anya Sharma',
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai',
          address: 'Community Center, Bandra West, Mumbai',
          areaCovered: '1.8'
        };
        break;
      case 'educational':
        eventData = {
          eventName: 'Educational Workshop - Life Skills',
          eventType: 'Educational',
          kathaType: 'Other',
          scale: 'Small (S)',
          theme: 'Educational',
          language: 'English',
          duration: '10 Mar 2024 - 12 Mar 2024',
          dailyStartTime: '09:00',
          dailyEndTime: '17:00',
          spiritualOrator: 'Mr. Rohan Verma',
          country: 'India',
          state: 'Delhi',
          city: 'New Delhi',
          address: 'Learning Center, Connaught Place, Delhi',
          areaCovered: '0.8'
        };
        break;
    }

    if (Object.keys(eventData).length > 0) {
      const stateValue = eventData.state;
      delete eventData.state; // Remove state temporarily

      this.generalDetailsForm.patchValue(eventData);

      // Set state after country is set to ensure proper filtering
      setTimeout(() => {
        this.generalDetailsForm.patchValue({ state: stateValue });
      }, 100);

      this.successMessage = `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} event data loaded!`;
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  clearAllForms(): void {
    this.generalDetailsForm.reset();
    this.mediaPromotionForm.reset();
    this.involvedParticipantsForm.reset();
    this.donationTypes = [{ type: 'Cash', amount: '', description: '' }];
    this.materialTypes = [{ type: '', quantity: '', size: '', description: '' }];
    this.specialGuests = [];
    this.volunteers = [];
    this.uploadedFiles = {
      eventPhotos: [],
      videoCoverage: '',
      pressRelease: [],
      testimonials: []
    };
    this.successMessage = 'All forms cleared successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }
  // Add these methods to your component class:

  // Add these methods to your component class:
  // Add these methods to your component class:

  onDonationTypeChange(index: number): void {
    const donation = this.donationTypes[index];

    // Clear fields when switching types
    if (donation.type === 'cash') {
      donation.tags = [];
      donation.currentInput = '';
      donation.materialValue = '';
    } else if (donation.type === 'in-kind') {
      donation.amount = '';
    }
  }

  onTagInputKeydown(event: KeyboardEvent, donationIndex: number): void {
    const donation = this.donationTypes[donationIndex];

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      const inputValue = donation.currentInput.trim();
      if (inputValue && !donation.tags.includes(inputValue)) {
        donation.tags.push(inputValue);
        donation.currentInput = '';
      }
    }
  }

  removeTag(donationIndex: number, tagIndex: number): void {
    this.donationTypes[donationIndex].tags.splice(tagIndex, 1);
  }

  addDonationType(): void {
    this.donationTypes.push({
      type: 'cash',
      amount: '',
      tags: [],
      currentInput: '',
      materialValue: ''
    });
  }

  removeDonationType(index: number): void {
    if (this.donationTypes.length > 1) {
      this.donationTypes.splice(index, 1);
    }
  }
}
