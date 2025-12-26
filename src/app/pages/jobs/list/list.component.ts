import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { ConfirmationDialogService } from 'src/app/core/services/confirmation-dialog.service';
import { Store } from '@ngrx/store';
import { addJoblist, fetchJoblistData, updateJoblist } from 'src/app/store/Job/job.action';
import { selectData } from 'src/app/store/Job/job-selector';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Performance: Only check when inputs change
})

/**
 * List Component
 * Uses OnPush for better performance with large lists
 */
export class ListComponent implements OnInit, OnDestroy {
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
  private subscription?: Subscription;

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder,
    public store: Store,
    private confirmationDialog: ConfirmationDialogService,
    private cdr: ChangeDetectorRef // Required for OnPush manual detection
  ) {
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
    this.subscription = this.store.select(selectData).subscribe(data => {
      // Create new array references for OnPush (immutable updates)
      this.joblist = data ? [...data] : [];
      this.lists = this.joblist.slice(0, 8);
      this.cdr.markForCheck(); // Trigger change detection for OnPush
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    // Create new array with updated items for OnPush (immutable update)
    this.lists = this.lists.map((x: { state: any; }) => ({ ...x, state: ev.target.checked }));
    this.cdr.markForCheck(); // Trigger change detection
  }

  // Delete Data
  delete(event: any) {
    this.confirmationDialog.confirmDelete({
      useBootstrapButtons: true,
      showCancelMessage: true
    }).then(result => {
      if (result.value) {
        event.target.closest('tr')?.remove();
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
    // Create new array references for OnPush (immutable updates)
    this.searchResults = [...this.joblist].filter((item: any) => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.type.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.date.toLowerCase().includes(this.searchTerm.toLowerCase())

    })
    this.lists = this.searchResults.slice(0, 8);
    this.cdr.markForCheck(); // Trigger change detection
  }
  // pagination
  pageChanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    // Create new array reference for OnPush (immutable update)
    this.lists = [...this.joblist].slice(startItem, this.endItem);
    this.cdr.markForCheck(); // Trigger change detection
  }

  // fiter job
  searchJob() {
    if (this.term) {
      // Create new array reference for OnPush (immutable update)
      this.lists = [...this.joblist].filter((data: any) => {
        return data.title.toLowerCase().includes(this.term.toLowerCase())
      })
    } else {
      // Create new array reference for OnPush
      this.lists = [...this.joblist];
    }
    this.cdr.markForCheck(); // Trigger change detection
  }

  selectstatus() {
    var status = (document.getElementById('idStatus') as HTMLInputElement).value;
    if (status) {
      // Create new array reference for OnPush (immutable update)
      this.lists = [...this.joblist].filter((es: any) => {
        return es.status === status
      })
    } else {
      // Create new array reference for OnPush
      this.lists = [...this.joblist];
    }
    this.cdr.markForCheck(); // Trigger change detection
  }

  selectType() {
    var type = (document.getElementById('idType') as HTMLInputElement).value;
    if (type) {
      // Create new array reference for OnPush (immutable update)
      this.lists = [...this.joblist].filter((es: any) => {
        return es.type === type
      })
    } else {
      // Create new array reference for OnPush
      this.lists = [...this.joblist];
    }
    this.cdr.markForCheck(); // Trigger change detection
  }
}
