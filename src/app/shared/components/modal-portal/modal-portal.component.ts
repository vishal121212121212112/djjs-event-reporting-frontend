import { Component, OnInit, AfterViewInit, ViewContainerRef, ChangeDetectorRef, OnDestroy, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ModalPortalService, ModalInstance } from '../../../core/services/modal-portal.service';
import { FocusManagerService } from '../../../core/services/focus-manager.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Modal Portal Component
 * Renders all modals at the body level, outside layout containers.
 * This ensures modals are never clipped by overflow or transform contexts.
 */
@Component({
  selector: 'app-modal-portal',
  templateUrl: './modal-portal.component.html',
  styleUrls: ['./modal-portal.component.scss']
})
export class ModalPortalComponent implements OnInit, AfterViewInit, OnDestroy {
  activeModals: ModalInstance[] = [];
  private destroy$ = new Subject<void>();
  private lastFocusedModalId: string | null = null;
  private focusTrapListener: ((event: KeyboardEvent) => void) | null = null;
  @ViewChildren('modalElement') modalElements!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private modalService: ModalPortalService,
    private viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef,
    private focusManager: FocusManagerService
  ) {}

  ngOnInit(): void {
    // Register container with service
    this.modalService.setContainer(this.viewContainerRef);

    // Subscribe to modal changes
    this.updateModals();
    
    // Listen for modal close events to update UI
    this.modalService.onModalClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const wasOpen = this.activeModals.length > 0;
        this.updateModals();
        
        // If modal was closed and no modals remain, restore focus and cleanup
        if (wasOpen && this.activeModals.length === 0) {
          this.cleanupFocusTrap();
          this.focusManager.restoreFocus();
          this.lastFocusedModalId = null;
        }
      });
  }

  ngAfterViewInit(): void {
    // Watch for QueryList changes to handle new modals (after ViewChildren is available)
    this.modalElements.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.handleModalListChange();
      });
    
    // Initial check in case modals are already rendered
    if (this.modalElements.length > 0) {
      this.handleModalListChange();
    }
  }

  ngOnDestroy(): void {
    this.cleanupFocusTrap();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update active modals list
   */
  updateModals(): void {
    const wasEmpty = this.activeModals.length === 0;
    const previousTopModalId = this.activeModals.length > 0 ? this.activeModals[this.activeModals.length - 1].id : null;
    
    this.activeModals = this.modalService.getModalsForRendering();
    
    // Store active element when first modal opens
    if (wasEmpty && this.activeModals.length > 0) {
      this.focusManager.storeActiveElement();
      this.setupFocusTrap();
    }
    
    // Handle focus when new modal becomes topmost (focus once per newly-opened modal)
    const currentTopModalId = this.activeModals.length > 0 ? this.activeModals[this.activeModals.length - 1].id : null;
    if (currentTopModalId && currentTopModalId !== previousTopModalId && currentTopModalId !== this.lastFocusedModalId) {
      // New modal opened - focus it once
      setTimeout(() => {
        this.focusTopmostModal();
      }, 0);
    }
    
    this.cdr.detectChanges();
    
    // Setup focus trap listener after view updates
    if (this.activeModals.length > 0) {
      setTimeout(() => {
        this.setupFocusTrap();
      }, 0);
    }
  }

  /**
   * Handle QueryList changes (when modals are added/removed)
   */
  private handleModalListChange(): void {
    if (this.activeModals.length > 0) {
      const topModal = this.activeModals[this.activeModals.length - 1];
      if (topModal && topModal.id !== this.lastFocusedModalId) {
        // New modal in DOM - focus it once
        setTimeout(() => {
          this.focusTopmostModal();
        }, 0);
      }
    }
  }

  /**
   * Focus the topmost modal (only once per modal)
   */
  private focusTopmostModal(): void {
    if (!this.modalElements || this.activeModals.length === 0) {
      return;
    }

    const topModal = this.modalElements.last;
    if (!topModal?.nativeElement) {
      return;
    }

    const topModalInstance = this.activeModals[this.activeModals.length - 1];
    if (topModalInstance.id === this.lastFocusedModalId) {
      // Already focused this modal
      return;
    }

    // Try to focus first focusable element
    const focused = this.focusManager.moveFocusToFirst(topModal.nativeElement);
    
    if (focused) {
      this.lastFocusedModalId = topModalInstance.id;
    } else {
      // Fallback: focus close button or modal container
      const closeButton = topModal.nativeElement.querySelector('.btn-close') as HTMLElement;
      if (closeButton) {
        closeButton.focus();
        this.lastFocusedModalId = topModalInstance.id;
      } else {
        // Last resort: focus modal container
        topModal.nativeElement.focus();
        this.lastFocusedModalId = topModalInstance.id;
      }
    }
  }

  /**
   * Setup document-level focus trap listener
   */
  private setupFocusTrap(): void {
    if (this.focusTrapListener || this.activeModals.length === 0) {
      return;
    }

    this.focusTrapListener = (event: KeyboardEvent) => {
      if (this.activeModals.length === 0) {
        return;
      }

      // Handle ESC key - close topmost modal only (if no overlay is open)
      if (event.key === 'Escape') {
        // Check if any PrimeNG overlay is currently visible/open
        if (this.isAnyOverlayOpen()) {
          // Overlay is open - don't close modal, let overlay handle ESC
          return;
        }

        const topModal = this.activeModals[this.activeModals.length - 1];
        if (topModal && topModal.config.keyboard !== false) {
          event.preventDefault();
          event.stopPropagation();
          this.closeModal(topModal.id);
          return;
        }
      }

      // Handle Tab key - trap focus within topmost modal
      if (event.key === 'Tab' && this.modalElements) {
        const topModal = this.modalElements.last;
        if (topModal?.nativeElement) {
          this.focusManager.trapFocus(event, topModal.nativeElement);
        }
      }
    };

    document.addEventListener('keydown', this.focusTrapListener, true);
  }

  /**
   * Cleanup focus trap listener
   */
  private cleanupFocusTrap(): void {
    if (this.focusTrapListener) {
      document.removeEventListener('keydown', this.focusTrapListener, true);
      this.focusTrapListener = null;
    }
  }

  /**
   * Check if there are active modals
   */
  hasActiveModals(): boolean {
    return this.activeModals.length > 0;
  }

  /**
   * Get modal dialog classes based on config
   */
  getModalDialogClasses(config: any): string {
    const classes: string[] = [];

    if (config.centered) {
      classes.push('modal-dialog-centered');
    }

    if (config.scrollable) {
      classes.push('modal-dialog-scrollable');
    }

    if (config.size) {
      if (config.size === 'fullscreen') {
        classes.push('modal-fullscreen');
      } else {
        classes.push(`modal-${config.size}`);
      }
    }

    if (config.class) {
      classes.push(config.class);
    }

    return classes.join(' ');
  }

  /**
   * Check if value is a template
   */
  isTemplate(value: any): boolean {
    return value && value.createEmbeddedView;
  }

  /**
   * Handle backdrop click - only close topmost modal
   */
  onBackdropClick(event: MouseEvent): void {
    // Check if click is inside a PrimeNG overlay (dropdown, calendar, etc.)
    const target = event.target as HTMLElement;
    if (this.isClickInsideOverlay(target)) {
      // Don't close modal if clicking inside overlay
      return;
    }

    // Close topmost modal if backdrop click is enabled
    const topModal = this.activeModals[this.activeModals.length - 1];
    if (topModal && topModal.config.closeOnBackdropClick !== false && topModal.config.backdrop !== 'static') {
      this.closeModal(topModal.id);
    }
  }

  /**
   * Handle modal container click (to prevent backdrop click when clicking modal content)
   */
  onModalClick(event: MouseEvent, modal: ModalInstance): void {
    // Stop propagation to prevent backdrop click
    event.stopPropagation();
    
    // If clicking the modal element itself (not content), treat as backdrop click
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal') && modal.config.closeOnBackdropClick !== false) {
      // Check if click is inside overlay
      if (!this.isClickInsideOverlay(target)) {
        this.closeModal(modal.id);
      }
    }
  }

  /**
   * Check if click target is inside a PrimeNG overlay
   */
  private isClickInsideOverlay(target: HTMLElement): boolean {
    // Check for PrimeNG overlay containers (whitelist + generic selector)
    const overlaySelectors = [
      // Specific overlay panels
      '.p-dropdown-panel',
      '.p-dropdown-items-wrapper',
      '.p-calendar-panel',
      '.p-datepicker',
      '.p-datepicker-panel',
      '.p-overlaypanel',
      '.p-menu',
      '.p-menu-list',
      '.p-tooltip',
      '.p-tooltip-text',
      '.p-toast',
      '.p-toast-message',
      // Generic PrimeNG overlay container (if available)
      '[class*="p-component-overlay"]',
      '[class*="p-overlay"]'
    ];

    for (const selector of overlaySelectors) {
      if (target.closest(selector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if any PrimeNG overlay is currently open/visible
   */
  private isAnyOverlayOpen(): boolean {
    // Check for visible PrimeNG overlay containers
    const overlaySelectors = [
      '.p-dropdown-panel:not([style*="display: none"])',
      '.p-calendar-panel:not([style*="display: none"])',
      '.p-datepicker:not([style*="display: none"])',
      '.p-datepicker-panel:not([style*="display: none"])',
      '.p-overlaypanel:not([style*="display: none"])',
      '.p-menu:not([style*="display: none"])',
      '.p-tooltip:not([style*="display: none"])'
    ];

    for (const selector of overlaySelectors) {
      const overlay = document.querySelector(selector);
      if (overlay) {
        // Check if overlay is actually visible (not just in DOM)
        const style = window.getComputedStyle(overlay);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Close a modal
   */
  closeModal(modalId: string): void {
    this.modalService.close(modalId);
    this.updateModals();
  }
}

