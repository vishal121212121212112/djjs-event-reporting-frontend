import { Injectable } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ScrollLockService } from './scroll-lock.service';
import { FocusManagerService } from './focus-manager.service';
import { Type } from '@angular/core';

/**
 * Bridge service to integrate ngx-bootstrap BsModalService with
 * ScrollLockService and FocusManagerService for consistent behavior.
 * 
 * This service wraps BsModalService calls to ensure:
 * - Scroll locking via ScrollLockService (reference counted)
 * - Focus management via FocusManagerService
 * - Consistent behavior with ModalPortalService
 */
@Injectable({ providedIn: 'root' })
export class BsModalBridgeService {
  private activeModalRefs: Set<BsModalRef> = new Set();

  constructor(
    private bsModalService: BsModalService,
    private scrollLockService: ScrollLockService,
    private focusManager: FocusManagerService
  ) {}

  /**
   * Show a modal with scroll lock and focus management
   */
  show<T = any>(
    content: Type<T> | string,
    config?: any
  ): BsModalRef<T> {
    // Store active element before opening (only if no other modals)
    if (this.activeModalRefs.size === 0) {
      this.focusManager.storeActiveElement();
    }

    // Lock scroll using reference-counted service
    this.scrollLockService.lockScroll('bsmodal');

    // Show modal using BsModalService
    const modalRef = this.bsModalService.show(content, config);
    this.activeModalRefs.add(modalRef);

    // Handle modal close events
    if (modalRef.onHide) {
      modalRef.onHide.subscribe(() => {
        this.handleModalClose(modalRef);
      });
    }

    // Fallback: also check onHidden
    if (modalRef.onHidden) {
      modalRef.onHidden.subscribe(() => {
        this.handleModalClose(modalRef);
      });
    }

    return modalRef;
  }

  /**
   * Handle modal close
   */
  private handleModalClose(modalRef: BsModalRef): void {
    this.activeModalRefs.delete(modalRef);

    // Unlock scroll using reference-counted service
    this.scrollLockService.unlockScroll('bsmodal');

    // Restore focus when last modal closes
    if (this.activeModalRefs.size === 0) {
      this.focusManager.restoreFocus();
    }
  }

  /**
   * Hide a specific modal
   */
  hide(level?: number): void {
    this.bsModalService.hide(level);
  }

  /**
   * Get number of active modals
   */
  getActiveModalCount(): number {
    return this.activeModalRefs.size;
  }
}

