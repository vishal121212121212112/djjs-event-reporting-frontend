import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
// store
import { Store } from '@ngrx/store';
import { fetchCandidatelistData } from 'src/app/store/Candidate/candidate.actions';
import { selectData } from 'src/app/store/Candidate/candidate-selector';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Performance: Only check when inputs change
})

/**
 * Candidate List Component
 * Uses OnPush for better performance with large lists
 */
export class CandidateListComponent implements OnInit, OnDestroy {

  breadCrumbItems: Array<{}>;
  lists: any;
  alllists: any;
  term: any;
  searchterm: any
  public isCollapsed: boolean = true;
  private subscription?: Subscription;

  constructor(
    public store: Store,
    private cdr: ChangeDetectorRef // Required for OnPush manual detection
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Jobs' }, { label: 'Candidate List', active: true }];

    /**
   * fetches data
   */
    this.store.dispatch(fetchCandidatelistData());
    this.subscription = this.store.select(selectData).subscribe(data => {
      // Create new array references for OnPush (immutable updates)
      this.lists = data ? [...data].slice(0, 8) : [];
      this.alllists = cloneDeep(data);
      this.cdr.markForCheck(); // Trigger change detection for OnPush
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // filter status
  taskFilter() {
    var status = (document.getElementById("idType") as HTMLInputElement).value;
    if (status) {
      // Create new array reference for OnPush (immutable update)
      this.lists = [...this.alllists].filter((data: any) => {
        return data.type === status;
      });
    }
    else {
      // Create new array reference for OnPush
      this.lists = [...this.alllists];
    }
    this.cdr.markForCheck(); // Trigger change detection
  }
  // search term
  searchTerm() {
    if (this.term) {
      // Create new array reference for OnPush (immutable update)
      this.lists = [...this.alllists].filter((el: any) => {
        return el.name.toLowerCase().includes(this.term.toLowerCase())
      });
    } else {
      // Create new array reference for OnPush
      this.lists = [...this.alllists];
    }
    this.cdr.markForCheck(); // Trigger change detection
  }

  // location
  Location() {
    if (this.searchterm) {
      // Create new array reference for OnPush (immutable update)
      this.lists = [...this.alllists].filter((el: any) => {
        return el.location.toLowerCase().includes(this.searchterm.toLowerCase())
      });
    } else {
      // Create new array reference for OnPush
      this.lists = [...this.alllists];
    }
    this.cdr.markForCheck(); // Trigger change detection
  }
  /**
   * Active Toggle navbar
   */
  activeMenu(id: any) {
    document.querySelector('.active_' + id)?.classList.toggle('active');
  }

}
