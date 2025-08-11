import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder } from '@angular/forms';

import { Store } from '@ngrx/store';
import { fetchJobgridData } from 'src/app/store/Job/job.action';
import { selecDatagrid } from 'src/app/store/Job/job-selector';


@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})

/**
 * Grid Component
 */
export class GridComponent implements OnInit {
  searchterm: any
  modalRef?: BsModalRef;
  endItem: any
  // bread crumb items
  breadCrumbItems: Array<{}>;
  public isCollapsed: boolean = true;
  submitted: boolean = false;
  // Table data
  content?: any;
  grids: any;
  gridata: any
  page: 1;
  term: any
  constructor(private formBuilder: UntypedFormBuilder, private modalService: BsModalService, public store: Store) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Jobs' }, { label: 'Jobs Grid', active: true }];

    /**
* fetches data
*/
    this.store.dispatch(fetchJobgridData());
    this.store.select(selecDatagrid).subscribe(data => {
      this.grids = data;
      this.gridata = data;
      this.grids = this.gridata.slice(0, 8)
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

  // pagechanged
  pageChanged(event: any) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.grids = this.gridata.slice(startItem, this.endItem)
  }

  // fiter job
  searchJob() {
    if (this.term) {
      this.grids = this.gridata.filter((data: any) => {
        return data.title.toLowerCase().includes(this.term.toLowerCase())
      })
    } else {
      this.grids = this.gridata
    }
    // noResultElement
    this.updateNoResultDisplay();
  }

  // no result 
  updateNoResultDisplay() {
    const paginationElement = document.getElementById('pagination-element') as HTMLElement;
    if (this.term && this.grids.length === 0) {
      paginationElement.style.display = 'none';
    } else {
      paginationElement.style.display = 'block';
    }
  }
  // location
  Location() {
    if (this.term) {
      this.grids = this.gridata.filter((el: any) => {
        return el.location.toLowerCase().includes(this.term.toLowerCase())
      });
    } else {
      this.grids = this.gridata
    }
  }
}
