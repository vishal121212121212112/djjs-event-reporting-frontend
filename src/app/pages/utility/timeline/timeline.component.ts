import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

/**
 * Utility timeline component
 */
export class TimelineComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor() { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Utility' }, { label: 'Timeline', active: true }];
  }

  // Timeline config
  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    dots: true
  };

}
