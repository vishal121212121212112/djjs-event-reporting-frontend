import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { EventService } from '../../core/services/event.service';

// import { SIDEBAR_TYPE } from "../layouts.model";

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss']
})

/**
 * Vertical component
 */
export class VerticalComponent implements OnInit, AfterViewInit {

  isCondensed: any = false;
  sidebartype: string;

  constructor(private router: Router, private eventService: EventService) {
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
   * Close mobile sidebar
   */
  private closeMobileSidebar() {
    if (window.innerWidth <= 992) {
      document.body.classList.remove('sidebar-enable');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }

  /**
   * Handle click outside sidebar
   */
  private handleOutsideClick(e: Event) {
    const isMobile = window.innerWidth <= 992;
    if (!isMobile || !document.body.classList.contains('sidebar-enable')) {
      return;
    }

    const target = e.target as HTMLElement;
    if (!target) return;

    const sidebar = document.querySelector('.vertical-menu');
    const toggleButton = document.querySelector('#vertical-menu-btn');
    const mainContent = document.querySelector('.main-content');

    // Close if clicking on main content area (overlay)
    if (mainContent && mainContent.contains(target)) {
      this.closeMobileSidebar();
      return;
    }

    // Close if clicking outside sidebar and toggle button
    if (sidebar && toggleButton) {
      const clickedInsideSidebar = sidebar.contains(target);
      const clickedToggleButton = toggleButton.contains(target);
      const clickedOnLink = target.closest('a.side-nav-link-ref');

      // Don't close if clicking on menu items (they handle their own closing)
      if (clickedOnLink) {
        return;
      }

      // Close if clicking outside sidebar
      if (!clickedInsideSidebar && !clickedToggleButton) {
        this.closeMobileSidebar();
      }
    }
  }

  ngOnInit() {
    document.body.setAttribute('data-layout', 'vertical');
  }

  isMobile() {
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  }

  ngAfterViewInit() {
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    const isMobile = window.innerWidth <= 992;

    if (isMobile) {
      // Mobile behavior - toggle sidebar overlay
      const isOpen = document.body.classList.contains('sidebar-enable');

      if (isOpen) {
        this.closeMobileSidebar();
      } else {
        document.body.classList.add('sidebar-enable');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }
    } else {
      // Desktop behavior - toggle collapsed state
      this.isCondensed = !this.isCondensed;
      document.body.classList.toggle('vertical-collpsed');
      document.body.classList.remove('sidebar-enable');
    }
  }
}
