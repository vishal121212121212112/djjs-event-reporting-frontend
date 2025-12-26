import { Injectable } from '@angular/core';

/**
 * Service to manage scroll locking with reference counting.
 * Prevents background scrolling and preserves scroll position.
 * Supports multiple lock sources (sidebar, modals, etc.) without conflicts.
 */
@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private scrollPosition = 0;
  private lockedElements: HTMLElement[] = [];
  private lockCount = 0; // Reference counter for multiple lock sources

  /**
   * Lock scrolling on the page and preserve scroll position.
   * Uses reference counting to support multiple lock sources.
   * @param source Optional identifier for debugging (e.g., 'sidebar', 'modal')
   */
  lockScroll(source?: string): void {
    // Increment lock count
    this.lockCount++;

    // If already locked, just increment counter
    if (this.lockCount > 1) {
      return;
    }

    // First lock - apply scroll lock
    const body = document.body;
    const html = document.documentElement;

    // Save current scroll position (only on first lock)
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Lock body scroll
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${this.scrollPosition}px`;
    body.style.width = '100%';

    // Lock html scroll (for some browsers)
    html.style.overflow = 'hidden';

    // Lock .page-content scroll (main content area)
    const pageContent = document.querySelector('.page-content') as HTMLElement;
    if (pageContent) {
      // Store original overflow to restore later
      (pageContent as any).__originalOverflow = pageContent.style.overflow || '';
      pageContent.style.overflow = 'hidden';
      pageContent.style.position = 'relative';
      this.lockedElements.push(pageContent);
    }

    // Prevent iOS bounce scrolling
    body.style.touchAction = 'none';

    // Add CSS class for scroll locking (allows CSS-only styling)
    body.classList.add('scroll-locked');
  }

  /**
   * Unlock scrolling and restore scroll position.
   * Uses reference counting - only unlocks when all sources release.
   * @param source Optional identifier for debugging
   */
  unlockScroll(source?: string): void {
    // Decrement lock count (never go below 0)
    if (this.lockCount > 0) {
      this.lockCount--;
    } else {
      // Already unlocked - prevent negative count
      return;
    }

    // If other sources still have locks, don't unlock yet
    if (this.lockCount > 0) {
      return;
    }

    // Last lock released - restore scroll
    const body = document.body;
    const html = document.documentElement;

    // Remove CSS class
    body.classList.remove('scroll-locked');

    // Restore body scroll
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.touchAction = '';

    // Restore html scroll
    html.style.overflow = '';

    // Restore .page-content scroll
    this.lockedElements.forEach((element) => {
      element.style.overflow = (element as any).__originalOverflow || '';
      element.style.position = '';
      delete (element as any).__originalOverflow;
    });
    this.lockedElements = [];

    // Restore scroll position (use requestAnimationFrame for smooth restoration)
    const scrollY = this.scrollPosition;
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      // Fallback: ensure scroll position is restored (some browsers need this)
      if (window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY);
      }
    });

    // Reset stored position
    this.scrollPosition = 0;
  }

  /**
   * Check if scroll is currently locked
   */
  isScrollLocked(): boolean {
    return this.lockCount > 0;
  }

  /**
   * Get current lock count (for debugging)
   */
  getLockCount(): number {
    return this.lockCount;
  }

  /**
   * Force unlock (emergency use only - resets counter to 0)
   * Use with caution - may cause issues if other components expect locks
   */
  forceUnlock(): void {
    this.lockCount = 0;
    this.unlockScroll('force');
  }
}



