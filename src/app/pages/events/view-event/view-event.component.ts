import { Component } from '@angular/core';

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.scss']
})
export class ViewEventComponent {
  generalDetails = {
    id: '1',
    eventType: 'Katha',
    scale: 'S',
    name: 'Bhagwat Katha',
    duration: '5 May 2024 - 16 May 2024',
    timing: '5:30pm - 7:30pm',
    state: 'Karnataka',
    city: 'Bangalore',
    spiritualOrator: 'Dr. Anya Sharma',
    language: 'English',
    branch: 'Bangalore Central Branch',
    beneficiaries: { total: 50, men: 30, women: 15, children: 5 },
    initiation: { total: 50, men: 30, women: 15, children: 5 },
    specialGuests: 3,
    volunteers: 32,
    theme: 'Manthan',
    specialGuestsList: [
      {
        name: 'Jane Doe',
        phone: '000000000',
        gender: 'Female',
        designation: 'Manager',
        organization: 'ABC Corp',
        email: 'jane@abc.com',
        city: 'Bangalore',
        state: 'Karnataka',
        personalNo: '12345',
        contactPerson: 'John Doe',
        contactPhone: '111111111',
        referencePerson: 'Jane Doe',
        referencePhone: '000000000'
      }
    ],
    volunteersList: [
      {
        name: 'Jane Doe',
        days: 4,
        seva: 'Seva involved'
      }
    ],
    donations: [
      { type: 'Cash', details: '-', amount: 40000 },
      { type: 'In-kind', details: 'Rice 5kg bed-sheet - 2', amount: 5000 }
    ],
    media: {
      coverageType: 'link',
      organization: 'link',
      email: 'link.gmail.com',
      website: 'www.link.in',
      person: 'Mr. First middle last',
      designation: 'link',
      contact: '000000000',
      personEmail: 'name.gmail.com',
      referencePerson: 'Mr. First middle last',
      photos: 'Event photos',
      video: 'Video Coverage',
      pressRelease: 'Press Release',
      testimonials: 'Testimonials'
    },
    promotionalMaterials: [
      { name: 'Jane Doe', quantity: 4, size: 'A3' }
    ]
  };

  donationTypes = [
    { type: 'Cash', amount: 1000, description: 'General donation' },
    { type: 'In-kind', amount: 200, description: 'Books' }
  ];
}
