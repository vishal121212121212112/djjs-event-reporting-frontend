import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgStepperModule } from 'angular-ng-stepper';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DropzoneModule } from 'ngx-dropzone-wrapper';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

import { UIModule } from '../../shared/ui/ui.module';
import { SharedModule } from '../../shared/shared.module';
import { EventsRoutingModule } from './events-routing.module';
import { EventsListComponent } from './events-list/events-list.component';
import { AddEventComponent } from './add-event/add-event.component';
import { MediaPromotionModalComponent } from './add-event/media-promotion-modal.component';
import { PromotionalMaterialModalComponent } from './add-event/promotional-material-modal.component';
import { SpecialGuestsModalComponent } from './add-event/special-guests-modal.component';
import { VolunteersModalComponent } from './add-event/volunteers-modal.component';

// Dropzone configuration
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ViewEventComponent } from './view-event/view-event.component';
import { GalleryComponent } from './gallery/gallery.component';
import { GalleryImagePreviewComponent } from './gallery/gallery-image-preview.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  acceptedFiles: 'image/*,application/pdf,.doc,.docx',
  createImageThumbnails: true
};

@NgModule({
  declarations: [
    EventsListComponent,
    AddEventComponent,
    ViewEventComponent,
    GalleryComponent,
    GalleryImagePreviewComponent,
    MediaPromotionModalComponent,
    PromotionalMaterialModalComponent,
    SpecialGuestsModalComponent,
    VolunteersModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgStepperModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    DropzoneModule,
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    RippleModule,
    UIModule,
    SharedModule,
    EventsRoutingModule
  ],
  providers: [
    MessageService,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ]
})
export class EventsModule { }
