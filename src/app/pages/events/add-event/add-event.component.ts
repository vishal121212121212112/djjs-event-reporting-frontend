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
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationService, Country, State, District, City } from 'src/app/core/services/location.service';
import { EventMasterDataService, EventType, EventCategory, PromotionMaterialType } from 'src/app/core/services/event-master-data.service';
import { EventDraftService } from 'src/app/core/services/event-draft.service';
import { EventApiService, EventDetails, EventWithRelatedData, SpecialGuest, Volunteer, EventMedia } from 'src/app/core/services/event-api.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ValidationSettingsService } from 'src/app/core/services/validation-settings.service';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit, OnDestroy {

  currentStep = 1;
  totalSteps = 4;

  // Form submission flag for validation display
  formSubmitted: boolean = false;

  // Success and error messages
  successMessage: string = '';
  errorMessage: string = '';

  // Draft ID for draft saving (separate from event ID)
  draftId: string | number | null = null;

  // Event ID for editing existing events/drafts
  eventId: number | null = null;

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

  // Volunteer search suggestions
  volunteerSuggestions: Volunteer[] = [];
  showVolunteerSuggestions: boolean = false;
  searchingVolunteers: boolean = false;

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

  // File metadata for display and draft storage
  fileMetadata: any = {
    eventPhotos: [],
    videoCoverage: null,
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
    private toastService: ToastService,
    public validationSettings: ValidationSettingsService
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
      eventType: ['', Validators.required],
      eventCategory: ['', Validators.required],
      eventSubCategory: [''],
      eventName: [''],
      kathaType: [''],
      scale: [''],
      theme: [''],
      language: [''],
      startDate: [''],
      endDate: [''],
      duration: ['', Validators.required],
      dailyStartTime: [''],
      dailyEndTime: [''],
      spiritualOrator: [''],
      country: ['', Validators.required],
      pincode: [''],
      postOffice: ['Karnataka'],
      thana: [''],
      policeStation: [''],
      tehsil: [''],
      state: ['Karnataka', Validators.required],
      district: [''],
      city: ['Bangalore', Validators.required],
      addressType: [''],
      address: ['', Validators.required],
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

    // Subscribe to volunteer search member field changes
    this.volunteersForm.get('volSearchMember')?.valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(searchTerm => {
        const trimmedTerm = searchTerm?.trim() || '';
        // Only search if term is 2+ characters and not just whitespace
        if (trimmedTerm.length >= 2) {
          this.searchVolunteers(trimmedTerm);
        } else {
          this.volunteerSuggestions = [];
          this.showVolunteerSuggestions = false;
          this.searchingVolunteers = false;
        }
      });
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
              // Set form controls with date strings in YYYY-MM-DD format
              const startDateFormatted = start.toISOString().split('T')[0];
              const endDateFormatted = end.toISOString().split('T')[0];
              this.generalDetailsForm.patchValue({
                startDate: startDateFormatted,
                endDate: endDateFormatted
              }, { emitEvent: false });
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
      // Extract fileMetadata before patching form (to avoid form control issues)
      const fileMetadata = draftData.mediaPromotion.fileMetadata;
      const formData = { ...draftData.mediaPromotion };
      delete formData.fileMetadata; // Remove fileMetadata from form data

      this.mediaPromotionForm.patchValue(formData);

      // Restore file metadata for display
      if (fileMetadata) {
        this.fileMetadata = {
          eventPhotos: fileMetadata.eventPhotos || [],
          videoCoverage: fileMetadata.videoCoverage || null,
          pressRelease: fileMetadata.pressRelease || [],
          testimonials: fileMetadata.testimonials || []
        };
      }

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
  onStartDateChange(): void {
    this.updateDurationString();
  }

  /**
   * Handle end date change
   */
  onEndDateChange(): void {
    this.updateDurationString();
  }

  /**
   * Update duration string from start and end dates
   */
  updateDurationString(): void {
    const startDateStr = this.generalDetailsForm.get('startDate')?.value;
    const endDateStr = this.generalDetailsForm.get('endDate')?.value;

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Validate that end date is after start date
      if (endDate < startDate) {
        this.toastService.warning('End date must be after start date', 'Invalid Date Range');
        // Clear end date if invalid
        this.generalDetailsForm.patchValue({
          endDate: '',
          duration: ''
        }, { emitEvent: false });
        return;
      }

      // Format dates to "dd MMM yyyy - dd MMM yyyy" format
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
      const durationString = `${formattedStartDate} - ${formattedEndDate}`;

      // Update form control
      this.generalDetailsForm.patchValue({
        duration: durationString
      }, { emitEvent: false });
    } else if (!startDateStr && !endDateStr) {
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
    const startDateStr = this.generalDetailsForm.get('startDate')?.value;
    const endDateStr = this.generalDetailsForm.get('endDate')?.value;

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
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

  // Search volunteers for suggestions
  searchVolunteers(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 2) {
      this.volunteerSuggestions = [];
      this.showVolunteerSuggestions = false;
      this.searchingVolunteers = false;
      return;
    }

    this.searchingVolunteers = true;
    // Show suggestions dropdown while searching
    this.showVolunteerSuggestions = true;
    
    // Get branch code from form if available
    const branchCode = this.volunteersForm?.get('volBranchId')?.value || '';
    this.eventApiService.searchVolunteers(searchTerm, branchCode).subscribe({
      next: (volunteers) => {
        console.log('[AddEventComponent] Received volunteers:', volunteers);
        this.volunteerSuggestions = volunteers || [];
        // Keep dropdown open if there are results or if we want to show "no results" message
        this.showVolunteerSuggestions = true;
        this.searchingVolunteers = false;
      },
      error: (error) => {
        console.error('[AddEventComponent] Error searching volunteers:', error);
        this.volunteerSuggestions = [];
        // Still show dropdown to display error or "no results" message
        this.showVolunteerSuggestions = true;
        this.searchingVolunteers = false;
      }
    });
  }

  // Select a volunteer from suggestions
  selectVolunteer(volunteer: Volunteer): void {
    const volunteerName = volunteer.volunteer_name || volunteer.name || '';
    // Get branch code from branch object or branch_id
    const branchCode = volunteer.branch?.name || volunteer.branch_id || '';
    
    console.log('[AddEventComponent] Selecting volunteer:', { volunteer, branchCode });
    
    // Close suggestions first to prevent any blur events
    this.showVolunteerSuggestions = false;
    this.volunteerSuggestions = [];
    
    // Temporarily disable valueChanges to prevent triggering search when setting volSearchMember
    const searchControl = this.volunteersForm.get('volSearchMember');
    if (searchControl) {
      // Set the search field to the volunteer name (for display) without triggering search
      searchControl.setValue(volunteerName, { emitEvent: false });
    }
    
    // Set all form fields without triggering events
    this.volunteersForm.patchValue({
      volName: volunteerName,
      volContact: volunteer.contact || '',
      volBranchId: branchCode
    }, { emitEvent: false });
    
    console.log('[AddEventComponent] Form updated with volunteer data');
  }

  // Hide suggestions when clicking outside
  hideVolunteerSuggestions(): void {
    // Use a longer timeout to allow mousedown events to fire first
    setTimeout(() => {
      // Only hide if user is not interacting with dropdown
      if (!this.searchingVolunteers) {
        this.showVolunteerSuggestions = false;
      }
    }, 300);
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

  // File upload functionality - stores files to upload after event creation
  onFileInputChange(event: any, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    // Store files to upload after event creation
    if (fileType === 'eventPhotos' || fileType === 'pressRelease' || fileType === 'testimonials') {
      this.uploadedFiles[fileType] = files;
      // Store file metadata for display and draft
      this.fileMetadata[fileType] = files.map((file: File) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
    } else {
      this.uploadedFiles[fileType] = files[0];
      // Store file metadata for display and draft
      this.fileMetadata[fileType] = {
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        lastModified: files[0].lastModified
      };
    }

    // Trigger auto-save to include file metadata in draft
    this.saveFileMetadataToDraft();

    // Show message
    this.toastService.info(`${files.length} file(s) selected. They will be uploaded when you save the event.`, 'Files Selected');

    // Reset input
    input.value = '';
  }

  // Save file metadata to draft
  saveFileMetadataToDraft(): void {
    const mediaPromotionData = {
      ...this.mediaPromotionForm.value,
      fileMetadata: this.fileMetadata
    };
    this.autoSave('mediaPromotion', mediaPromotionData);
  }

  // Remove file from selection
  removeFile(fileType: string, index?: number): void {
    if (fileType === 'videoCoverage') {
      this.uploadedFiles[fileType] = '';
      this.fileMetadata[fileType] = null;
    } else {
      if (index !== undefined) {
        this.uploadedFiles[fileType].splice(index, 1);
        this.fileMetadata[fileType].splice(index, 1);
      } else {
        this.uploadedFiles[fileType] = [];
        this.fileMetadata[fileType] = [];
      }
    }
    // Update draft
    this.saveFileMetadataToDraft();
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Legacy method for compatibility
  onFileSelected(event: any, fileType: string): void {
    this.onFileInputChange(event, fileType);
  }

  // Video coverage input
  onVideoCoverageChange(event: any): void {
    this.uploadedFiles.videoCoverage = event.target.value;
  }

  // Track upload status
  uploadInProgress: boolean = false;
  uploadQueue: Array<{ file: File; category: string; eventId: number }> = [];
  uploadResults: Array<{ file: File; success: boolean; error?: string }> = [];

  /**
   * Upload files to S3 after event creation
   * This is called after event is successfully created
   */
  uploadFilesAfterEventCreation(eventId: number): void {
    // Build upload queue
    this.uploadQueue = [];
    this.uploadResults = [];
    this.uploadInProgress = true;

    // Add event photos to queue
    if (this.uploadedFiles.eventPhotos && Array.isArray(this.uploadedFiles.eventPhotos) && this.uploadedFiles.eventPhotos.length > 0) {
      this.uploadedFiles.eventPhotos.forEach((file: File) => {
        this.uploadQueue.push({ file, category: 'Event Photos', eventId });
      });
    }

    // Add video coverage to queue
    if (this.uploadedFiles.videoCoverage && this.uploadedFiles.videoCoverage instanceof File) {
      this.uploadQueue.push({ file: this.uploadedFiles.videoCoverage, category: 'Video Coverage', eventId });
    }

    // Add press release to queue
    if (this.uploadedFiles.pressRelease && Array.isArray(this.uploadedFiles.pressRelease) && this.uploadedFiles.pressRelease.length > 0) {
      this.uploadedFiles.pressRelease.forEach((file: File) => {
        this.uploadQueue.push({ file, category: 'Press Release', eventId });
      });
    }

    // Add testimonials to queue
    if (this.uploadedFiles.testimonials && Array.isArray(this.uploadedFiles.testimonials) && this.uploadedFiles.testimonials.length > 0) {
      this.uploadedFiles.testimonials.forEach((file: File) => {
        this.uploadQueue.push({ file, category: 'Testimonials', eventId });
      });
    }

    // If no files to upload, return
    if (this.uploadQueue.length === 0) {
      this.uploadInProgress = false;
      return;
    }

    // Show upload started message
    this.toastService.info(`Uploading ${this.uploadQueue.length} file(s) to S3...`, 'Upload Started');

    // Upload files sequentially to avoid overwhelming the server
    this.uploadFilesSequentially(0);
  }

  /**
   * Upload files sequentially to S3
   */
  uploadFilesSequentially(index: number): void {
    if (index >= this.uploadQueue.length) {
      // All files processed
      this.uploadInProgress = false;
      this.handleUploadCompletion();
      return;
    }

    const { file, category, eventId } = this.uploadQueue[index];

    this.eventApiService.uploadFile(file, eventId, undefined, category).subscribe({
      next: (response) => {
        console.log(`File uploaded successfully: ${file.name}`, response);
        this.uploadResults.push({ file, success: true });
        this.toastService.success(`${file.name} uploaded to S3 successfully`, 'Upload Success');

        // Upload next file
        this.uploadFilesSequentially(index + 1);
      },
      error: (error) => {
        console.error(`Upload error for ${file.name}:`, error);
        const errorMessage = error?.error?.error || error?.message || 'Unknown error';
        this.uploadResults.push({ file, success: false, error: errorMessage });
        this.toastService.error(`Failed to upload ${file.name}: ${errorMessage}`, 'Upload Failed');

        // Continue with next file even if this one failed
        this.uploadFilesSequentially(index + 1);
      }
    });
  }

  /**
   * Handle upload completion
   */
  handleUploadCompletion(): void {
    const successful = this.uploadResults.filter(r => r.success).length;
    const failed = this.uploadResults.filter(r => !r.success).length;

    if (failed === 0) {
      this.toastService.success(`All ${successful} file(s) uploaded to S3 successfully!`, 'Upload Complete');
      // Clear uploaded files after successful upload
      this.clearUploadedFiles();
    } else {
      this.toastService.warning(
        `${successful} file(s) uploaded successfully, ${failed} file(s) failed. Please try uploading failed files again.`,
        'Upload Partially Complete'
      );
    }

    // Log upload summary
    console.log('Upload Summary:', {
      total: this.uploadResults.length,
      successful,
      failed,
      results: this.uploadResults
    });
  }

  /**
   * Clear uploaded files after successful upload
   */
  clearUploadedFiles(): void {
    this.uploadedFiles = {
      eventPhotos: [],
      videoCoverage: '',
      pressRelease: [],
      testimonials: []
    };
    this.fileMetadata = {
      eventPhotos: [],
      videoCoverage: null,
      pressRelease: [],
      testimonials: []
    };
  }

  nextStep(): void {
    // Mark form as submitted for validation display
    this.formSubmitted = true;

    // Validate current step before moving to next (only if validation is enabled)
    if (this.validationSettings.isValidationEnabled()) {
      if (this.currentStep === 1) {
        // Mark all fields as touched to show validation errors
        this.markFormGroupTouched(this.generalDetailsForm);

        if (this.generalDetailsForm.invalid) {
          // Show toast message if validation is enabled
          if (this.validationSettings.shouldShowToastErrors()) {
            const errors = this.getFormValidationErrors(this.generalDetailsForm);
            this.toastService.validationError('Please fill in all required fields in General Details.', errors);
          }
          // If strict mode is enabled, block navigation
          if (this.validationSettings.isStrictMode()) {
            return;
          }
        }
      } else if (this.currentStep === 2) {
        // Media promotion step - no required validations for now
      } else if (this.currentStep === 3) {
        // Special guests step - no required validations for now
      } else if (this.currentStep === 4) {
        // Volunteers step - no required validations for now
      }
    }

    // Save current step before moving to next
    this.saveCurrentStep();
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.formSubmitted = false; // Reset for next step
    }
  }

  /**
   * Mark all fields in a form group as touched to show validation errors
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Helper method to check if a field is invalid and should show error
   */
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.generalDetailsForm): boolean {
    // Check if validation is enabled and should show field errors
    if (!this.validationSettings.shouldShowFieldErrors()) {
      return false;
    }
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.formSubmitted));
  }

  /**
   * Helper method to get error message for a field
   */
  getFieldError(fieldName: string, formGroup: FormGroup = this.generalDetailsForm): string {
    if (!this.validationSettings.shouldShowFieldErrors()) {
      return '';
    }
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.touched || this.formSubmitted)) {
      if (field.errors['required']) {
        return `${fieldName} is required.`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address.';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid value.';
      }
    }
    return '';
  }

  /**
   * Get all validation errors from a form group
   */
  getFormValidationErrors(formGroup: FormGroup): string[] {
    const errors: string[] = [];
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.invalid && (control.touched || this.formSubmitted)) {
        const fieldName = this.formatFieldName(key);
        if (control.errors?.['required']) {
          errors.push(`${fieldName} is required`);
        }
        if (control.errors?.['email']) {
          errors.push(`${fieldName} must be a valid email`);
        }
        if (control.errors?.['pattern']) {
          errors.push(`${fieldName} has invalid format`);
        }
      }
    });
    return errors;
  }

  /**
   * Format field name for display (e.g., 'eventType' -> 'Event Type')
   */
  formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
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
        this.toastService.info('Event data loaded. You can continue editing.', 'Event Loaded');
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loadingEvent = false;
        this.toastService.error('Failed to load event data.', 'Error');
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

    // Update general details form
    this.generalDetailsForm.patchValue({
      eventType: event.event_type?.name || '',
      eventCategory: event.event_category?.name || '',
      scale: event.scale || '',
      theme: event.theme || '',
      startDate: startDate || '',
      endDate: endDate || '',
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
    if (!isDraft && this.validationSettings.isValidationEnabled()) {
      if (!generalDetails.eventType) {
        if (this.validationSettings.shouldShowToastErrors()) {
          this.toastService.validationError('Event Type is required.');
        }
        throw new Error('Event Type is required');
      }

      if (!generalDetails.eventCategory) {
        if (this.validationSettings.shouldShowToastErrors()) {
          this.toastService.validationError('Event Category is required.');
        }
        throw new Error('Event Category is required');
      }
    }

    // Get start and end dates from form controls
    const startDateValue = generalDetails.startDate || '';
    const endDateValue = generalDetails.endDate || '';
    let startDate: string | undefined;
    let endDate: string | undefined;
    let durationString: string | undefined;

    if (startDateValue && endDateValue) {
      // Dates are already in YYYY-MM-DD format from the date input
      startDate = startDateValue;
      endDate = endDateValue;

      // Format duration string for backend (dd MMM yyyy - dd MMM yyyy)
      try {
        const startDateObj = new Date(startDateValue);
        const endDateObj = new Date(endDateValue);
        if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
          durationString = `${this.formatDate(startDateObj)} - ${this.formatDate(endDateObj)}`;
        } else {
          durationString = '';
        }
      } catch (e) {
        durationString = '';
      }
    } else {
      // Duration is required only for final submission
      if (!isDraft && this.validationSettings.isValidationEnabled()) {
        if (this.validationSettings.shouldShowToastErrors()) {
          this.toastService.validationError('Duration is required. Please select both start and end dates.');
        }
        throw new Error('Duration is required');
      }
      // For drafts, duration can be empty
      durationString = '';
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
            this.toastService.success('Event saved as draft successfully.', 'Draft Saved');
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error saving draft:', error);
            const errorMessage = error?.error?.error || error?.message || 'Failed to save draft.';
            this.toastService.error(errorMessage, 'Error');
          }
        });
      } else {
        // Create new event as draft
        this.eventApiService.createEvent(payload, 'incomplete').subscribe({
          next: (eventResponse: any) => {
            // Get event ID from response
            const newEventId = eventResponse?.id || eventResponse?.data?.id || eventResponse?.event?.id;

            if (newEventId) {
              this.eventId = newEventId;
              // Upload files to S3 after event creation (even for drafts)
              this.uploadFilesAfterEventCreation(newEventId);
            }

            this.toastService.success('Event saved as draft successfully.', 'Draft Saved');
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error creating draft:', error);
            const errorMessage = error?.error?.error || error?.message || 'Failed to save draft.';
            this.toastService.error(errorMessage, 'Error');
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
      // Mark all forms as submitted for validation display
      this.formSubmitted = true;

      // Validate all forms (only if validation is enabled)
      if (this.validationSettings.isValidationEnabled()) {
        // Mark all fields as touched to show validation errors
        this.markFormGroupTouched(this.generalDetailsForm);

        // Validate all forms
        let isValid = true;

        if (this.generalDetailsForm.invalid) {
          isValid = false;
        }

        if (!isValid) {
          // Show toast message with validation errors if validation is enabled
          if (this.validationSettings.shouldShowToastErrors()) {
            const errors = this.getFormValidationErrors(this.generalDetailsForm);
            this.toastService.validationError('Please fill in all required fields before submitting.', errors);
          }
          // If strict mode is enabled, block submission
          if (this.validationSettings.isStrictMode()) {
            return;
          }
        }
      }

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
          // Upload files if any new files were selected
          this.uploadFilesAfterEventCreation(this.eventId);

          // Update existing event and mark as complete
          this.eventApiService.updateEvent(this.eventId, payload, 'complete').subscribe({
            next: () => {
              this.toastService.success('Event submitted successfully.', 'Success');
              // Clear draft after successful submission
              this.eventDraftService.clearDraftIdFromStorage();
              this.draftId = null;
              this.router.navigate(['/events']);
            },
            error: (error) => {
              console.error('Error updating event:', error);
              const errorMessage = error?.error?.error || error?.message || 'Failed to submit event.';
              this.toastService.error(errorMessage, 'Error');
            }
          });
        } else {
          // Create new event as complete
          console.log('Submitting event with payload:', JSON.stringify(payload, null, 2));
          this.eventApiService.createEvent(payload, 'complete').subscribe({
            next: (eventResponse: any) => {
              // Get event ID from response
              const newEventId = eventResponse?.id || eventResponse?.data?.id || eventResponse?.event?.id;

              if (newEventId) {
                this.eventId = newEventId;
                // Upload files to S3 after event creation
                this.uploadFilesAfterEventCreation(newEventId);
              }

              this.toastService.success('Event submitted successfully.', 'Success');
              // Clear draft after successful submission
              this.eventDraftService.clearDraftIdFromStorage();
              this.draftId = null;
              this.router.navigate(['/events']);
            },
            error: (error) => {
              console.error('Error creating event:', error);
              console.error('Error response:', error?.error);
              const errorMessage = error?.error?.error || error?.message || 'Failed to submit event.';
              this.toastService.error(errorMessage, 'Error');
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
    this.fileMetadata = {
      eventPhotos: [],
      videoCoverage: null,
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

  /**
   * Handle toast close event
   */
  onToastClose(event: any): void {
    // Optional: Handle toast close if needed
  }

  /**
   * Handle toast click event - make toasts interactive
   */
  onToastClick(event: any): void {
    const message = event.message;
    if (message && message.data && message.data.onClick) {
      // Execute custom click handler if provided
      if (typeof message.data.onClick === 'function') {
        message.data.onClick();
      }
    } else if (message && message.severity === 'error' && message.summary === 'Validation Error') {
      // For validation errors, scroll to first invalid field
      const firstInvalidField = document.querySelector('.is-invalid');
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the field briefly
        firstInvalidField.classList.add('highlight-error');
        setTimeout(() => {
          firstInvalidField.classList.remove('highlight-error');
        }, 2000);
      }
    }
  }
}
