import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms'


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

    countryOptions = ['India', 'Nepal', 'USA'];
    stateOptionsMap = {
        India: ['Karnataka', 'Delhi', 'Punjab'],
        Nepal: ['Bagmati', 'Gandaki'],
        USA: ['California', 'Texas']
    };
    cityOptionsMap = {
        Karnataka: ['Bangalore', 'Mysore', 'Tumkur'],
        Delhi: ['New Delhi', 'Dwarka'],
        Punjab: ['Amritsar', 'Ludhiana'],
        Bagmati: ['Kathmandu', 'Bhaktapur'],
        Gandaki: ['Pokhara'],
        California: ['Los Angeles', 'San Francisco'],
        Texas: ['Houston', 'Dallas']
    };
    districtOptionsMap = {
        Bangalore: ['Bangalore Urban', 'Bangalore Rural'],
        Mysore: ['Mysore District'],
        Tumkur: ['Tumkur District'],
        "New Delhi": ['Central Delhi'],
        Dwarka: ['South West Delhi'],
        Amritsar: ['Amritsar District'],
        Ludhiana: ['Ludhiana District'],
        Kathmandu: ['Kathmandu District'],
        Bhaktapur: ['Bhaktapur District'],
        Pokhara: ['Kaski District'],
        'Los Angeles': ['LA County'],
        'San Francisco': ['SF County'],
        Houston: ['Harris County'],
        Dallas: ['Dallas County']
    };

    countryList = this.countryOptions;
    stateList: string[] = [];
    cityList: string[] = [];
    districtOptions: string[] = [];

    constructor(private fb: FormBuilder) { }

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

        // Listen for changes to reset dependent selects
        this.branchForm.get('country')?.valueChanges.subscribe(country => {
            this.stateList = country ? this.stateOptionsMap[country] || [] : [];
            this.branchForm.patchValue({ state: '', city: '', districts: '' });
            this.cityList = [];
            this.districtOptions = [];
        });

        this.branchForm.get('state')?.valueChanges.subscribe(state => {
            this.cityList = state ? this.cityOptionsMap[state] || [] : [];
            this.branchForm.patchValue({ city: '', districts: '' });
            this.districtOptions = [];
        });

        this.branchForm.get('city')?.valueChanges.subscribe(city => {
            this.districtOptions = city ? this.districtOptionsMap[city] || [] : [];
            this.branchForm.patchValue({ districts: '' });
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

}