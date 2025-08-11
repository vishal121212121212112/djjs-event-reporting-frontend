import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { adduserlist, deleteuserlist, fetchuserlistData, updateuserlist } from 'src/app/store/UserList/userlist.action';
import { selectData } from 'src/app/store/UserList/userlist-selector';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
})

/**
 * Contacts user-list component
 */
export class UserlistComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  term: any
  contactsList: any
  // Table data
  total: Observable<number>;
  createContactForm!: UntypedFormGroup;
  submitted = false;
  contacts: any;
  files: File[] = [];
  endItem: any

  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  deleteId: any;
  returnedArray: any

  constructor(private modalService: BsModalService, private formBuilder: UntypedFormBuilder, public store: Store) {
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'Users List', active: true }];
    setTimeout(() => {
      this.store.dispatch(fetchuserlistData());
      this.store.select(selectData).subscribe(data => {
        this.contactsList = data
        this.returnedArray = data
        this.contactsList = this.returnedArray.slice(0, 10)
      })
      document.getElementById('elmLoader')?.classList.add('d-none')
    }, 1200);

    this.createContactForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      position: ['', [Validators.required]],
      tags: ['', [Validators.required]],
      profile: ['', [Validators.required]],
    })
  }

  // File Upload
  imageURL: string | undefined;
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll('#member-img').forEach((element: any) => {
        element.src = this.imageURL;
      });
      this.createContactForm.controls['profile'].setValue(this.imageURL);
    }
    reader.readAsDataURL(file)
  }

  // Save User
  saveUser() {
    if (this.createContactForm.valid) {
      if (this.createContactForm.get('id')?.value) {
        const updatedData = this.createContactForm.value;
        this.store.dispatch(updateuserlist({ updatedData }));
      } else {
        this.createContactForm.controls['id'].setValue((this.contactsList.length + 1).toString());
        const newData = this.createContactForm.value;
        this.store.dispatch(adduserlist({ newData }));
      }
    }
    this.newContactModal?.hide()
    document.querySelectorAll('#member-img').forEach((element: any) => {
      element.src = 'assets/images/users/user-dummy-img.jpg';
    });

    setTimeout(() => {
      this.createContactForm.reset();
    }, 1000);
  }

  // fiter job
  searchJob() {
    if (this.term) {
      this.contactsList = this.returnedArray.filter((data: any) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase())
      })
    } else {
      this.contactsList = this.returnedArray
    }
  }

  // Edit User
  editUser(id: any) {
    this.submitted = false;
    this.newContactModal?.show()
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Profile';
    var updateBtn = document.getElementById('addContact-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    this.createContactForm.patchValue(this.contactsList[id]);
  }

  // pagechanged
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.contactsList = this.returnedArray.slice(startItem, this.endItem);
  }

  // Delete User
  removeUser(id: any) {
    this.deleteId = id
    this.removeItemModal?.show();
  }

  confirmDelete(id: any) {
    this.store.dispatch(deleteuserlist({ id: this.deleteId }));
    this.removeItemModal?.hide();
  }

}
