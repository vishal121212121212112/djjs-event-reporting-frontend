import { Component, OnInit, AfterViewInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventService } from '../../core/services/event.service';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { ScrollLockService } from '../../core/services/scroll-lock.service';

// import { SIDEBAR_TYPE } from "../layouts.model";

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss']
})

/**
 * Vertical component
 */
export class VerticalComponent implements OnInit, AfterViewInit, OnDestroy {

  isCondensed: any = false;
  sidebartype: string;
  private isMobileViewport: boolean = false;
  private destroyRef = inject(DestroyRef);
  
  // Phase 4 Final Polish: Sidebar state is the single source of truth
  // All DOM classes are applied based on this state, not vice versa
  isSidebarOpen: boolean = false;

  constructor(
    private router: Router, 
    private eventService: EventService,
    private breakpointService: BreakpointService,
    private scrollLockService: ScrollLockService
  ) {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        // Close sidebar on navigation (mobile only)
        this.closeMobileSidebar();
      }
    });

    // Close sidebar when clicking outside on mobile - improved handler
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        this.handleOutsideClick(e);
      }, true); // Use capture phase for better event handling
    }
  }

  /**
   * Phase 4 Final Polish: Apply DOM classes based on isSidebarOpen state
   * This ensures isSidebarOpen is the single source of truth
   * Uses ScrollLockService for reference-counted scroll locking
   */
  private applySidebarState() {
    if (this.isMobileViewport && this.isSidebarOpen) {
      // Open sidebar - lock scroll using reference-counted service
      this.scrollLockService.lockScroll('sidebar');
      document.body.classList.add('sidebar-enable');
    } else {
      // Close sidebar (mobile) or ensure closed (desktop) - unlock scroll
      this.scrollLockService.unlockScroll('sidebar');
      document.body.classList.remove('sidebar-enable');
    }
  }

  /**
   * Close mobile sidebar
   * Phase 4 Final Polish: Update state first, then apply DOM changes
   */
  private closeMobileSidebar() {
    this.isSidebarOpen = false;
    this.applySidebarState();
  }

  /**
   * Handle click outside sidebar
   * Phase 4 Final Polish: Check state instead of DOM class
   */
  private handleOutsideClick(e: Event) {
    if (!this.isMobileViewport || !this.isSidebarOpen) {
      return;
    }

    const target = e.target as HTMLElement;
    if (!target) return;

    const sidebar = document.querySelector('.vertical-menu');
    const toggleButton = document.querySelector('#vertical-menu-btn');
    const topbar = document.querySelector('#page-topbar');

    // Check if click is inside sidebar
    const clickedInsideSidebar = sidebar && sidebar.contains(target);
    
    // Check if click is on toggle button
    const clickedToggleButton = toggleButton && (toggleButton.contains(target) || target === toggleButton);
    
    // Check if click is on topbar (hamburger menu)
    const clickedOnTopbar = topbar && topbar.contains(target);

    // Don't close if clicking inside sidebar, on toggle button, or on topbar
    if (clickedInsideSidebar || clickedToggleButton || clickedOnTopbar) {
      return;
    }

    // Close sidebar for all other clicks (backdrop, main content, etc.)
    this.closeMobileSidebar();
  }

  ngOnInit() {
    document.body.setAttribute('data-layout', 'vertical');
    
    // Subscribe to breakpoint changes for reactive mobile detection
    // Uses takeUntilDestroyed for automatic cleanup (safer than manual subscription)
    this.breakpointService.isMobile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isMobile => {
        this.isMobileViewport = isMobile;
        
        // Phase 4 Final Polish: Update state first, then apply DOM changes
        if (!isMobile) {
          // On desktop, sidebar is never "open" in mobile sense
          this.isSidebarOpen = false;
        }
        // Apply DOM changes based on new state
        this.applySidebarState();
      });
  }

  isMobile() {
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
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

  /**
   * On mobile toggle button clicked
   * Phase 4 Final Polish: Update state first, then apply DOM changes
   */
  onToggleMobileMenu() {
    if (this.isMobileViewport) {
      // Mobile behavior - toggle sidebar state
      this.isSidebarOpen = !this.isSidebarOpen;
      this.applySidebarState();
    } else {
      // Desktop behavior - toggle collapsed state (not related to mobile sidebar state)
      this.isCondensed = !this.isCondensed;
      document.body.classList.toggle('vertical-collpsed');
      // Ensure mobile sidebar state is false on desktop
      this.isSidebarOpen = false;
      this.applySidebarState();
    }
  }
}
