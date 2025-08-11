import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { selectData } from 'src/app/store/UserGrid/user-selector';
import { fetchuserGridData } from 'src/app/store/UserGrid/user.action';


@Component({
  selector: 'app-usergrid',
  templateUrl: './usergrid.component.html',
  styleUrls: ['./usergrid.component.scss']
})

/**
 * Contacts user grid component
 */
export class UsergridComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  modalRef?: BsModalRef;

  selected: any;
  userForm: UntypedFormGroup;
  submitted = false;
  items: UntypedFormArray;
  // Select2 Dropdown
  selectValue: string[];
  UserGrid: any
  constructor(private modalService: BsModalService, private formBuilder: UntypedFormBuilder, public store: Store) { }

  ngOnInit() {
    this.selectValue = ['Photoshop', 'illustrator', 'Html', 'Css', 'Php', 'Java', 'Python'];

    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'Users Grid', active: true }];
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      designation: ['', [Validators.required]]
    });

    this.store.dispatch(fetchuserGridData());
    this.store.select(selectData).subscribe(data => {
      this.UserGrid = data
    })
  }

  get form() {
    return this.userForm.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }


  /**
   * Save user
   */
  // saveUser() {
  //   if (this.userForm.valid) {
  //     const name = this.userForm.get('name').value;
  //     const email = this.userForm.get('email').value;
  //     const designation = this.userForm.get('designation').value;
  //     this.userGridData.push({
  //       id: this.userGridData.length + 1,
  //       name,
  //       email,
  //       designation,
  //       projects: this.selected
  //     })
  //     this.modalService.hide()
  //   }
  //   this.submitted = true
  // }
}
