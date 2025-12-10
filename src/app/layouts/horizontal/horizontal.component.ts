import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { TOPBAR } from "../layouts.model";
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss']
})

/**
 * Horizontal-layout component
 */
export class HorizontalComponent implements OnInit, AfterViewInit {

  topbar: string;
  isCondensed: boolean;

  constructor(private eventService: EventService) { }

  ngOnInit() {

    // this.topbar = TOPBAR;

    this.eventService.subscribe('changeTopbar', (topbar) => {
      this.topbar = topbar;
      this.changeTopbar(this.topbar);
    });

    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');

    this.changeTopbar(this.topbar);
  }

  ngAfterViewInit() {
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  changeTopbar(topbar: string) {
    switch (topbar) {
      case "light":
        document.body.setAttribute("data-topbar", "light");
        break;
      case "dark":
        document.body.setAttribute("data-topbar", "dark");
        break;
      case "colored":
        document.body.setAttribute("data-topbar", "colored");
        break;
      default:
        document.body.setAttribute("data-topbar", "dark");
        break;
    }
  }

  /**
 * On mobile toggle button clicked
 */
  onToggleMobileMenu() {
    const isMobile = window.innerWidth <= 992;

    if (isMobile) {
      // Mobile behavior - toggle sidebar overlay
      document.body.classList.toggle('sidebar-enable');
      // Prevent body scroll when sidebar is open
      if (document.body.classList.contains('sidebar-enable')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      // Desktop behavior - toggle collapsed state
      this.isCondensed = !this.isCondensed;
      document.body.classList.toggle('vertical-collpsed');
      document.body.classList.remove('sidebar-enable');
    }
  }

}
