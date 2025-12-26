import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges, OnDestroy, HostListener, DestroyRef, inject } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HttpClient } from '@angular/common/http';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService } from '../../core/services/breakpoint.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

/**
 * Sidebar component
 */
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;
  data: any;

  menuItems: MenuItem[] = [];

  @ViewChild('sideMenu') sideMenu: ElementRef;
  private resizeListener: () => void;
  private isMobile: boolean = false;
  private destroyRef = inject(DestroyRef);

  constructor(
    private eventService: EventService, 
    private router: Router, 
    public translate: TranslateService, 
    private http: HttpClient,
    private breakpointService: BreakpointService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
        // Close sidebar on mobile after navigation
        // Uses BreakpointService - will be set in ngOnInit
        if (this.isMobile) {
          this.closeMobileSidebar();
        }
      }
    });

    // Handle window resize for responsive behavior
    this.resizeListener = () => this.handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeListener);
    }
  }

  /**
   * Handle window resize - close sidebar on mobile when switching to desktop
   * Note: This is now handled reactively via BreakpointService subscription
   * Keeping @HostListener for backwards compatibility, but it's redundant
   */
  @HostListener('window:resize', ['$event'])
  handleResize() {
    // BreakpointService subscription handles this reactively
    // This listener is kept for safety but BreakpointService is the primary handler
    if (!this.isMobile) {
      document.body.classList.remove('sidebar-enable');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }

  /**
   * Close mobile sidebar helper
   */
  private closeMobileSidebar() {
    document.body.classList.remove('sidebar-enable');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }

  ngOnDestroy() {
    // Clean up resize listener
    if (typeof window !== 'undefined' && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    // No manual subscription cleanup needed - takeUntilDestroyed handles it automatically
  }

  /**
   * Handle menu item click - close sidebar on mobile
   * Uses BreakpointService instead of hardcoded window.innerWidth check
   */
  onMenuItemClick() {
    if (this.isMobile) {
      // Small delay to allow navigation to start
      setTimeout(() => {
        this.closeMobileSidebar();
      }, 100);
    }
  }

  ngOnInit() {
    this.initialize();
    this._scrollElement();
    
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
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.height = '';
        }
      });
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0]['offsetTop'];
        if (currentPosition > 500)
          if (this.scrollRef.SimpleBar !== null)
            this.scrollRef.SimpleBar.getScrollElement().scrollTop =
              currentPosition + 300;
      }
    }, 300);
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    // tslint:disable-next-line: prefer-for-of
    const paths = [];
    for (let i = 0; i < links.length; i++) {
      paths.push(links[i]['pathname']);
    }
    var itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('mm-active');
        const parent2El = parentEl.parentElement.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;
          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');
            if (childAnchor) { childAnchor.classList.add('mm-active'); }
            if (childDropdown) { childDropdown.classList.add('mm-active'); }
            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
              }
            }
          }
        }
      }
    }

  }

  /**
   * Initialize
   */
  initialize(): void {
    this.menuItems = MENU;
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
