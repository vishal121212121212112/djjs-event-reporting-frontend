import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { taskChart, tasks } from './data';

import { ChartType, Tasklist } from './list.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Performance: Only check when inputs change
})

/**
 * Tasks-list component
 * Uses OnPush for better performance with large lists
 */
export class ListComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;

  modalRef?: BsModalRef;

  submitted = false;
  formData: UntypedFormGroup;

  taskChart: ChartType;

  upcomingTasks: Tasklist[];
  inprogressTasks: Tasklist[];
  completedTasks: Tasklist[];
  myFiles: string[] = [];
  
  // Local copy of tasks for immutable updates (required for OnPush)
  private allTasks: Tasklist[] = [];

  constructor(
    private modalService: BsModalService, 
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef // Required for OnPush manual detection
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Task List', active: true }];

    this.formData = this.formBuilder.group({
      name: ['', [Validators.required]],
      file: new UntypedFormControl('', [Validators.required]),
      taskType: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    // Initialize local copy of tasks (immutable updates for OnPush)
    this.allTasks = [...tasks];
    this._fetchData();
  }

  onFileChange(event) {
    // Create new array reference for OnPush (immutable update)
    const newFiles = [...this.myFiles];
    for (var i = 0; i < event.target.files.length; i++) {
      newFiles.push('assets/images/users/' + event.target.files[i].name);
    }
    this.myFiles = newFiles;
    this.cdr.markForCheck(); // Trigger change detection
  }

  _fetchData() {
    // Use local copy for immutable updates (required for OnPush)
    // Create new array references to trigger change detection
    this.inprogressTasks = [...this.allTasks].filter(t => t.taskType === 'inprogress');
    this.upcomingTasks = [...this.allTasks].filter(t => t.taskType === 'upcoming');
    this.completedTasks = [...this.allTasks].filter(t => t.taskType === 'completed');

    this.taskChart = taskChart;
    this.cdr.markForCheck(); // Trigger change detection for OnPush
  }


  get form() {
    return this.formData.controls;
  }

  listData() {
    if (this.formData.valid) {
      const name = this.formData.get('name').value;
      const status = this.formData.get('status').value;
      const taskType = this.formData.get('taskType').value;
      
      // Immutable update: create new array instead of mutating (required for OnPush)
      const newTask: Tasklist = {
        index: this.allTasks.length + 1,
        name,
        status,
        taskType,
        images: [...this.myFiles], // Copy array
        checked: true
      };
      
      this.allTasks = [...this.allTasks, newTask]; // Create new array reference
    }
    this.modalService.hide()
    this._fetchData();
    this.submitted = false;
    this.myFiles = []; // Reset files
  }
  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }
}
