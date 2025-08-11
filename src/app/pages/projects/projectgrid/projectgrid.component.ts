import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { Project } from '../project.model';
import { Store } from '@ngrx/store';
import { fetchprojectData } from 'src/app/store/ProjectsData/project.actions';
import { selectData } from 'src/app/store/ProjectsData/project-selector';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-projectgrid',
  templateUrl: './projectgrid.component.html',
  styleUrls: ['./projectgrid.component.scss'],

})

/**
 * Projects-grid component
 */
export class ProjectgridComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;
  returnedArray: any
  projectData: any
  // Table data
  content?: any;
  orderes?: any;
  ordersList!: Observable<Project[]>;
  total: Observable<number>;
  page: any = 1;
  endItem: any = 12;

  constructor(private modalService: BsModalService, public store: Store, private formBuilder: UntypedFormBuilder) {

  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Projects Grid', active: true }];

    this.store.dispatch(fetchprojectData());
    this.store.select(selectData).subscribe(data => {
      this.projectData = data;
      this.returnedArray = data;
      this.projectData = this.returnedArray.slice(0, 9);
    });
  }


  // page change event
  pageChanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.projectData = this.returnedArray.slice(startItem, this.endItem);
  }
}
