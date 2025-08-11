import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtiliytRoutingModule } from './utility-routing.module';
import { UIModule } from '../../shared/ui/ui.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { StarterComponent } from './starter/starter.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FaqsComponent } from './faqs/faqs.component';
import { PricingComponent } from './pricing/pricing.component';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
  declarations: [StarterComponent, TimelineComponent, FaqsComponent, PricingComponent],
  imports: [
    CommonModule,
    UtiliytRoutingModule,
    UIModule,
    TabsModule.forRoot(),
    SlickCarouselModule]
})
export class UtilityModule { }
