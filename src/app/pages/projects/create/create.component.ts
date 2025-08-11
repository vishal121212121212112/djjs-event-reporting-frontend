import { Component, OnInit, Input, EventEmitter, ViewChild, Output } from '@angular/core';
import { member } from './data';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

/**
 * Projects-create component
 */
export class CreateComponent implements OnInit {

  constructor() { }
  // bread crumb items
  breadCrumbItems: Array<{}>;
  selected: any;
  hidden: boolean;
  files: File[] = [];
  assignMember: any

  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild('dp', { static: true }) datePicker: any;

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Create New', active: true }];

    this.selected = '';
    this.hidden = true;
    this.assignMember = member;
  }

  // File Upload
  imageURL: any;
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    let file: File = event.addedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      setTimeout(() => {
        // this.profile.push(this.imageURL)
      }, 100);
    }
    reader.readAsDataURL(file)
  }

  assignList: any = []
  slectMember(id: any) {
    if (this.assignMember[id].checked == '0') {
      this.assignMember[id].checked = '1'
      this.assignList.push(this.assignMember[id])
    } else {
      this.assignMember[id].checked = '0'
      this.assignList.pop(this.assignMember[id])
    }
  }

  // filechange
  imageURLs: any;
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file)
    reader.onload = () => {
      this.imageURLs = reader.result as string;

      document.querySelectorAll('#projectlogo-img').forEach((element: any) => {
        element.src = this.imageURLs;
      });
    }
  }
  // file upload
  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false
  };

  uploadedFiles: any[] = [];

  // File Upload
  onUploadSuccess(event: any) {
    setTimeout(() => {
      this.uploadedFiles.push(event[0]);
    }, 100);
  }

  // File Remove
  removeFile(event: any) {
    this.uploadedFiles.splice(this.uploadedFiles.indexOf(event), 1);
  }

}
