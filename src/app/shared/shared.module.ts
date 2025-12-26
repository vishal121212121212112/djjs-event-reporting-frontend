import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';

import { WidgetModule } from './widget/widget.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormModule } from '../pages/form/form.module';
import { PaginationComponent } from './components/pagination/pagination.component';
import { TableOverflowDirective } from './directives/table-overflow.directive';

@NgModule({
  declarations: [PaginationComponent],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule ,
    ReactiveFormsModule ,
    FormModule,
    TableOverflowDirective // Standalone directive
  ],
  exports :[
    CommonModule,
    UIModule,
    WidgetModule ,
    ReactiveFormsModule ,
    FormModule,
    PaginationComponent,
    TableOverflowDirective // Export for use in other modules
  ]
})

export class SharedModule { }
