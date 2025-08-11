import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { addJoblist, fetchJoblistData, updateJoblist } from 'src/app/store/Job/job.action';
import { selectData } from 'src/app/store/Job/job-selector';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})

/**
 * List Component
 */
export class ListComponent implements OnInit {
  searchTerm: any;
  modalRef?: BsModalRef;
  page: any = 1;
  // bread crumb items
  breadCrumbItems: Array<{}>;
  jobListForm!: UntypedFormGroup;
  submitted: boolean = false;
  endItem: any;
  term: any
  // Table data
  content?: any;
  lists?: any;
  total: Observable<number>;
  currentPage: any;
  joblist: any;
  searchResults: any;
  constructor(private modalService: BsModalService, private formBuilder: UntypedFormBuilder, public store: Store) {
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Jobs' }, { label: 'Jobs List', active: true }];

    /**
     * Form Validation
     */
    this.jobListForm = this.formBuilder.group({
      id: [''],
      title: ['', [Validators.required]],
      name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      experience: ['', [Validators.required]],
      position: ['', [Validators.required]],
      type: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    // store data
    this.store.dispatch(fetchJoblistData());
    this.store.select(selectData).subscribe(data => {
      this.lists = data
      this.joblist = data;
      this.lists = this.joblist.slice(0, 8)
    });
  }

  /**
  * Open modal
  * @param content modal content
  */
  openViewModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.lists.forEach((x: { state: any; }) => x.state = ev.target.checked)
  }

  // Delete Data
  delete(event: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          event.target.closest('tr')?.remove();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      });
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  /**
   * Form data get
   */
  get form() {
    return this.jobListForm.controls;
  }

  /**
  * Save user
  */
  saveUser() {
    if (this.jobListForm.valid) {
      if (this.jobListForm.get('id')?.value) {
        const updatedData = this.jobListForm.value;
        this.store.dispatch(updateJoblist({ updatedData }));
      } else {
        this.jobListForm.controls['id'].setValue(this.joblist.length + 1)
        const newData = this.jobListForm.value
        this.store.dispatch(addJoblist({ newData }))
      }
    }
    this.modalService?.hide()
    setTimeout(() => {
      this.jobListForm.reset();
    }, 1000);
  }

  /**}
   * Open Edit modal
   * @param content modal content
   */
  editDataGet(id: any, content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Order';
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";

    var listData = this.lists.filter((data: { id: any; }) => data.id === id);
    this.jobListForm.controls['title'].setValue(listData[0].title);
    this.jobListForm.controls['name'].setValue(listData[0].name);
    this.jobListForm.controls['location'].setValue(listData[0].location);
    this.jobListForm.controls['experience'].setValue(listData[0].experience);
    this.jobListForm.controls['position'].setValue(listData[0].position);
    this.jobListForm.controls['type'].setValue(listData[0].type);
    this.jobListForm.controls['status'].setValue(listData[0].status);
    this.jobListForm.controls['id'].setValue(listData[0].id);
  }

  // Search Data
  performSearch(): void {
    this.searchResults = this.joblist.filter((item: any) => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.type.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.date.toLowerCase().includes(this.searchTerm.toLowerCase())

    })
    this.lists = this.searchResults.slice(0, 8)
  }
  // pagination
  pageChanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.lists = this.joblist.slice(startItem, this.endItem)
  }

  // fiter job
  searchJob() {
    if (this.term) {
      this.lists = this.joblist.filter((data: any) => {
        return data.title.toLowerCase().includes(this.term.toLowerCase())
      })
    } else {
      this.lists = this.joblist
    }

  }

  selectstatus() {
    var status = (document.getElementById('idStatus') as HTMLInputElement).value;
    if (status) {
      this.lists = this.joblist.filter((es: any) => {
        return es.status === status
      })
    } else {
      this.lists = this.joblist
    }

  }

  selectType() {
    var type = (document.getElementById('idType') as HTMLInputElement).value;
    if (type) {
      this.lists = this.joblist.filter((es: any) => {
        return es.type === type
      })
    } else {
      this.lists = this.joblist
    }
  }
}
