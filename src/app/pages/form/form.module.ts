import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ColorPickerModule } from 'ngx-color-picker';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// FlatPicker
import { FlatpickrModule } from 'angularx-flatpickr';

import { UIModule } from '../../shared/ui/ui.module';
import { FormRoutingModule } from './form-routing.module';
import { ElementsComponent } from './elements/elements.component';
import { ValidationComponent } from './validation/validation.component';
import { EditorComponent } from './editor/editor.component';
import { UploadsComponent } from './uploads/uploads.component';
import { WizardComponent } from './wizard/wizard.component';
import { MaskComponent } from './mask/mask.component';
import { AdvancedformComponent } from './advancedform/advancedform.component';
import { RepeaterComponent } from './repeater/repeater.component';
import { LayoutsComponent } from './layouts/layouts.component';

// dropzone

import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [ElementsComponent, ValidationComponent, EditorComponent, UploadsComponent, WizardComponent, MaskComponent, AdvancedformComponent, RepeaterComponent, LayoutsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormRoutingModule,
    UIModule,
    CKEditorModule,
    NgStepperModule,
    CdkStepperModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgSelectModule,
    UiSwitchModule,
    ColorPickerModule,
    BsDatepickerModule.forRoot(),
    FlatpickrModule.forRoot(),
    DropzoneModule
  ],
  providers: [provideNgxMask(),
  {
    provide: DROPZONE_CONFIG,
    useValue: DEFAULT_DROPZONE_CONFIG
  }]
})
export class FormModule { }
