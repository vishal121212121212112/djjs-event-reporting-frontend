import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { adduserlist, deleteuserlist, fetchuserlistData, updateuserlist } from 'src/app/store/UserList/userlist.action';
import { selectData } from 'src/app/store/UserList/userlist-selector';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { UserApiService, Role } from 'src/app/core/services/user-api.service';

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
  roles: Role[] = [];
  loading = false;

  constructor(
    private modalService: BsModalService, 
    private formBuilder: UntypedFormBuilder, 
    public store: Store,
    private userApiService: UserApiService
  ) {
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'Users List', active: true }];
    
    // Load roles
    this.loadRoles();
    
    // Load users
    this.loading = true;
    this.store.dispatch(fetchuserlistData());
    this.store.select(selectData).subscribe(data => {
      this.contactsList = data || [];
      this.returnedArray = data || [];
      this.contactsList = this.returnedArray.slice(0, 10);
      this.loading = false;
      document.getElementById('elmLoader')?.classList.add('d-none');
    });

    this.createContactForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contact_number: [''],
      role_id: ['', [Validators.required]],
    });
  }

  loadRoles() {
    this.userApiService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  // Save User
  saveUser() {
    this.submitted = true;
    if (this.createContactForm.valid) {
      const formValue = this.createContactForm.value;
      if (formValue.id) {
        // Update existing user
        const updatedData = {
          id: Number(formValue.id),
          name: formValue.name,
          email: formValue.email,
          contact_number: formValue.contact_number || '',
          role_id: Number(formValue.role_id)
        };
        this.store.dispatch(updateuserlist({ updatedData }));
      } else {
        // Create new user
        const newData = {
          name: formValue.name,
          email: formValue.email,
          contact_number: formValue.contact_number || '',
          role_id: Number(formValue.role_id)
        };
        this.store.dispatch(adduserlist({ newData }));
      }
      this.newContactModal?.hide();
      setTimeout(() => {
        this.createContactForm.reset();
        this.submitted = false;
        // Refresh the list
        this.store.dispatch(fetchuserlistData());
      }, 500);
    }
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

  // Open new user modal
  openNewUserModal() {
    this.submitted = false;
    this.createContactForm.reset();
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    if (modelTitle) {
      modelTitle.innerHTML = 'Add User';
    }
    var updateBtn = document.getElementById('addContact-btn') as HTMLAreaElement;
    if (updateBtn) {
      updateBtn.innerHTML = "Add User";
    }
    this.newContactModal?.show();
  }

  // Edit User
  editUser(index: number) {
    this.submitted = false;
    const user = this.contactsList[index];
    if (user) {
      this.newContactModal?.show();
      var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
      if (modelTitle) {
        modelTitle.innerHTML = 'Edit User';
      }
      var updateBtn = document.getElementById('addContact-btn') as HTMLAreaElement;
      if (updateBtn) {
        updateBtn.innerHTML = "Update";
      }
      this.createContactForm.patchValue({
        id: user.id,
        name: user.name,
        email: user.email,
        contact_number: user.contact_number || '',
        role_id: user.role_id
      });
    }
  }

  // pagechanged
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.contactsList = this.returnedArray.slice(startItem, this.endItem);
  }

  // Delete User
  removeUser(user: any) {
    this.deleteId = user.id;
    this.removeItemModal?.show();
  }

  confirmDelete() {
    if (this.deleteId) {
      this.store.dispatch(deleteuserlist({ id: this.deleteId.toString() }));
      this.removeItemModal?.hide();
      // Refresh the list after deletion
      setTimeout(() => {
        this.store.dispatch(fetchuserlistData());
      }, 500);
    }
  }

}
