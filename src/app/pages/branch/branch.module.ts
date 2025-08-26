import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DropzoneModule, DROPZONE_CONFIG, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { BranchRoutingModule } from './branch-routing.module';
import { BranchListComponent } from './branch-list/branch-list.component';
import { ListBranchAssistanceComponent } from './branchAssistance/list-branch-assistance/list-branch-assistance.component';
import { AddBranchAssistanceComponent } from './branchAssistance/add-branch-assistance/add-branch-assistance.component';
import { EditBranchAssistanceComponent } from './branchAssistance/edit-branch-assistance/edit-branch-assistance.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddBranchComponent } from './add-branch/add-branch.component';
import { EditBranchComponent } from './edit-branch/edit-branch.component';


const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  acceptedFiles: 'image/*,application/pdf,.doc,.docx',
  createImageThumbnails: true
};

@NgModule({
  declarations: [
    BranchListComponent,
    AddBranchComponent,
    EditBranchComponent,
    ListBranchAssistanceComponent,
    AddBranchAssistanceComponent,
    EditBranchAssistanceComponent
  ],
  imports: [
    CommonModule,
    BranchRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgStepperModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    DropzoneModule,
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    RippleModule
  ],
  providers: [
    MessageService,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ]
})
export class BranchModule {}
