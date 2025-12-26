import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms'
import { LocationService, Branch, BranchPayload, Country, State, City, Coordinator } from 'src/app/core/services/location.service'
import { TokenStorageService } from 'src/app/core/services/token-storage.service'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageService } from 'primeng/api'
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service'
import { of } from 'rxjs'

@Component({
    selector: 'app-edit-branch',
    templateUrl: './edit-branch.component.html',
    styleUrls: ['./edit-branch.component.scss']
})
export class EditBranchComponent implements OnInit {
    branchForm: FormGroup;
    activeMemberType: 'preacher' | 'samarpit' = 'samarpit';
    activeTab: string = 'branch';   // default tab
    branchId: number | null = null;
    searchTerm: string = '';

    //Track progress
    completion = 0; // example, bind dynamically based on form fill %
    circumference = 2 * Math.PI * 45; // radius = 45

    branchName = "";
    branchEmail = "";
    coordinatorName = "";

    // Location data from API
    countryList: Country[] = [];
    stateList: State[] = [];
    cityList: City[] = [];
    coordinatorsList: Coordinator[] = [];

    // Loading states
    loadingCountries = false;
    loadingStates = false;
    loadingCities = false;
    loadingCoordinators = false;
    loadingBranch = false;

    // Submitting state
    isSubmitting = false;

    // Breadcrumb items
    breadCrumbItems: Array<{}> = [];

    constructor(
        private fb: FormBuilder,
        private locationService: LocationService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private confirmationDialog: ConfirmationDialogService,
        private cdr: ChangeDetectorRef
    ) { }

