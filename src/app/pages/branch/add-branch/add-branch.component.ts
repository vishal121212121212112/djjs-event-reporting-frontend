import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms'
import { LocationService, BranchPayload, Country, State, City, Coordinator } from 'src/app/core/services/location.service'
import { TokenStorageService } from 'src/app/core/services/token-storage.service'
import { Router } from '@angular/router'
import { MessageService } from 'primeng/api'

@Component({
    selector: 'app-add-branch',
    templateUrl: './add-branch.component.html',
    styleUrls: ['./add-branch.component.scss']
})
export class AddBranchComponent implements OnInit {
    branchForm: FormGroup;
    activeTab: string = 'branch';   // default tab

    //Track progress
    completion = 0; // example, bind dynamically based on form fill %
    circumference = 2 * Math.PI * 45; // radius = 45


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

    // Submitting state
    isSubmitting = false;

    // Breadcrumb items
    breadCrumbItems: Array<{}> = [];

    constructor(
        private fb: FormBuilder,
        private locationService: LocationService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        private messageService: MessageService
    ) { }



    ngOnInit(): void {
        this.branchForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            contactNumber: ['', Validators.required],
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
            address: ['', Validators.required],
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
            branchCode: ['']
        });

        // Set breadcrumbs
        this.breadCrumbItems = [
          { label: 'Branches', routerLink: '/branch' },
          { label: 'Add Branch', active: true }
        ];

        // Load countries and coordinators on init
        this.loadCountries();
        this.loadCoordinators();

        // Listen for changes to reset dependent selects
        this.branchForm.get('country')?.valueChanges.subscribe(countryId => {
            if (countryId) {
                this.loadStates(countryId);
            } else {
                this.stateList = [];
                this.cityList = [];
            }
            this.branchForm.patchValue({ state: '', city: '' });
        });

        this.branchForm.get('state')?.valueChanges.subscribe(stateId => {
            const countryId = this.branchForm.get('country')?.value;
            if (stateId && countryId) {
                this.loadCities(stateId);
            } else {
                this.cityList = [];
            }
            this.branchForm.patchValue({ city: '' });
        });

        // Watch form changes
        this.branchForm.valueChanges.subscribe(() => {
            this.updateCompletion();
        });

        this.updateCompletion(); // run once on load

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

    onSubmit() {
        // Validate form
        if (!this.branchForm.valid) {
            // Mark all fields as touched to show validation errors
            Object.keys(this.branchForm.controls).forEach(key => {
                const control = this.branchForm.get(key);
                if (control) {
                    control.markAsTouched();
                    control.markAsDirty();
                }
            });

            // Show validation error message
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields correctly before submitting.',
                life: 4000
            });
            return;
        }

        if (!this.isSubmitting) {
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

            // Get current user for created_by and updated_by
            const currentUser = this.tokenStorage.getUser();
            const createdBy = currentUser?.email || currentUser?.name || 'system';
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

            // Prepare API payload - send IDs instead of names to avoid null issues
            const branchData: BranchPayload = {
                aashram_area: parseFloat(formValue.ashramArea) || 0,
                address: formValue.address || '',
                city_id: city?.id || null,
                contact_number: formValue.contactNumber || '',
                coordinator_name: coordinator?.name || '',
                country_id: country?.id || null,
                created_by: createdBy,
                created_on: currentTimestamp,
                daily_end_time: formValue.dailyEndTime || '',
                daily_start_time: formValue.dailyStartTime || '',
                email: formValue.email || '',
                established_on: establishedOn || '',
                id: 0, // Will be set by backend
                name: formValue.name || '',
                open_days: formValue.openDays || '',
                pincode: formValue.pincode || '',
                police_station: formValue.thana || '',
                post_office: formValue.postOffice || '',
                state_id: state?.id || null,
                status: formValue.status !== undefined ? formValue.status : true,
                ncr: formValue.ncr !== undefined ? formValue.ncr : false,
                region_id: formValue.regionId ? parseInt(formValue.regionId, 10) : null,
                branch_code: formValue.branchCode || '',
                updated_by: createdBy,
                updated_on: currentTimestamp
            };

            // Submit to API
            this.locationService.createBranch(branchData).subscribe({
                next: (response) => {
                    console.log('Branch created successfully:', response);
                    const branchId = response.id;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Branch created successfully! You can now add members to this branch.',
                        life: 3000
                    });
                    this.isSubmitting = false;

                    // Redirect to branch list to show the new branch
                    setTimeout(() => {
                        this.router.navigate(['/branch']);
                    }, 1500);
                },
                error: (error) => {
                    console.error('Error creating branch:', error);
                    let errorMessage = 'Failed to create branch. Please try again.';

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
                        errorMessage = 'A branch with this email or contact number already exists.';
                    } else if (error.status === 403) {
                        errorMessage = 'You do not have permission to create branches.';
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
    }

    /**
     * Get form errors for debugging
     */
    getFormErrors(): any {
        const errors: any = {};
        Object.keys(this.branchForm.controls).forEach(key => {
            const control = this.branchForm.get(key);
            if (control && control.errors) {
                errors[key] = control.errors;
            }
        });
        return errors;
    }

    /**
     * Load countries from API
     */
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
     * Load coordinators from API
     */
    loadCoordinators() {
        this.loadingCoordinators = true;
        this.locationService.getCoordinators().subscribe({
            next: (coordinators) => {
                this.coordinatorsList = coordinators;
                this.loadingCoordinators = false;
            },
            error: (error) => {
                console.error('Error loading coordinators:', error);
                this.loadingCoordinators = false;
            }
        });
    }

    /**
     * Get coordinator name for display
     */
    getCoordinatorName(): string {
        const coordinatorId = this.branchForm.get('coordinator')?.value;
        if (coordinatorId) {
            const coordinator = this.coordinatorsList.find(c => c.id == coordinatorId || c.id === Number(coordinatorId));
            return coordinator?.name || '';
        }
        return '';
    }

}