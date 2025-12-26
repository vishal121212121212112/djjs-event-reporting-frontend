import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LocationService, Country, State, City, Coordinator, Branch } from 'src/app/core/services/location.service'
import { ChildBranchService, ChildBranchPayload } from 'src/app/core/services/child-branch.service'
import { TokenStorageService } from 'src/app/core/services/token-storage.service'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageService } from 'primeng/api'

@Component({
    selector: 'app-add-child-branch',
    templateUrl: './add-child-branch.component.html',
    styleUrls: ['./add-child-branch.component.scss']
})
export class AddChildBranchComponent implements OnInit {
    childBranchForm: FormGroup;
    activeTab: string = 'branch';

    //Track progress
    completion = 0;
    circumference = 2 * Math.PI * 45;

    // Parent branch info
    parentBranchId: number | null = null;
    parentBranch: Branch | null = null;
    parentCoordinatorId: string = '';
    parentCoordinatorName: string = '';

    // Location data from API
    countryList: Country[] = [];
    stateList: State[] = [];
    cityList: City[] = [];

    // Loading states
    loadingCountries = false;
    loadingStates = false;
    loadingCities = false;
    loadingParentBranch = false;

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
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Get parent branch ID from route
        const parentIdParam = this.route.snapshot.paramMap.get('parentId');
        if (parentIdParam) {
            this.parentBranchId = parseInt(parentIdParam, 10);
            if (isNaN(this.parentBranchId)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Invalid parent branch ID'
                });
                this.router.navigate(['/branch']);
                return;
            }
            this.loadParentBranch();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Parent branch ID is required'
            });
            this.router.navigate(['/branch']);
            return;
        }

        this.childBranchForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            contactNumber: ['', Validators.required],
            coordinator: ['', Validators.required], // Will be pre-filled from parent
            establishedOn: ['', Validators.required],
            ashramArea: ['', Validators.required],
            country: ['', Validators.required],
            pincode: ['', Validators.required],
            postOffice: ['', Validators.required],
            thana: [''],
            state: ['', Validators.required],
            city: ['', Validators.required],
            address: ['', Validators.required],
            openDays: [''],
            dailyStartTime: [''],
            dailyEndTime: [''],
            status: [true],
            ncr: [false],
            regionId: [''],
            branchCode: ['']
        });

        // Set breadcrumbs
        this.breadCrumbItems = [
            { label: 'Branches', routerLink: '/branch' },
            { label: 'Add Child Branch', active: true }
        ];

        // Load countries on init
        this.loadCountries();

        // Listen for changes to reset dependent selects
        this.childBranchForm.get('country')?.valueChanges.subscribe(countryId => {
            if (countryId) {
                this.loadStates(countryId);
            } else {
                this.stateList = [];
                this.cityList = [];
            }
        });

        this.childBranchForm.get('state')?.valueChanges.subscribe(stateId => {
            if (stateId) {
                this.loadCities(stateId);
            } else {
                this.cityList = [];
            }
        });

        // Update completion on form changes
        this.childBranchForm.valueChanges.subscribe(() => {
            this.updateCompletion();
        });
    }

    loadParentBranch() {
        if (!this.parentBranchId) return;

        this.loadingParentBranch = true;
        this.locationService.getBranchById(this.parentBranchId).subscribe({
            next: (branch) => {
                this.parentBranch = branch;
                this.parentCoordinatorName = branch.coordinator_name || '';

                // Find coordinator ID from name
                this.locationService.getCoordinators().subscribe({
                    next: (coordinators) => {
                        const coordinator = coordinators.find(c => c.name === branch.coordinator_name);
                        if (coordinator) {
                            this.parentCoordinatorId = coordinator.id.toString();
                            // Pre-fill coordinator in form
                            this.childBranchForm.patchValue({
                                coordinator: this.parentCoordinatorId
                            });
                        }
                        this.loadingParentBranch = false;
                    },
                    error: (error) => {
                        console.error('Error loading coordinators:', error);
                        this.loadingParentBranch = false;
                    }
                });
            },
            error: (error) => {
                console.error('Error loading parent branch:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load parent branch details'
                });
                this.loadingParentBranch = false;
                this.router.navigate(['/branch']);
            }
        });
    }

    loadCountries() {
        this.loadingCountries = true;
        this.locationService.getCountries().subscribe({
            next: (countries) => {
                this.countryList = countries;
                this.loadingCountries = false;
            },
            error: (error) => {
                console.error('Error loading countries:', error);
                this.loadingCountries = false;
            }
        });
    }

    loadStates(countryId: number) {
        this.loadingStates = true;
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

    loadCities(stateId: number) {
        this.loadingCities = true;
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


    updateCompletion() {
        const requiredFields = [
            'name', 'email', 'contactNumber', 'coordinator',
            'establishedOn', 'ashramArea', 'country', 'pincode',
            'postOffice', 'state', 'city', 'address'
        ];

        let filledFields = 0;
        requiredFields.forEach(field => {
            const control = this.childBranchForm.get(field);
            if (control && control.value && control.valid) {
                filledFields++;
            }
        });

        this.completion = Math.round((filledFields / requiredFields.length) * 100);
    }

    onSubmit() {
        if (this.childBranchForm.invalid || !this.parentBranchId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill all required fields'
            });
            return;
        }

        this.isSubmitting = true;

        const formValue = this.childBranchForm.value;
        let establishedOn = formValue.establishedOn;

        if (establishedOn) {
            if (typeof establishedOn === 'string' && establishedOn.includes('T')) {
                establishedOn = new Date(establishedOn).toISOString();
            } else if (typeof establishedOn === 'string') {
                establishedOn = new Date(establishedOn + 'T00:00:00').toISOString();
            } else {
                establishedOn = new Date(establishedOn).toISOString();
            }
        }

        // Prepare API payload
        const childBranchData: ChildBranchPayload = {
            parent_branch_id: this.parentBranchId,
            name: formValue.name,
            email: formValue.email,
            contact_number: formValue.contactNumber,
            coordinator_name: this.parentCoordinatorName, // Inherit from parent
            established_on: establishedOn,
            aashram_area: parseFloat(formValue.ashramArea) || 0,
            country_id: parseInt(formValue.country),
            state_id: parseInt(formValue.state),
            city_id: parseInt(formValue.city),
            address: formValue.address,
            pincode: formValue.pincode,
            post_office: formValue.postOffice,
            police_station: formValue.thana || '',
            open_days: formValue.openDays || '',
            daily_start_time: formValue.dailyStartTime || '',
            daily_end_time: formValue.dailyEndTime || '',
            status: formValue.status !== undefined ? formValue.status : true,
            ncr: formValue.ncr !== undefined ? formValue.ncr : false,
            region_id: formValue.regionId ? parseInt(formValue.regionId) : undefined,
            branch_code: formValue.branchCode || ''
        };

        // Submit to API
        this.childBranchService.createChildBranch(childBranchData).subscribe({
            next: (response) => {
                console.log('Child branch created successfully:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Child branch created successfully!',
                    life: 3000
                });
                this.isSubmitting = false;

                // Redirect to branch list
                setTimeout(() => {
                    this.router.navigate(['/branch']);
                }, 1500);
            },
            error: (error) => {
                console.error('Error creating child branch:', error);
                let errorMessage = 'Failed to create child branch. Please try again.';

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
                } else if (error.status === 409) {
                    errorMessage = 'A child branch with this email or contact number already exists.';
                } else if (error.status === 403) {
                    errorMessage = 'You do not have permission to create child branches.';
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
    }

    getCoordinatorName(): string {
        return this.parentCoordinatorName || 'Not selected';
    }

    cancel() {
        this.router.navigate(['/branch']);
    }
}

