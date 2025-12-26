import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LocationService, Country, State, City, Branch } from 'src/app/core/services/location.service'
import { ChildBranchService, ChildBranch, ChildBranchPayload } from 'src/app/core/services/child-branch.service'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageService } from 'primeng/api'

@Component({
    selector: 'app-edit-child-branch',
    templateUrl: './edit-child-branch.component.html',
    styleUrls: ['./edit-child-branch.component.scss']
})
export class EditChildBranchComponent implements OnInit {
    childBranchForm: FormGroup;
    childBranchId: number | null = null;
    childBranch: ChildBranch | null = null;
    parentBranch: Branch | null = null;
    parentCoordinatorName: string = '';

    // Location data
    countryList: Country[] = [];
    stateList: State[] = [];
    cityList: City[] = [];

    // Loading states
    loading = false;
    isSubmitting = false;

    breadCrumbItems: Array<{}> = [];

    constructor(
        private fb: FormBuilder,
        private locationService: LocationService,
        private childBranchService: ChildBranchService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.childBranchId = parseInt(idParam, 10);
            if (isNaN(this.childBranchId)) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid child branch ID' });
                this.router.navigate(['/branch']);
                return;
            }
        } else {
            this.router.navigate(['/branch']);
            return;
        }

        this.childBranchForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            contactNumber: ['', Validators.required],
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

        this.breadCrumbItems = [
            { label: 'Branches', routerLink: '/branch' },
            { label: 'Edit Child Branch', active: true }
        ];

        this.loadCountries();
        this.loadChildBranch();

        this.childBranchForm.get('country')?.valueChanges.subscribe(countryId => {
            if (countryId) {
                this.loadStates(countryId);
            }
        });

        this.childBranchForm.get('state')?.valueChanges.subscribe(stateId => {
            if (stateId) {
                this.loadCities(stateId);
            }
        });
    }

    loadChildBranch() {
        if (!this.childBranchId) return;
        this.loading = true;

        this.childBranchService.getChildBranchById(this.childBranchId).subscribe({
            next: (childBranch) => {
                this.childBranch = childBranch;
                this.parentCoordinatorName = childBranch.coordinator_name || '';

                // Load parent branch
                if (childBranch.parent_branch_id) {
                    this.locationService.getBranchById(childBranch.parent_branch_id).subscribe({
                        next: (parent) => {
                            this.parentBranch = parent;
                        },
                        error: (error) => console.error('Error loading parent branch:', error)
                    });
                }

                // Load location data
                if (childBranch.country_id) {
                    this.loadStates(childBranch.country_id);
                    if (childBranch.state_id) {
                        this.loadCities(childBranch.state_id);
                    }
                }

                // Populate form
                let establishedDate = '';
                if (childBranch.established_on) {
                    const date = new Date(childBranch.established_on);
                    establishedDate = date.toISOString().split('T')[0];
                }

                this.childBranchForm.patchValue({
                    name: childBranch.name || '',
                    email: childBranch.email || '',
                    contactNumber: childBranch.contact_number || '',
                    establishedOn: establishedDate,
                    ashramArea: childBranch.aashram_area || 0,
                    country: childBranch.country_id || '',
                    state: childBranch.state_id || '',
                    city: childBranch.city_id || '',
                    address: childBranch.address || '',
                    pincode: childBranch.pincode || '',
                    postOffice: childBranch.post_office || '',
                    thana: childBranch.police_station || '',
                    openDays: childBranch.open_days || '',
                    dailyStartTime: childBranch.daily_start_time || '',
                    dailyEndTime: childBranch.daily_end_time || '',
                    status: childBranch.status !== undefined ? childBranch.status : true,
                    ncr: childBranch.ncr !== undefined ? childBranch.ncr : false,
                    regionId: childBranch.region_id ? childBranch.region_id.toString() : '',
                    branchCode: childBranch.branch_code || ''
                });

                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading child branch:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load child branch' });
                this.loading = false;
                this.router.navigate(['/branch']);
            }
        });
    }

    loadCountries() {
        this.locationService.getCountries().subscribe({
            next: (countries) => this.countryList = countries,
            error: (error) => console.error('Error loading countries:', error)
        });
    }

    loadStates(countryId: number) {
        this.locationService.getStatesByCountry(countryId).subscribe({
            next: (states) => this.stateList = states,
            error: (error) => console.error('Error loading states:', error)
        });
    }

    loadCities(stateId: number) {
        this.locationService.getCitiesByState(stateId).subscribe({
            next: (cities) => {
                this.cityList = cities;
            },
            error: (error) => console.error('Error loading cities:', error)
        });
    }

    onSubmit() {
        if (this.childBranchForm.invalid || !this.childBranchId) return;

        this.isSubmitting = true;
        const formValue = this.childBranchForm.value;
        let establishedOn = formValue.establishedOn;

        if (establishedOn) {
            establishedOn = new Date(establishedOn).toISOString();
        }

        const updateData: Partial<ChildBranchPayload> = {
            name: formValue.name,
            email: formValue.email,
            contact_number: formValue.contactNumber,
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
            branch_code: formValue.branchCode || ''
        };

        this.childBranchService.updateChildBranch(this.childBranchId, updateData).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Child branch updated successfully!' });
                this.isSubmitting = false;
                setTimeout(() => this.router.navigate(['/branch']), 1500);
            },
            error: (error) => {
                console.error('Error updating child branch:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update child branch' });
                this.isSubmitting = false;
            }
        });
    }

    cancel() {
        this.router.navigate(['/branch']);
    }
}