    //for Tabs
    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    ngOnInit(): void {
        console.log('EditBranchComponent - ngOnInit called');

        // Initialize form first
        this.branchForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            contactNumber: ['', [Validators.required, Validators.maxLength(20)]],
            coordinator: ['', Validators.required],
            establishedOn: ['', Validators.required],
            ashramArea: ['', [Validators.required, Validators.min(0)]],
            country: ['', Validators.required],
            pincode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
            postOffice: ['', [Validators.required, Validators.maxLength(100)]],
            thana: [''],
            tehsil: [''],
            state: ['', Validators.required],
            city: ['', Validators.required],
            addressType: [''], // Optional field
            address: ['', [Validators.required, Validators.maxLength(500)]],
            areaCovered: [''],
            infrastructure: this.fb.array([
                this.fb.group({
                    roomType: [''],
                    number: ['']
                })
            ]),
            openDays: [''],
            dailyStartTime: [''],
            dailyEndTime: [''],
            status: [true],
            ncr: [false],
            regionId: [''],
            branchCode: [''],
            members: this.fb.array([]),
            // Member input fields (for adding new members)
            memberType: ['samarpit'], // Default member type
            memberName: [''], // Member name input
            memberRole: [''], // Member role input
            memberResponsibility: [''], // Member responsibility input
            memberAge: [''], // Member age input
            memberDateOfSamarpan: [''], // Member date of samarpan input
            memberQualification: [''], // Member qualification input
            memberDateOfBirth: [''] // Member date of birth input
        });

        // Set initial breadcrumbs
        this.breadCrumbItems = [
            { label: 'Branches', routerLink: '/branch' },
            { label: 'Edit Branch', active: true }
        ];

        // Get branch ID from route
        const idParam = this.route.snapshot.paramMap.get('id');
        console.log('Edit Branch - Route ID param:', idParam);

        if (idParam) {
            this.branchId = parseInt(idParam, 10);
            if (isNaN(this.branchId)) {
                console.error('Invalid branch ID:', idParam);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid branch ID' });
                setTimeout(() => {
                    this.router.navigate(['/branch']);
                }, 2000);
                return;
            }
            console.log('Edit Branch - Parsed branch ID:', this.branchId);
        } else {
            console.error('Branch ID is missing from route');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Branch ID is required' });
            setTimeout(() => {
                this.router.navigate(['/branch']);
            }, 2000);
            return;
        }

        // Load all required data first, then load branch data
        this.loadInitialData();

        // Listen for changes to reset dependent selects (only after initial load)
        let isInitialLoad = true;

        this.branchForm.get('country')?.valueChanges.subscribe(countryId => {
            if (isInitialLoad) return; // Skip during initial load

            if (countryId) {
                this.loadStates(countryId);
            } else {
                this.stateList = [];
                this.cityList = [];
                this.branchForm.patchValue({ state: '', city: '' }, { emitEvent: false });
            }
        });

        this.branchForm.get('state')?.valueChanges.subscribe(stateId => {
            if (isInitialLoad) return; // Skip during initial load

            if (stateId) {
                this.loadCities(stateId);
            } else {
                this.cityList = [];
                this.branchForm.patchValue({ city: '' }, { emitEvent: false });
            }
        });

        // Set flag to false after initial data load completes
        setTimeout(() => {
            isInitialLoad = false;
        }, 5000);

        // Watch form changes
        this.branchForm.valueChanges.subscribe(() => {
            this.updateCompletion();
        });

        this.updateCompletion(); // run once on load
    }

    /**
     * Load initial data (countries, coordinators, branches) before loading branch data
     */
    loadInitialData() {
        let countriesLoaded = false;
        let coordinatorsLoaded = false;
        let branchesLoaded = false;

        const checkAndLoadBranch = () => {
            if (countriesLoaded && coordinatorsLoaded && branchesLoaded) {
                this.loadBranchData();
            }
        };

        // Load countries
        this.loadingCountries = true;
        this.locationService.getCountries().subscribe({
            next: (countries) => {
                this.countryList = countries;
                this.loadingCountries = false;
                countriesLoaded = true;
                checkAndLoadBranch();
            },
            error: (error) => {
                console.error('Error loading countries:', error);
                this.loadingCountries = false;
                countriesLoaded = true; // Set to true even on error to prevent blocking
                checkAndLoadBranch();
            }
        });

        // Load coordinators
        this.loadingCoordinators = true;
        this.locationService.getCoordinators().subscribe({
            next: (coordinators) => {
                this.coordinatorsList = coordinators;
                this.loadingCoordinators = false;
                coordinatorsLoaded = true;
                checkAndLoadBranch();
            },
            error: (error) => {
                console.error('Error loading coordinators:', error);
                this.loadingCoordinators = false;
                coordinatorsLoaded = true; // Set to true even on error to prevent blocking
                checkAndLoadBranch();
            }
        });

        // Load all branches - not needed for edit, so mark as loaded
        branchesLoaded = true;
        checkAndLoadBranch();
    }

    /**
     * Load branch data from API
     */
    loadBranchData() {
        if (!this.branchId) {
            console.error('No branch ID available');
            return;
        }

        this.loadingBranch = true;
        console.log('Loading branch data for ID:', this.branchId);

        this.locationService.getBranchById(this.branchId).subscribe({
            next: (branch) => {
                console.log('Branch data received:', JSON.stringify(branch, null, 2));

                if (!branch) {
                    console.error('Branch data is null or undefined');
                    this.loadingBranch = false;
                    return;
                }

                // Set branch info for display
                this.branchName = branch.name || '';
                this.branchEmail = branch.email || '';
                this.coordinatorName = branch.coordinator_name || '';

                // Find country by name or ID
                const country = this.countryList.find(c => {
                    if (branch.country && branch.country.name) {
                        return c.name === branch.country.name || c.id === branch.country.id;
                    }
                    return c.id === branch.country_id;
                });

                console.log('Found country:', country, 'from branch:', branch.country, 'country_id:', branch.country_id);

                // Find coordinator ID - try multiple matching strategies
                let coordinatorId: number | null = null;
                if (branch.coordinator_name) {
                    coordinatorId = this.findCoordinatorId(branch.coordinator_name);
                    // If not found by exact name, try case-insensitive match
                    if (!coordinatorId) {
                        const coordinator = this.coordinatorsList.find(c => 
                            c.name.toLowerCase() === branch.coordinator_name.toLowerCase()
                        );
                        coordinatorId = coordinator ? coordinator.id : null;
                    }
                }
                console.log('Coordinator lookup - Name:', branch.coordinator_name, 'Found ID:', coordinatorId, 'Available coordinators:', this.coordinatorsList.length);

                // Format established date
                let establishedDate = '';
                if (branch.established_on) {
                    try {
                        const date = new Date(branch.established_on);
                        if (!isNaN(date.getTime())) {
                            establishedDate = date.toISOString().split('T')[0];
                        } else {
                            // Try parsing as is if it's already in YYYY-MM-DD format
                            establishedDate = branch.established_on.split('T')[0];
                        }
                    } catch (e) {
                        console.error('Error parsing date:', e);
                        establishedDate = branch.established_on.split('T')[0];
                    }
                }

                // Determine country ID to use
                let countryIdToUse = country ? country.id : null;
                
                // If country not found but branch has state with country_id, use that
                if (!countryIdToUse && branch.state && branch.state.country_id) {
                    countryIdToUse = branch.state.country_id;
                    // Try to find this country in the list
                    const countryFromState = this.countryList.find(c => c.id === countryIdToUse);
                    if (countryFromState) {
                        countryIdToUse = countryFromState.id;
                    }
                } else if (!countryIdToUse && branch.country_id) {
                    countryIdToUse = branch.country_id;
                }

                // Prepare form values object with all basic fields
                // Convert coordinatorId to string if it exists, since form expects string
                const coordinatorValue = coordinatorId ? coordinatorId.toString() : '';
                
                const formValues: any = {
                    name: branch.name || '',
                    email: branch.email || '',
                    contactNumber: branch.contact_number || '',
                    coordinator: coordinatorValue,
                    establishedOn: establishedDate || '',
                    ashramArea: branch.aashram_area !== null && branch.aashram_area !== undefined ? branch.aashram_area : 0,
                    pincode: branch.pincode || '',
                    postOffice: branch.post_office || '',
                    thana: branch.police_station || '',
                    tehsil: '', // Not in backend model, keep empty
                    address: branch.address || '',
                    areaCovered: '', // Not in backend model, keep empty
                    addressType: '', // Not in backend model, keep empty
                    openDays: branch.open_days || '',
                    dailyStartTime: branch.daily_start_time || '',
                    dailyEndTime: branch.daily_end_time || '',
                    status: branch.status !== undefined ? branch.status : true,
                    ncr: branch.ncr !== undefined ? branch.ncr : false,
                    regionId: branch.region_id ? branch.region_id.toString() : '',
                    branchCode: branch.branch_code || ''
                };

                // Patch all basic fields immediately (without location fields)
                console.log('Patching form with basic values:', formValues);
                console.log('Coordinator ID to set:', coordinatorId);
                console.log('Established date to set:', establishedDate);
                
                try {
                    // Use setValue for all fields to ensure they're properly set
                    // This ensures the form recognizes the values even if they're empty strings
                    this.branchForm.patchValue({
                        name: formValues.name || '',
                        email: formValues.email || '',
                        contactNumber: formValues.contactNumber || '',
                        coordinator: coordinatorValue,
                        establishedOn: establishedDate || '',
                        ashramArea: formValues.ashramArea !== null && formValues.ashramArea !== undefined ? formValues.ashramArea : 0,
                        pincode: formValues.pincode || '',
                        postOffice: formValues.postOffice || '',
                        thana: formValues.thana || '',
                        address: formValues.address || '',
                        openDays: formValues.openDays || '',
                        dailyStartTime: formValues.dailyStartTime || '',
                        dailyEndTime: formValues.dailyEndTime || '',
                        branchCode: formValues.branchCode || '',
                        regionId: formValues.regionId || '',
                        status: formValues.status !== undefined ? formValues.status : true,
                        ncr: formValues.ncr !== undefined ? formValues.ncr : false
                    }, { emitEvent: false });
                    
                    // Force update for critical fields to ensure they're set
                    setTimeout(() => {
                        if (formValues.name) {
                            this.branchForm.get('name')?.setValue(formValues.name, { emitEvent: false });
                        }
                        if (formValues.email) {
                            this.branchForm.get('email')?.setValue(formValues.email, { emitEvent: false });
                        }
                        if (formValues.contactNumber) {
                            this.branchForm.get('contactNumber')?.setValue(formValues.contactNumber, { emitEvent: false });
                        }
                        if (coordinatorValue) {
                            this.branchForm.get('coordinator')?.setValue(coordinatorValue, { emitEvent: false });
                        }
                        if (establishedDate) {
                            this.branchForm.get('establishedOn')?.setValue(establishedDate, { emitEvent: false });
                        }
                        if (formValues.ashramArea !== undefined && formValues.ashramArea !== null) {
                            this.branchForm.get('ashramArea')?.setValue(formValues.ashramArea, { emitEvent: false });
                        }
                        this.cdr.detectChanges();
                    }, 100);
                    
                    this.cdr.detectChanges();
                    
                    // Verify critical fields were set
                    console.log('Form after patch - name:', this.branchForm.get('name')?.value);
                    console.log('Form after patch - email:', this.branchForm.get('email')?.value);
                    console.log('Form after patch - contactNumber:', this.branchForm.get('contactNumber')?.value);
                    console.log('Form after patch - coordinator:', this.branchForm.get('coordinator')?.value);
                    console.log('Form after patch - establishedOn:', this.branchForm.get('establishedOn')?.value);
                    console.log('Form after patch - ashramArea:', this.branchForm.get('ashramArea')?.value);
                } catch (error) {
                    console.error('Error patching form:', error);
                }

                // Load infrastructure data
                this.loadBranchInfrastructure();

                // Load members for this branch
                this.loadBranchMembers();

                // Now handle location fields (country -> state -> city)
                if (countryIdToUse) {
                    // Load states for the country
                    this.loadingStates = true;
                    this.locationService.getStatesByCountry(countryIdToUse).subscribe({
                        next: (states) => {
                            this.stateList = states;
                            this.loadingStates = false;
                            
                            // Patch form with country
                            this.branchForm.patchValue({ country: countryIdToUse }, { emitEvent: false });
                            this.cdr.detectChanges();
                            
                            // Now set state and city
                            this.setLocationValues(branch, countryIdToUse, coordinatorId, establishedDate);
                        },
                        error: (error) => {
                            console.error('Error loading states:', error);
                            this.loadingStates = false;
                            
                            // If state exists in branch data, try to set it directly
                            if (branch.state && branch.state.id) {
                                // Add the state to stateList if not already there
                                const existingState = this.stateList.find(s => s.id === branch.state.id);
                                if (!existingState && branch.state.name) {
                                    this.stateList.push({ 
                                        id: branch.state.id, 
                                        name: branch.state.name, 
                                        country_id: branch.state.country_id 
                                    });
                                }
                                
                                // Set country if we have it
                                if (countryIdToUse) {
                                    this.branchForm.patchValue({ country: countryIdToUse }, { emitEvent: false });
                                }
                                
                                this.branchForm.patchValue({ state: branch.state.id }, { emitEvent: false });
                                
                                // Try to load cities for this state
                                this.loadingCities = true;
                                this.locationService.getCitiesByState(branch.state.id).subscribe({
                                    next: (cities) => {
                                        this.cityList = cities;
                                        if (branch.city && branch.city.id) {
                                            this.branchForm.patchValue({ city: branch.city.id }, { emitEvent: false });
                                        }
                                        this.loadingCities = false;
                                        this.loadingBranch = false;
                                        this.cdr.detectChanges();
                                        this.updateCompletion();
                                    },
                                    error: (err) => {
                                        console.error('Error loading cities:', err);
                                        this.loadingCities = false;
                                        this.loadingBranch = false;
                                        this.cdr.detectChanges();
                                        this.updateCompletion();
                                    }
                                });
                            } else {
                                this.loadingBranch = false;
                                this.cdr.detectChanges();
                                this.updateCompletion();
                            }
                        }
                    });
                } else if (branch.state && branch.state.id) {
                    // If we have state but no country, try to load state and city directly
                    // Add the state to stateList if not already there
                    const existingState = this.stateList.find(s => s.id === branch.state.id);
                    if (!existingState && branch.state.name) {
                        this.stateList.push({ 
                            id: branch.state.id, 
                            name: branch.state.name, 
                            country_id: branch.state.country_id 
                        });
                    }
                    
                    // Try to set country from state if available
                    if (branch.state.country_id) {
                        const countryFromState = this.countryList.find(c => c.id === branch.state.country_id);
                        if (countryFromState) {
                            this.branchForm.patchValue({ country: countryFromState.id }, { emitEvent: false });
                        }
                    }
                    
                    this.branchForm.patchValue({ state: branch.state.id }, { emitEvent: false });
                    
                    this.loadingCities = true;
                    this.locationService.getCitiesByState(branch.state.id).subscribe({
                        next: (cities) => {
                            this.cityList = cities;
                            if (branch.city && branch.city.id) {
                                this.branchForm.patchValue({ city: branch.city.id }, { emitEvent: false });
                            }
                            this.loadingCities = false;
                            this.loadingBranch = false;
                            this.cdr.detectChanges();
                            this.updateCompletion();
                        },
                        error: (err) => {
                            console.error('Error loading cities:', err);
                            this.loadingCities = false;
                            this.loadingBranch = false;
                            this.cdr.detectChanges();
                            this.updateCompletion();
                        }
                    });
                } else {
                    // No location data available
                    this.loadingBranch = false;
                    this.cdr.detectChanges();
                    this.updateCompletion();
                }
            },
            error: (error) => {
                console.error('Error loading branch:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || error.message || 'Failed to load branch data. Please try again.'
                });
                this.loadingBranch = false;
            }
        });
    }

    /**
     * Set location values (state, city) after they're loaded
     */
    setLocationValues(branch: Branch, countryId: number, coordinatorId?: number | null, establishedDate?: string) {
        console.log('Setting location values. Branch state:', branch.state, 'state_id:', branch.state_id, 'Available states:', this.stateList.length);

        // Find state by name or ID (branch.state is an object with name property)
        const state = this.stateList.find(s => {
            if (branch.state && branch.state.name) {
                return s.name === branch.state.name || s.id === branch.state.id;
            }
            return s.id === branch.state_id;
        });

        if (state) {
            console.log('Found state:', state);
            
            // Patch state value
            this.branchForm.patchValue({ state: state.id }, { emitEvent: false });
            this.cdr.detectChanges();

            // Load cities for this state
            this.loadingCities = true;
            this.locationService.getCitiesByState(state.id).subscribe({
                next: (cities) => {
                    this.cityList = cities;
                    console.log('Cities loaded:', cities.length, 'Branch city:', branch.city, 'city_id:', branch.city_id);

                    // branch.city is an object with name property
                    const city = cities.find(c => {
                        if (branch.city && branch.city.name) {
                            return c.name === branch.city.name || c.id === branch.city.id;
                        }
                        return c.id === branch.city_id;
                    });

                    if (city) {
                        console.log('Found city:', city);
                        this.branchForm.patchValue({ city: city.id }, { emitEvent: false });
                    } else {
                        console.warn('City not found. Available cities:', cities.map(c => ({ id: c.id, name: c.name })));
                        // If city_id exists but not found in list, try to set it anyway
                        if (branch.city_id) {
                            this.branchForm.patchValue({ city: branch.city_id }, { emitEvent: false });
                        }
                    }
                    
                    this.loadingCities = false;
                    this.loadingBranch = false;
                    this.cdr.detectChanges();
                    this.updateCompletion();
                    
                    // Final verification
                    console.log('Branch data loading complete.');
                    console.log('Final form values:', {
                        name: this.branchForm.get('name')?.value,
                        email: this.branchForm.get('email')?.value,
                        contactNumber: this.branchForm.get('contactNumber')?.value,
                        coordinator: this.branchForm.get('coordinator')?.value,
                        country: this.branchForm.get('country')?.value,
                        state: this.branchForm.get('state')?.value,
                        city: this.branchForm.get('city')?.value,
                        establishedOn: this.branchForm.get('establishedOn')?.value,
                        ashramArea: this.branchForm.get('ashramArea')?.value,
                        pincode: this.branchForm.get('pincode')?.value,
                        postOffice: this.branchForm.get('postOffice')?.value,
                        address: this.branchForm.get('address')?.value
                    });
                },
                error: (error) => {
                    console.error('Error loading cities:', error);
                    this.loadingCities = false;
                    this.loadingBranch = false;
                    this.cdr.detectChanges();
                    this.updateCompletion();
                }
            });
        } else {
            console.warn('State not found for branch. Available states:', this.stateList.map(s => ({ id: s.id, name: s.name })));
            // If state_id exists but not found in list, try to add it
            if (branch.state_id && branch.state && branch.state.name) {
                this.stateList.push({ 
                    id: branch.state.id, 
                    name: branch.state.name, 
                    country_id: branch.state.country_id 
                });
                this.branchForm.patchValue({ state: branch.state.id }, { emitEvent: false });
                this.cdr.detectChanges();
                
                // Try to load cities
                this.loadingCities = true;
                this.locationService.getCitiesByState(branch.state.id).subscribe({
                    next: (cities) => {
                        this.cityList = cities;
                        if (branch.city && branch.city.id) {
                            this.branchForm.patchValue({ city: branch.city.id }, { emitEvent: false });
                        }
                        this.loadingCities = false;
                        this.loadingBranch = false;
                        this.cdr.detectChanges();
                        this.updateCompletion();
                    },
                    error: (err) => {
                        console.error('Error loading cities:', err);
                        this.loadingCities = false;
                        this.loadingBranch = false;
                        this.cdr.detectChanges();
                        this.updateCompletion();
                    }
                });
            } else {
                this.loadingBranch = false;
                this.cdr.detectChanges();
                this.updateCompletion();
            }
        }
    }

    /**
     * Find coordinator ID by name (with case-insensitive fallback)
     */
    findCoordinatorId(name: string): number | null {
        if (!name) return null;
        
        // Try exact match first
        let coordinator = this.coordinatorsList.find(c => c.name === name);
        if (coordinator) return coordinator.id;
        
        // Try case-insensitive match
        coordinator = this.coordinatorsList.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (coordinator) return coordinator.id;
        
        // Try partial match (contains)
        coordinator = this.coordinatorsList.find(c => 
            c.name.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(c.name.toLowerCase())
        );
        return coordinator ? coordinator.id : null;
    }

    updateCompletion() {
        const controls = this.branchForm.controls;
        const total = Object.keys(controls).length;
        let filled = 0;

        Object.keys(controls).forEach(key => {
            if (controls[key].value && controls[key].value.toString().trim() !== '') {
                filled++;
            }
        });

        this.completion = Math.round((filled / total) * 100);
    }

    get infrastructure(): FormArray {
        return this.branchForm.get('infrastructure') as FormArray;
    }

    addRoomType() {
        this.infrastructure.push(this.fb.group({
            roomType: [''],
            number: ['']
        }));
    }

    get members(): FormArray {
        return this.branchForm.get('members') as FormArray;
    }


    addMember() {
        const memberType = this.branchForm.get('memberType')?.value || 'samarpit';
        const name = this.branchForm.get('memberName')?.value || '';
        const role = this.branchForm.get('memberRole')?.value || '';
        const responsibility = this.branchForm.get('memberResponsibility')?.value || '';
        const age = this.branchForm.get('memberAge')?.value || '';
        const dateOfSamarpan = this.branchForm.get('memberDateOfSamarpan')?.value || '';
        const qualification = this.branchForm.get('memberQualification')?.value || '';
        const dateOfBirth = this.branchForm.get('memberDateOfBirth')?.value || '';
        
        // Validate required fields
        if (!name || !role) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Name and Role are required fields',
                life: 3000
            });
            return;
        }
        
        this.members.push(this.fb.group({
            id: [null], // null for new members, will be set for existing members
            name: [name, Validators.required],
            role: [role, Validators.required],
            responsibility: [responsibility],
            age: [age],
            dateOfSamarpan: [dateOfSamarpan],
            qualification: [qualification],
            dateOfBirth: [dateOfBirth],
            memberType: [memberType, Validators.required]
        }));
        
        // Clear the input fields after adding
        this.branchForm.patchValue({
            memberName: '',
            memberRole: '',
            memberResponsibility: '',
            memberAge: '',
            memberDateOfSamarpan: '',
            memberQualification: '',
            memberDateOfBirth: ''
        });
    }

    removeMember(index: number) {
        const memberControl = this.members.at(index);
        const memberId = memberControl.get('id')?.value;
        const memberName = memberControl.get('name')?.value || 'this member';

        if (memberId) {
            // Existing member - confirm deletion first
            this.confirmationDialog.confirmDelete({
                title: 'Delete Member',
                text: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
                successTitle: 'Member Deleted',
                successText: `Member "${memberName}" deleted successfully`,
                showSuccessMessage: false // We'll use PrimeNG message service instead
            }).then((result) => {
                if (result.value) {
                    this.locationService.deleteBranchMember(memberId).subscribe({
                        next: () => {
                            this.members.removeAt(index);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: `Member "${memberName}" deleted successfully`,
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.error('Error deleting member:', error);
                            let errorMessage = 'Failed to delete member. Please try again.';

                            if (error.error) {
                                if (error.error.message) {
                                    errorMessage = error.error.message;
                                } else if (error.error.error) {
                                    errorMessage = error.error.error;
                                } else if (typeof error.error === 'string') {
                                    errorMessage = error.error;
                                }
                            } else if (error.message) {
                                errorMessage = error.message;
                            }

                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: errorMessage,
                                life: 5000
                            });
                        }
                    });
                }
            });
        } else {
            // New member - just remove from form (no confirmation needed for unsaved member)
            this.members.removeAt(index);
        }
    }

    switchMemberType(type: 'preacher' | 'samarpit') {
        this.activeMemberType = type;
    }

    onSearchChange(searchValue: string): void {
        this.searchTerm = searchValue;
    }

    get filteredMembers() {
        let filtered = this.members.controls.filter(m => m.value.memberType === this.activeMemberType);
        
        // Apply search term filter
        if (this.searchTerm && this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(member => {
                const nameMatch = member.value.name?.toLowerCase().includes(searchLower) || false;
                const roleMatch = member.value.role?.toLowerCase().includes(searchLower) || false;
                const responsibilityMatch = member.value.responsibility?.toLowerCase().includes(searchLower) || false;
                const qualificationMatch = member.value.qualification?.toLowerCase().includes(searchLower) || false;
                const memberTypeMatch = member.value.memberType?.toLowerCase().includes(searchLower) || false;
                return nameMatch || roleMatch || responsibilityMatch || qualificationMatch || memberTypeMatch;
            });
        }
        
        return filtered;
    }

    get preacherCount() {
        return this.members.controls.filter(m => m.value.memberType === 'preacher').length;
    }

    get samarpitCount() {
        return this.members.controls.filter(m => m.value.memberType === 'samarpit').length;
    }

    onSubmit() {
        if (this.branchForm.valid && !this.isSubmitting && this.branchId) {
            this.isSubmitting = true;

            const formValue = this.branchForm.value;

            // Get names from IDs (handle both string and number IDs)
            const countryId = formValue.country;
            const stateId = formValue.state;
            const cityId = formValue.city;
            const coordinatorId = formValue.coordinator;

            const country = this.countryList.find(c => c.id == countryId || c.id === Number(countryId));
            const state = this.stateList.find(s => s.id == stateId || s.id === Number(stateId));
            const city = this.cityList.find(c => c.id == cityId || c.id === Number(cityId));
            const coordinator = this.coordinatorsList.find(c => c.id == coordinatorId || c.id === Number(coordinatorId));

            // Get current user for updated_by
            const currentUser = this.tokenStorage.getUser();
            const updatedBy = currentUser?.email || currentUser?.name || 'system';
            const currentTimestamp = new Date().toISOString();

            // Format date (convert to ISO string if needed)
            let establishedOn = formValue.establishedOn;
            if (establishedOn && typeof establishedOn === 'string') {
                // If it's already a string, use it as is
                establishedOn = establishedOn;
            } else if (establishedOn) {
                // If it's a Date object, convert to ISO string
                establishedOn = new Date(establishedOn).toISOString();
            }

            // Prepare API payload (exclude id, created_on, created_by as they cannot be updated per backend validation)
            // The id is passed in the URL path, not in the request body
            const branchData: any = {
                name: formValue.name || '',
                email: formValue.email || '',
                contact_number: formValue.contactNumber || '',
                aashram_area: parseFloat(formValue.ashramArea) || 0,
                address: formValue.address || '',
                city_id: city?.id || null,
                coordinator_name: coordinator?.name || '',
                country_id: country?.id || null,
                daily_end_time: formValue.dailyEndTime || '',
                daily_start_time: formValue.dailyStartTime || '',
                established_on: establishedOn || '',
                open_days: formValue.openDays || '',
                pincode: formValue.pincode || '',
                police_station: formValue.thana || '',
                post_office: formValue.postOffice || '',
                state_id: state?.id || null,
                status: formValue.status !== undefined ? formValue.status : true,
                ncr: formValue.ncr !== undefined ? formValue.ncr : false,
                region_id: formValue.regionId ? parseInt(formValue.regionId, 10) : null,
                branch_code: formValue.branchCode || '',
                updated_by: updatedBy,
                updated_on: currentTimestamp
            };

            // Explicitly remove id, created_on, and created_by if they exist (they shouldn't be in update payload)
            delete branchData.id;
            delete branchData.created_on;
            delete branchData.created_by;

            // Update branch via API
            this.locationService.updateBranch(this.branchId, branchData).subscribe({
                next: (response) => {
                    console.log('Branch updated successfully:', response);

                    // Save members after branch update
                    this.saveOrUpdateMembers(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Branch and members updated successfully!'
                        });
                        this.isSubmitting = false;
                        setTimeout(() => {
                            this.router.navigate(['/branch']);
                        }, 1500);
                    });
                },
                error: (error) => {
                    console.error('Error updating branch:', error);
                    let errorMessage = 'Failed to update branch. Please try again.';

                    if (error.error) {
                        if (error.error.message) {
                            errorMessage = error.error.message;
                        } else if (error.error.error) {
                            errorMessage = error.error.error;
                        } else if (typeof error.error === 'string') {
                            errorMessage = error.error;
                        }
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    if (error.status === 400) {
                        errorMessage = 'Invalid data provided. Please check all fields and try again.';
                    } else if (error.status === 404) {
                        errorMessage = 'Branch not found. It may have been deleted.';
                    } else if (error.status === 403) {
                        errorMessage = 'You do not have permission to update this branch.';
                    } else if (error.status === 409) {
                        errorMessage = 'A branch with this email or contact number already exists.';
                    }

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: errorMessage,
                        life: 5000
                    });
                    this.isSubmitting = false;
                }
            });
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.branchForm.controls).forEach(key => {
                const control = this.branchForm.get(key);
                if (control) {
                    control.markAsTouched();
                    // If it's a FormArray, mark all nested controls as touched
                    if (control instanceof FormArray) {
                        control.controls.forEach(nestedControl => {
                            if (nestedControl instanceof FormGroup) {
                                Object.keys(nestedControl.controls).forEach(nestedKey => {
                                    nestedControl.get(nestedKey)?.markAsTouched();
                                });
                            } else {
                                nestedControl.markAsTouched();
                            }
                        });
                    }
                }
            });
            
            // Show validation error message
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
        }
    }


    /**
     * Load states by country ID
     */
    loadStates(countryId: number) {
        this.loadingStates = true;
        this.stateList = [];
        this.locationService.getStatesByCountry(countryId).subscribe({
            next: (states) => {
                this.stateList = states;
                this.loadingStates = false;
            },
            error: (error) => {
                console.error('Error loading states:', error);
                this.loadingStates = false;
            }
        });
    }


    /**
     * Load cities by state ID
     */
    loadCities(stateId: number) {
        this.loadingCities = true;
        this.cityList = [];
        this.locationService.getCitiesByState(stateId).subscribe({
            next: (cities) => {
                this.cityList = cities;
                this.loadingCities = false;
            },
            error: (error) => {
                console.error('Error loading cities:', error);
                this.loadingCities = false;
            }
        });
    }


    /**
     * Load branch infrastructure from API
     */
    loadBranchInfrastructure() {
        if (!this.branchId) return;

        this.locationService.getBranchInfraByBranchId(this.branchId).subscribe({
            next: (infra) => {
                // Clear existing infrastructure
                while (this.infrastructure.length !== 0) {
                    this.infrastructure.removeAt(0);
                }

                // Add infrastructure to form
                if (infra && infra.length > 0) {
                    infra.forEach((item: any) => {
                        this.infrastructure.push(this.fb.group({
                            roomType: [item.type || ''],
                            number: [item.count || '']
                        }));
                    });
                } else {
                    // If no infrastructure, add one empty row
                    this.infrastructure.push(this.fb.group({
                        roomType: [''],
                        number: ['']
                    }));
                }
            },
            error: (error) => {
                console.error('Error loading branch infrastructure:', error);
                // On error, ensure at least one empty row exists
                if (this.infrastructure.length === 0) {
                    this.infrastructure.push(this.fb.group({
                        roomType: [''],
                        number: ['']
                    }));
                }
            }
        });
    }

    /**
     * Load branch members from API
     */
    loadBranchMembers() {
        if (!this.branchId) return;

        this.locationService.getBranchMembers(this.branchId).subscribe({
            next: (members) => {
                // Clear existing members
                while (this.members.length !== 0) {
                    this.members.removeAt(0);
                }

                // Add members to form
                members.forEach((member: any) => {
                    this.members.push(this.fb.group({
                        id: [member.id],
                        name: [member.name || '', Validators.required],
                        role: [member.branch_role || '', Validators.required],
                        responsibility: [member.responsibility || ''],
                        age: [member.age || ''],
                        dateOfSamarpan: [member.date_of_samarpan ? member.date_of_samarpan.split('T')[0] : ''],
                        qualification: [member.qualification || ''],
                        dateOfBirth: [member.date_of_birth ? member.date_of_birth.split('T')[0] : ''],
                        memberType: [member.member_type || 'samarpit', Validators.required]
                    }));
                });
            },
            error: (error) => {
                console.error('Error loading branch members:', error);
            }
        });
    }

    /**
     * Save or update members after branch update
     */
    saveOrUpdateMembers(callback?: () => void) {
        const membersToProcess = this.members.controls.filter(m => m.valid);
        if (membersToProcess.length === 0) {
            if (callback) callback();
            return;
        }

        let completed = 0;
        const total = membersToProcess.length;
        let hasError = false;

        membersToProcess.forEach((memberControl) => {
            const memberData = memberControl.value;
            const memberId = memberData.id;
            const memberPayload = {
                branch_id: this.branchId,
                member_type: memberData.memberType,
                name: memberData.name,
                branch_role: memberData.role || '',
                responsibility: memberData.responsibility || '',
                age: memberData.age ? parseInt(memberData.age, 10) : 0,
                date_of_samarpan: memberData.dateOfSamarpan || null,
                qualification: memberData.qualification || '',
                date_of_birth: memberData.dateOfBirth || null
            };

            if (memberId) {
                // Update existing member
                this.locationService.updateBranchMember(memberId, memberPayload).subscribe({
                    next: () => {
                        completed++;
                        if (completed === total && !hasError) {
                            if (callback) callback();
                        }
                    },
                    error: (error) => {
                        console.error('Error updating member:', error);
                        hasError = true;
                        completed++;
                        if (completed === total) {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Warning',
                                detail: 'Branch updated but some members could not be saved.'
                            });
                            if (callback) callback();
                        }
                    }
                });
            } else {
                // Create new member
                this.locationService.createBranchMember(memberPayload).subscribe({
                    next: () => {
                        completed++;
                        if (completed === total && !hasError) {
                            if (callback) callback();
                        }
                    },
                    error: (error) => {
                        console.error('Error creating member:', error);
                        hasError = true;
                        completed++;
                        if (completed === total) {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Warning',
                                detail: 'Branch updated but some members could not be saved.'
                            });
                            if (callback) callback();
                        }
                    }
                });
            }
        });
    }

}
