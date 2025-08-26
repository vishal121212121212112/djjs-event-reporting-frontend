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
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit {

  currentStep = 1;
  totalSteps = 4;

  // Success and error messages
  successMessage: string = '';
  errorMessage: string = '';

  // Form data for different steps
  generalDetailsForm: FormGroup;
  mediaPromotionForm: FormGroup;
  involvedParticipantsForm: FormGroup;

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
  eventTypes = ['Spiritual', 'Cultural', 'Educational', 'Social Service', 'Others'];
  
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
  countries = ['India', 'USA', 'UK', 'Canada', 'Australia'];
  states = ['Karnataka', 'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu'];
  cities = ['Bangalore', 'Mumbai', 'Delhi', 'Lucknow', 'Ahmedabad', 'Chennai'];
  addressTypes = ['Residential', 'Commercial', 'Temple', 'Community Center', 'Other'];
  donationTypeOptions = ['Cash', 'In-kind', 'Bank Transfer', 'Cheque'];
  mediaCoverageTypes = ['Print', 'Digital', 'TV', 'Radio', 'Social Media'];
  materialTypeOptions = ['Banner', 'Pamphlet', 'Poster', 'Social Media Post', 'TV Advertisement'];
  materialSizes = ['Small', 'Medium', 'Large', 'Custom'];
  prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Shri', 'Smt.'];
  sevaTypes = ['Event Management', 'Catering', 'Decoration', 'Transportation', 'Registration', 'Other'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.fillWithRandomMockData();
  }

  initializeForms(): void {
    // General Details Form
    this.generalDetailsForm = this.fb.group({
      eventType: [''],
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
      sellAmount: ['']
    });

    // Media & Promotion Form
    this.mediaPromotionForm = this.fb.group({
      mediaCoverageType: [''],
      organizationName: [''],
      mediaEmail: [''],
      mediaWebsite: [''],
      prefix: [''],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      designation: [''],
      contact: [''],
      email: [''],
      referenceBranchId: [''],
      referenceMemberId: [''],
      referencePersonName: ['--------'],
      materialType: [''],
      quantity: [''],
      size: [''],
      eventPhotos: [''],
      videoCoverage: [''],
      pressRelease: [''],
      testimonials: ['']
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
    });

    // Listen for event name changes
    this.generalDetailsForm.get('eventName')?.valueChanges.subscribe(eventName => {
      this.onEventNameChange(eventName);
    });
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
    this.specialGuests.push({
      gender: '',
      prefix: '',
      firstName: '',
      middleName: '',
      lastName: '',
      designation: '',
      organization: '',
      email: '',
      contact: '',
      contactPerson: ''
    });
  }

  removeSpecialGuest(index: number): void {
    this.specialGuests.splice(index, 1);
  }

  // Add volunteer functionality
  addVolunteer(): void {
    this.volunteers.push({
      name: '',
      days: 0,
      seva: ''
    });
  }

  removeVolunteer(index: number): void {
    this.volunteers.splice(index, 1);
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
      console.log(`${fileType} files uploaded:`, this.uploadedFiles[fileType]);
    }
  }

  // Video coverage input
  onVideoCoverageChange(event: any): void {
    this.uploadedFiles.videoCoverage = event.target.value;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  isStepValid(step: number): boolean {
    return true;
  }

  onSubmit(): void {
    if (this.currentStep === this.totalSteps) {
      // Collect all form data
      const formData = {
        generalDetails: this.generalDetailsForm.value,
        mediaPromotion: this.mediaPromotionForm.value,
        involvedParticipants: this.involvedParticipantsForm.value,
        donationTypes: this.donationTypes,
        materialTypes: this.materialTypes,
        specialGuests: this.specialGuests,
        volunteers: this.volunteers,
        uploadedFiles: this.uploadedFiles
      };

      console.log('=== EVENT FORM COMPLETE DATA ===');
      console.log('General Details:', formData.generalDetails);
      console.log('Media & Promotion:', formData.mediaPromotion);
      console.log('Involved Participants:', formData.involvedParticipants);
      console.log('Donation Types:', formData.donationTypes);
      console.log('Material Types:', formData.materialTypes);
      console.log('Special Guests:', formData.specialGuests);
      console.log('Volunteers:', formData.volunteers);
      console.log('Uploaded Files:', formData.uploadedFiles);
      console.log('=== END OF FORM DATA ===');

      this.router.navigate(['/events']);
    } else {
      this.nextStep();
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
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
      state: this.sampleEventData.state,
      city: this.sampleEventData.city,
      address: this.sampleEventData.address,
      areaCovered: this.sampleEventData.areaCovered
    });

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
      state: randomEvent.state,
      city: randomEvent.city,
      address: randomEvent.address,
      areaCovered: randomEvent.areaCovered
    });

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
    
    switch(eventType) {
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
      this.generalDetailsForm.patchValue(eventData);
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
