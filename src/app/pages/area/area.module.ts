import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgStepperModule } from "angular-ng-stepper";
import { NgSelectModule } from "@ng-select/ng-select";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { DropzoneModule } from "ngx-dropzone-wrapper";

// PrimeNG Modules
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { RippleModule } from "primeng/ripple";
import { MessageService } from "primeng/api";

import { UIModule } from "../../shared/ui/ui.module";

// Dropzone configuration
import { DROPZONE_CONFIG } from "ngx-dropzone-wrapper";
import { DropzoneConfigInterface } from "ngx-dropzone-wrapper";
import { AreaRoutingModule } from "./area-routing.module";
import { TableComponent } from "./table/table.component";
import { AddBranchComponent } from "./add-branch/add-branch.component";

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: "https://httpbin.org/post",
  acceptedFiles: "image/*,application/pdf,.doc,.docx",
  createImageThumbnails: true,
};

@NgModule({
  declarations: [TableComponent, AddBranchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    RippleModule,
    UIModule,
    AreaRoutingModule,
  ],
  providers: [
    MessageService,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG,
    },
  ],
})
export class AreaModule {}
