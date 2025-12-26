import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, AfterViewInit } from '@angular/core';
import { fromEvent, debounceTime, Subject, takeUntil } from 'rxjs';

/**
 * Directive that detects table overflow and scroll position
 * 
 * Adds classes:
 * - .has-overflow: when scrollWidth > clientWidth + 1 (content overflows)
 * - .is-scrolled-end: when user scrolls to the far right (scrollLeft + clientWidth >= scrollWidth - 1)
 * 
 * Updates on:
 * - Initial load (after view init)
 * - Resize (ResizeObserver if available, otherwise window resize with debounce)
 * - Scroll (throttled with requestAnimationFrame)
 * 
 * Used to show/hide table scroll affordances (fade indicators)
 */
@Directive({
  selector: '[appTableOverflow]',
  standalone: true
})
export class TableOverflowDirective implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;
  private scrollAnimationFrameId?: number;
  private isScrollScheduled = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // No initial check here - wait for AfterViewInit to ensure element is fully rendered
  }

  ngAfterViewInit() {
    // Initial check after view is initialized
    this.checkOverflow();

    // Use ResizeObserver if available (more efficient than window resize)
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkOverflow();
      });
      this.resizeObserver.observe(this.el.nativeElement);
    } else {
      // Fallback to window resize with debounce
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.checkOverflow();
        });
    }

    // Listen to scroll events - throttle with requestAnimationFrame for smooth performance
    fromEvent(this.el.nativeElement, 'scroll', { passive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.throttledCheckScrollPosition();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Cancel any pending animation frame
    if (this.scrollAnimationFrameId !== undefined) {
      cancelAnimationFrame(this.scrollAnimationFrameId);
    }
    
    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * Throttle scroll position check using requestAnimationFrame
   * Prevents excessive checks during rapid scrolling
   */
  private throttledCheckScrollPosition(): void {
    if (this.isScrollScheduled) {
      return; // Already scheduled
    }

    this.isScrollScheduled = true;
    this.scrollAnimationFrameId = requestAnimationFrame(() => {
      this.checkScrollPosition();
      this.isScrollScheduled = false;
    });
  }

  /**
   * Check if table content overflows container
   * Uses +1 tolerance to account for sub-pixel rendering
   */
  private checkOverflow(): void {
    const element = this.el.nativeElement;
    // Add +1 tolerance to prevent false positives from sub-pixel rendering
    const hasOverflow = element.scrollWidth > element.clientWidth + 1;

    if (hasOverflow) {
      this.renderer.addClass(element, 'has-overflow');
      // Check scroll position when overflow exists
      this.checkScrollPosition();
    } else {
      this.renderer.removeClass(element, 'has-overflow');
      // If no overflow, also remove scroll-end class
      this.renderer.removeClass(element, 'is-scrolled-end');
    }
  }

  /**
   * Check if user has scrolled to the far right
   * Uses -1 tolerance to account for rounding/sub-pixel rendering
   */
  private checkScrollPosition(): void {
    const element = this.el.nativeElement;
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;
    
    // Consider "at end" if within 1px of the right edge (account for rounding)
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    if (isAtEnd) {
      this.renderer.addClass(element, 'is-scrolled-end');
    } else {
      this.renderer.removeClass(element, 'is-scrolled-end');
    }
  }
}

