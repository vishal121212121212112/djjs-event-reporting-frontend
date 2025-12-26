import { Injectable } from '@angular/core';

/**
 * Service to manage focus for modals and dialogs.
 * Stores the element that had focus before opening, and restores it on close.
 */
@Injectable({ providedIn: 'root' })
export class FocusManagerService {
  private previousActiveElement: HTMLElement | null = null;

  /**
   * Store the currently active element before opening a modal
   */
  storeActiveElement(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  /**
   * Restore focus to the previously active element
   * Falls back to safe target if stored element is no longer in document
   */
  restoreFocus(): void {
    if (this.previousActiveElement) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Check if stored element still exists in document
        if (this.previousActiveElement && document.body.contains(this.previousActiveElement)) {
          try {
            this.previousActiveElement.focus();
          } catch (e) {
            // Element may not be focusable - fall through to fallback
            this.focusSafeFallback();
          }
        } else {
          // Element removed from DOM (e.g., route change) - use fallback
          this.focusSafeFallback();
        }
        this.previousActiveElement = null;
      });
    }
  }

  /**
   * Focus a safe fallback target when original element is unavailable
   */
  private focusSafeFallback(): void {
    // Try topbar first (navigation area)
    const topbar = document.querySelector('#page-topbar, .topbar, [role="banner"]') as HTMLElement;
    if (topbar) {
      const firstFocusable = this.findFirstFocusable(topbar);
      if (firstFocusable) {
        firstFocusable.focus();
        return;
      }
    }

    // Fallback to main content container
    const mainContent = document.querySelector('.page-content, main, [role="main"]') as HTMLElement;
    if (mainContent) {
      const firstFocusable = this.findFirstFocusable(mainContent);
      if (firstFocusable) {
        firstFocusable.focus();
        return;
      }
    }

    // Last resort: focus body (removes focus from any element)
    document.body.focus();
  }

  /**
   * Find first focusable element in a container
   */
  private findFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    return Array.from(focusableElements).find(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }) || null;
  }

  /**
   * Move focus to the first focusable element in a container
   * @param container Element to search for focusable elements
   * @returns true if focus was moved, false if no focusable element found
   */
  moveFocusToFirst(container: HTMLElement): boolean {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstFocusable = Array.from(focusableElements).find(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (firstFocusable) {
      requestAnimationFrame(() => {
        firstFocusable.focus();
      });
      return true;
    }

    return false;
  }

  /**
   * Trap focus within a container (for modal dialogs)
   * Call this in a keydown handler for Tab key
   * @param event Keyboard event
   * @param container Container element to trap focus within
   */
  trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstFocusable || !container.contains(activeElement)) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (activeElement === lastFocusable || !container.contains(activeElement)) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  /**
   * Clear stored active element (use when modal is cancelled without restoring)
   */
  clear(): void {
    this.previousActiveElement = null;
  }
}

