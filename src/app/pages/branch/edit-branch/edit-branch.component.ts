import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms'
import { LocationService, Branch, BranchPayload, Country, State, District, City, Coordinator } from 'src/app/core/services/location.service'
import { ChildBranchService, ChildBranchPayload } from 'src/app/core/services/child-branch.service'
import { TokenStorageService } from 'src/app/core/services/token-storage.service'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageService } from 'primeng/api'
import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service'
import { forkJoin, of } from 'rxjs'

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
    districtOptions: District[] = [];
    coordinatorsList: Coordinator[] = [];
    childBranchesList: Branch[] = []; // List of all branches for child branch selection

    // Loading states
    loadingCountries = false;
    loadingStates = false;
    loadingDistricts = false;
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
        private childBranchService: ChildBranchService,
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
            coordinator: ['', Validators.required],
            establishedOn: ['', Validators.required],
            ashramArea: ['', Validators.required],
            country: ['', Validators.required],
            pincode: ['', Validators.required],
            postOffice: ['', Validators.required],
            thana: [''],
            tehsil: [''],
            state: ['', Validators.required],
            city: ['', Validators.required],
            addressType: [''], // Optional field
            address: ['', Validators.required],
            districts: ['', Validators.required],
            areaCovered: [''],
            isParentBranch: [false], // Toggle for parent branch
            childBranches: this.fb.array([]), // FormArray for child branches
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
            name: [''], // Member name input
            role: [''], // Member role input
            responsibility: [''], // Member responsibility input
            age: [''], // Member age input
            dateOfSamarpan: [''], // Member date of samarpan input
            qualification: [''], // Member qualification input
            dateOfBirth: [''] // Member date of birth input
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
                this.districtOptions = [];
                this.branchForm.patchValue({ state: '', city: '', districts: '' }, { emitEvent: false });
            }
        });

        this.branchForm.get('state')?.valueChanges.subscribe(stateId => {
            if (isInitialLoad) return; // Skip during initial load

            const countryId = this.branchForm.get('country')?.value;
            if (stateId && countryId) {
                this.loadDistricts(stateId, countryId);
                this.loadCities(stateId);
            } else {
                this.cityList = [];
                this.districtOptions = [];
                this.branchForm.patchValue({ city: '', districts: '' }, { emitEvent: false });
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

        // Load all branches
        this.locationService.getAllBranches().subscribe({
            next: (branches) => {
                this.childBranchesList = branches;
                branchesLoaded = true;
                checkAndLoadBranch();
            },
            error: (error) => {
                console.error('Error loading branches:', error);
                branchesLoaded = true; // Set to true even on error to prevent blocking
                checkAndLoadBranch();
            }
        });
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

                if (!country) {
                    console.error('Country not found. Available countries:', this.countryList);
                    this.loadingBranch = false;
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'Country not found for this branch. Please select manually.'
                    });
                    // Continue anyway - user can select manually
                }

                // Find coordinator ID
                const coordinatorId = this.findCoordinatorId(branch.coordinator_name);
                console.log('Coordinator lookup - Name:', branch.coordinator_name, 'Found ID:', coordinatorId, 'Available coordinators:', this.coordinatorsList.length);

                // Load child branches from the new child branch API
                this.childBranchService.getChildBranchesByParent(this.branchId).subscribe({
                    next: (childBranches) => {
                        if (childBranches && childBranches.length > 0) {
                            // Clear existing child branches
                            while (this.childBranches.length !== 0) {
                                this.childBranches.removeAt(0);
                            }
                            // Add each child branch from the separate table
                            childBranches.forEach((child: any) => {
                                const childGroup = this.fb.group({
                                    id: [child.id],
                                    name: [child.name || ''], // Store name for display
                                    contact_number: [child.contact_number || ''],
                                    email: [child.email || ''],
                                    address: [child.address || ''],
                                    pincode: [child.pincode || ''],
                                    post_office: [child.post_office || ''],
                                    police_station: [child.police_station || ''],
                                    country_id: [child.country_id || null],
                                    state_id: [child.state_id || null],
                                    district_id: [child.district_id || null],
                                    city_id: [child.city_id || null],
                                    established_on: [child.established_on || ''],
                                    aashram_area: [child.aashram_area || 0],
                                    open_days: [child.open_days || ''],
                                    daily_start_time: [child.daily_start_time || ''],
                                    daily_end_time: [child.daily_end_time || ''],
                                    status: [child.status !== undefined ? child.status : true],
                                    ncr: [child.ncr !== undefined ? child.ncr : false],
                                    region_id: [child.region_id || null],
                                    branch_code: [child.branch_code || '']
                                });
                                this.childBranches.push(childGroup);
                            });
                            // Set isParentBranch to true if child branches exist
                            this.branchForm.patchValue({ isParentBranch: true }, { emitEvent: false });
                        }
                    },
                    error: (error) => {
                        console.error('Error loading child branches:', error);
                        // Continue anyway - child branches may not exist yet
                    }
                });

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

                // Check if branch has child branches to determine isParentBranch
                const hasChildBranches = this.childBranches.length > 0;

                // Prepare form values object
                const formValues: any = {
                    coordinator: coordinatorId || '',
                    establishedOn: establishedDate,
                    ashramArea: branch.aashram_area || 0,
                    pincode: branch.pincode || '',
                    postOffice: branch.post_office || '',
                    thana: branch.police_station || '',
                    address: branch.address || '',
                    openDays: branch.open_days || '',
                    dailyStartTime: branch.daily_start_time || '',
                    dailyEndTime: branch.daily_end_time || '',
                    status: branch.status !== undefined ? branch.status : true,
                    ncr: branch.ncr !== undefined ? branch.ncr : false,
                    regionId: branch.region_id ? branch.region_id.toString() : '',
                    branchCode: branch.branch_code || '',
                    isParentBranch: hasChildBranches
                };

                // Only set country if we found it
                if (country) {
                    formValues.country = country.id;
                }

                console.log('Patching form with values:', formValues);

                // Patch form with all values at once, without emitting events
                try {
                    this.branchForm.patchValue(formValues, { emitEvent: false });

                    // Verify each control was set
                    Object.keys(formValues).forEach(key => {
                        const control = this.branchForm.get(key);
                        if (control) {
                            const value = control.value;
                            console.log(`Control "${key}": set to "${value}", expected "${formValues[key]}"`);
                            if (value !== formValues[key] && formValues[key] !== '') {
                                console.warn(`Control "${key}" value mismatch!`);
                            }
                        } else {
                            console.warn(`Control "${key}" not found in form!`);
                        }
                    });
                } catch (error) {
                    console.error('Error patching form:', error);
                }

                // Verify the patch worked
                console.log('Form values after patch:', this.branchForm.value);

                // Force change detection
                this.cdr.detectChanges();
                this.updateCompletion();

                // Load infrastructure data
                this.loadBranchInfrastructure();

                // Load members for this branch
                this.loadBranchMembers();

                // If country is found, load states and location data
                if (country) {
                    this.loadingStates = true;
                    this.locationService.getStatesByCountry(country.id).subscribe({
                        next: (states) => {
                            this.stateList = states;
                            this.loadingStates = false;
                            this.setLocationValues(branch, country.id);
                        },
                        error: (error) => {
                            console.error('Error loading states:', error);
                            this.loadingStates = false;
                            this.loadingBranch = false;
                        }
                    });
                } else {
                    // If no country, just mark loading as complete
                    this.loadingBranch = false;
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
     * Set location values (state, city, district) after they're loaded
     */
    setLocationValues(branch: Branch, countryId: number) {
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
            this.branchForm.patchValue({ state: state.id }, { emitEvent: false });

            let districtsLoaded = false;
            let citiesLoaded = false;

            const checkComplete = () => {
                if (districtsLoaded && citiesLoaded) {
                    this.loadingBranch = false;
                    console.log('Branch data loading complete. Final form values:', JSON.stringify(this.branchForm.value, null, 2));
                }
            };

            // Load districts and cities for this state
            this.loadingDistricts = true;
            this.locationService.getDistrictsByStateAndCountry(state.id, countryId).subscribe({
                next: (districts) => {
                    this.districtOptions = districts;
                    console.log('Districts loaded:', districts.length, 'Branch district:', branch.district, 'district_id:', branch.district_id);

                    // branch.district is an object with name property
                    const district = districts.find(d => {
                        if (branch.district && branch.district.name) {
                            return d.name === branch.district.name || d.id === branch.district.id;
                        }
                        return d.id === branch.district_id;
                    });

                    if (district) {
                        console.log('Found district:', district);
                        this.branchForm.patchValue({ districts: district.id }, { emitEvent: false });
                    } else {
                        console.warn('District not found');
                    }
                    this.loadingDistricts = false;
                    districtsLoaded = true;
                    checkComplete();
                },
                error: (error) => {
                    console.error('Error loading districts:', error);
                    this.loadingDistricts = false;
                    districtsLoaded = true;
                    checkComplete();
                }
            });

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
                        console.warn('City not found');
                    }
                    this.loadingCities = false;
                    citiesLoaded = true;
                    checkComplete();
                },
                error: (error) => {
                    console.error('Error loading cities:', error);
                    this.loadingCities = false;
                    citiesLoaded = true;
                    checkComplete();
                }
            });
        } else {
            this.loadingBranch = false;
            console.warn('State not found for branch. Available states:', this.stateList.map(s => ({ id: s.id, name: s.name })));
        }
    }

    /**
     * Find coordinator ID by name
     */
    findCoordinatorId(name: string): number | null {
        const coordinator = this.coordinatorsList.find(c => c.name === name);
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

    get childBranches(): FormArray {
        return this.branchForm.get('childBranches') as FormArray;
    }

    addChildBranch() {
        this.childBranches.push(this.fb.group({
            id: [null], // Will be set when branch is selected
            name: ['', Validators.required],
            address: ['', Validators.required]
        }));

        // Watch for name changes to update id
        const lastIndex = this.childBranches.length - 1;
        this.childBranches.at(lastIndex).get('name')?.valueChanges.subscribe(selectedBranchId => {
            if (selectedBranchId) {
                const selectedBranch = this.childBranchesList.find(b => b.id.toString() === selectedBranchId.toString());
                if (selectedBranch) {
                    this.childBranches.at(lastIndex).patchValue({
                        id: selectedBranch.id,
                        address: selectedBranch.address || ''
                    }, { emitEvent: false });
                }
            }
        });
    }

    removeChildBranch(index: number) {
        const childControl = this.childBranches.at(index);
        const childId = childControl.get('id')?.value;

        if (childId) {
            // Existing child branch - confirm deletion
            this.confirmationDialog.confirmDelete({
                title: 'Delete Child Branch',
                text: 'Are you sure you want to delete this child branch? This action cannot be undone and will remove all associated data.',
                successTitle: 'Child Branch Deleted',
                successText: 'Child branch deleted successfully',
                showSuccessMessage: false
            }).then((result) => {
                if (result.value) {
                    // Delete child branch using new service
                    this.childBranchService.deleteChildBranch(childId).subscribe({
                        next: () => {
                            this.childBranches.removeAt(index);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Child branch deleted successfully',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.error('Error deleting child branch:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete child branch. Please try again.',
                                life: 5000
                            });
                        }
                    });
                }
            });
        } else {
            // New child branch - just remove from form
            this.childBranches.removeAt(index);
        }
    }

    addMember() {
        const memberType = this.branchForm.get('memberType')?.value || 'samarpit';
        const name = this.branchForm.get('name')?.value || '';
        const role = this.branchForm.get('role')?.value || '';
        const responsibility = this.branchForm.get('responsibility')?.value || '';
        const age = this.branchForm.get('age')?.value || '';
        const dateOfSamarpan = this.branchForm.get('dateOfSamarpan')?.value || '';
        const qualification = this.branchForm.get('qualification')?.value || '';
        const dateOfBirth = this.branchForm.get('dateOfBirth')?.value || '';
        
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
            name: '',
            role: '',
            responsibility: '',
            age: '',
            dateOfSamarpan: '',
            qualification: '',
            dateOfBirth: ''
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

    get filteredMembers() {
        return this.members.controls.filter(m => m.value.memberType === this.activeMemberType);
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
            const districtId = formValue.districts;
            const coordinatorId = formValue.coordinator;

            const country = this.countryList.find(c => c.id == countryId || c.id === Number(countryId));
            const state = this.stateList.find(s => s.id == stateId || s.id === Number(stateId));
            const city = this.cityList.find(c => c.id == cityId || c.id === Number(cityId));
            const district = this.districtOptions.find(d => d.id == districtId || d.id === Number(districtId));
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
                aashram_area: parseFloat(formValue.ashramArea) || 0,
                address: formValue.address || '',
                city_id: city?.id || null,
                contact_number: '', // Not in form, set empty
                coordinator_name: coordinator?.name || '',
                country_id: country?.id || null,
                daily_end_time: formValue.dailyEndTime || '',
                daily_start_time: formValue.dailyStartTime || '',
                district_id: district?.id || null,
                email: this.branchEmail || '',
                established_on: establishedOn || '',
                name: this.branchName || '',
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

            // Update branch via API (child branches are handled separately)
            this.locationService.updateBranch(this.branchId, branchData).subscribe({
                next: (response) => {
                    console.log('Branch updated successfully:', response);

                    // Handle child branches creation/update using new ChildBranchService
                    const coordinator = this.coordinatorsList.find(c => c.id.toString() === formValue.coordinator);
                    const coordinatorName = coordinator?.name || formValue.coordinator || '';

                    // Process child branches if parent branch is enabled
                    if (this.branchForm.get('isParentBranch')?.value && this.childBranches.length > 0) {
                        const childBranchOperations: any[] = [];

                        this.childBranches.controls.forEach(control => {
                            const childData = control.value;
                            const childBranchId = childData.id ? parseInt(childData.id, 10) : null;

                            // Prepare child branch payload with coordinator inherited from parent
                            const childBranchPayload: ChildBranchPayload = {
                                parent_branch_id: this.branchId!,
                                name: childData.name || '',
                                contact_number: childData.contact_number || '',
                                coordinator_name: coordinatorName, // Inherit from parent
                                email: childData.email || '',
                                established_on: childData.established_on || '',
                                aashram_area: childData.aashram_area || 0,
                                country_id: childData.country_id || null,
                                state_id: childData.state_id || null,
                                district_id: childData.district_id || null,
                                city_id: childData.city_id || null,
                                address: childData.address || '',
                                pincode: childData.pincode || '',
                                post_office: childData.post_office || '',
                                police_station: childData.police_station || '',
                                open_days: childData.open_days || '',
                                daily_start_time: childData.daily_start_time || '',
                                daily_end_time: childData.daily_end_time || '',
                                status: childData.status !== undefined ? childData.status : true,
                                ncr: childData.ncr !== undefined ? childData.ncr : false,
                                region_id: childData.region_id || null,
                                branch_code: childData.branch_code || ''
                            };

                            if (childBranchId) {
                                // Update existing child branch
                                childBranchOperations.push(
                                    this.childBranchService.updateChildBranch(childBranchId, childBranchPayload)
                                );
                            } else {
                                // Create new child branch
                                childBranchOperations.push(
                                    this.childBranchService.createChildBranch(childBranchPayload)
                                );
                            }
                        });

                        // Execute all child branch operations
                        if (childBranchOperations.length > 0) {
                            forkJoin(childBranchOperations).subscribe({
                                next: () => {
                                    console.log('Child branches processed successfully');
                                    this.saveOrUpdateMembers(() => {
                                        this.messageService.add({
                                            severity: 'success',
                                            summary: 'Success',
                                            detail: 'Branch, child branches, and members updated successfully!'
                                        });
                                        this.isSubmitting = false;
                                        setTimeout(() => {
                                            this.router.navigate(['/branch']);
                                        }, 1500);
                                    });
                                },
                                error: (error) => {
                                    console.error('Error processing child branches:', error);
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: 'Branch updated but failed to process child branches. Please try again.'
                                    });
                                    this.isSubmitting = false;
                                }
                            });
                        } else {
                            // No child branches to process, just save members
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
                        }
                    } else {
                        // Not a parent branch, just save members
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
                    }
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
                this.branchForm.get(key)?.markAsTouched();
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
     * Load districts by state ID and country ID
     */
    loadDistricts(stateId: number, countryId: number) {
        this.loadingDistricts = true;
        this.districtOptions = [];
        this.locationService.getDistrictsByStateAndCountry(stateId, countryId).subscribe({
            next: (districts) => {
                this.districtOptions = districts;
                this.loadingDistricts = false;
            },
            error: (error) => {
                console.error('Error loading districts:', error);
                this.loadingDistricts = false;
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
