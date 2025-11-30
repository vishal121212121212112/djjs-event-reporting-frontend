import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms'
import { LocationService, Country, State, District, City, Coordinator } from 'src/app/core/services/location.service'

@Component({
    selector: 'app-add-branch',
    templateUrl: './add-branch.component.html',
    styleUrls: ['./add-branch.component.scss']
})
export class AddBranchComponent implements OnInit {
    branchForm: FormGroup;
    activeMemberType: 'preacher' | 'samarpit' = 'samarpit';
    activeTab: string = 'branch';   // default tab

    //Track progress
    completion = 0; // example, bind dynamically based on form fill %
    circumference = 2 * Math.PI * 45; // radius = 45

    branchName = "Delhi Branch";
    branchEmail = "delhi.branch@example.com";
    coordinatorName = "John Doe";

    // Location data from API
    countryList: Country[] = [];
    stateList: State[] = [];
    cityList: City[] = [];
    districtOptions: District[] = [];
    coordinatorsList: Coordinator[] = [];

    // Loading states
    loadingCountries = false;
    loadingStates = false;
    loadingDistricts = false;
    loadingCities = false;
    loadingCoordinators = false;

    constructor(
        private fb: FormBuilder,
        private locationService: LocationService
    ) { }

    //for Tabs
    setActiveTab(tab: string) {
        this.activeTab = tab;
    }


    ngOnInit(): void {
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
            addressType: ['', Validators.required],
            address: ['', Validators.required],
            districts: ['', Validators.required],
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
            members: this.fb.array([])
        });

        // Fill dummy data for 8 Samarpit sewadar and 2 Preachers
        const dummyMembers = [
            { name: 'Sewadar 1', role: 'Role 1', responsibility: 'Resp 1', age: 30, dateOfSamarpan: '2020-01-01', qualification: 'Graduate', dateOfBirth: '1990-01-01', memberType: 'samarpit' },
            { name: 'Sewadar 2', role: 'Role 2', responsibility: 'Resp 2', age: 28, dateOfSamarpan: '2019-05-10', qualification: 'Post Graduate', dateOfBirth: '1992-05-10', memberType: 'samarpit' },
            { name: 'Sewadar 3', role: 'Role 3', responsibility: 'Resp 3', age: 35, dateOfSamarpan: '2018-03-15', qualification: 'Graduate', dateOfBirth: '1987-03-15', memberType: 'samarpit' },
            { name: 'Sewadar 4', role: 'Role 4', responsibility: 'Resp 4', age: 40, dateOfSamarpan: '2017-07-20', qualification: 'Diploma', dateOfBirth: '1982-07-20', memberType: 'samarpit' },
            { name: 'Sewadar 5', role: 'Role 5', responsibility: 'Resp 5', age: 25, dateOfSamarpan: '2021-09-05', qualification: 'Graduate', dateOfBirth: '1997-09-05', memberType: 'samarpit' },
            { name: 'Sewadar 6', role: 'Role 6', responsibility: 'Resp 6', age: 32, dateOfSamarpan: '2016-11-11', qualification: 'Post Graduate', dateOfBirth: '1990-11-11', memberType: 'samarpit' },
            { name: 'Sewadar 7', role: 'Role 7', responsibility: 'Resp 7', age: 29, dateOfSamarpan: '2015-12-25', qualification: 'Graduate', dateOfBirth: '1993-12-25', memberType: 'samarpit' },
            { name: 'Sewadar 8', role: 'Role 8', responsibility: 'Resp 8', age: 27, dateOfSamarpan: '2022-02-02', qualification: 'Diploma', dateOfBirth: '1995-02-02', memberType: 'samarpit' },
            { name: 'Preacher 1', role: 'Role P1', responsibility: 'Preach', age: 45, dateOfSamarpan: '2010-01-01', qualification: 'Graduate', dateOfBirth: '1975-01-01', memberType: 'preacher' },
            { name: 'Preacher 2', role: 'Role P2', responsibility: 'Preach', age: 50, dateOfSamarpan: '2008-05-10', qualification: 'Post Graduate', dateOfBirth: '1970-05-10', memberType: 'preacher' }
        ];
        dummyMembers.forEach(data => {
            this.members.push(this.fb.group({
                name: [data.name, Validators.required],
                role: [data.role, Validators.required],
                responsibility: [data.responsibility],
                age: [data.age],
                dateOfSamarpan: [data.dateOfSamarpan],
                qualification: [data.qualification],
                dateOfBirth: [data.dateOfBirth],
                memberType: [data.memberType, Validators.required]
            }));
        });

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
                this.districtOptions = [];
            }
            this.branchForm.patchValue({ state: '', city: '', districts: '' });
        });

        this.branchForm.get('state')?.valueChanges.subscribe(stateId => {
            const countryId = this.branchForm.get('country')?.value;
            if (stateId && countryId) {
                this.loadDistricts(stateId, countryId);
                this.loadCities(stateId);
            } else {
                this.cityList = [];
                this.districtOptions = [];
            }
            this.branchForm.patchValue({ city: '', districts: '' });
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

    get members(): FormArray {
        return this.branchForm.get('members') as FormArray;
    }

    addMember() {
        const memberType = this.branchForm.get('memberType')?.value || 'samarpit';
        this.members.push(this.fb.group({
            name: ['', Validators.required],
            role: ['', Validators.required],
            responsibility: [''],
            age: [''],
            dateOfSamarpan: [''],
            qualification: [''],
            dateOfBirth: [''],
            memberType: [memberType, Validators.required]
        }));
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
        if (this.branchForm.valid) {
            // handle form submission
            console.log(this.branchForm.value);
        }
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

}