import { Component, OnInit, AfterViewInit, OnDestroy, DestroyRef, inject } from '@angular/core';
// import { TOPBAR } from "../layouts.model";
import { EventService } from '../../core/services/event.service';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss']
})

/**
 * Horizontal-layout component
 */
export class HorizontalComponent implements OnInit, AfterViewInit, OnDestroy {

  topbar: string;
  isCondensed: boolean;
  private isMobile: boolean = false;
  private destroyRef = inject(DestroyRef);

  constructor(
    private eventService: EventService,
    private breakpointService: BreakpointService
  ) { }

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
    
    // Subscribe to breakpoint changes for reactive mobile detection
    // Uses takeUntilDestroyed for automatic cleanup (safer than manual subscription)
    this.breakpointService.isMobile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
        
        // If resizing from mobile to desktop, ensure sidebar state is correct
        if (!isMobile) {
          // On desktop, remove mobile sidebar state
          document.body.classList.remove('sidebar-enable');
          document.body.style.overflow = '';
        }
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    // No manual cleanup needed - takeUntilDestroyed handles it automatically
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
   * Uses BreakpointService instead of hardcoded window.innerWidth check
   */
  onToggleMobileMenu() {
    if (this.isMobile) {
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
