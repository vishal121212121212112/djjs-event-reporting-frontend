import { Component, OnInit } from '@angular/core';

import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Store } from '@ngrx/store';
import { fetchprojectData } from 'src/app/store/ProjectsData/project.actions';
import { selectData } from 'src/app/store/ProjectsData/project-selector';

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.scss']
})

/**
 * Projects-list component
 */
export class ProjectlistComponent implements OnInit {
  totalItems = 12
  // bread crumb items
  breadCrumbItems: Array<{}>;
  total$: any
  page: any = 1;
  endItem: any = 12;
  returnedArray: any;
  projectlist: any

  constructor(public store: Store) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Projects List', active: true }];

    this.store.dispatch(fetchprojectData());
    this.store.select(selectData).subscribe(data => {
      this.projectlist = data
      this.returnedArray = data
      this.projectlist = this.returnedArray.slice(0, 6);
    });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.projectlist = this.returnedArray.slice(startItem, this.endItem);
  }
}
