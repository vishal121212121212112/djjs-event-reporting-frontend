import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, map, distinctUntilChanged, shareReplay } from 'rxjs';

/**
 * Breakpoint service that matches SCSS breakpoints exactly
 * 
 * SCSS Breakpoints (from _variables.scss):
 * - xs: 0px
 * - sm: 576px
 * - md: 768px
 * - lg: 992px
 * - xl: 1200px
 * - xxl: 1400px
 * 
 * CRITICAL: Uses max-width: 992px to match window.innerWidth <= 992 exactly.
 * At exactly 992px: window.innerWidth <= 992 = true (mobile)
 *                  max-width: 992px = true (mobile) ✅
 * 
 * This service provides reactive breakpoint detection using Angular CDK BreakpointObserver
 * instead of hardcoded window.innerWidth checks.
 * 
 * Note: BreakpointObserver uses matchMedia under the hood (still has listeners),
 * but provides cleaner, reactive, testable API.
 * 
 * IMPORTANT: Observables are defined as readonly fields (not getters) to prevent
 * creating multiple independent streams when multiple components subscribe.
 */
@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  
  // Custom breakpoints matching SCSS values exactly
  // CRITICAL: max-width: 992px matches window.innerWidth <= 992 at boundary (992px)
  private readonly mobileQuery = '(max-width: 992px)';
  private readonly tabletQuery = '(max-width: 768px)';
  private readonly mobileSmallQuery = '(max-width: 576px)';

  /**
   * Observable that emits true when viewport is mobile (≤992px)
   * Matches window.innerWidth <= 992 exactly at all boundaries
   * 
   * Defined as readonly field (not getter) to ensure single stream instance.
   * Uses refCount: true so subscription is cleaned up when no subscribers.
   * This is appropriate for breakpoint tracking (lightweight, can restart on demand).
   */
  readonly isMobile$: Observable<boolean> = this.breakpointObserver.observe(this.mobileQuery).pipe(
    map((state: BreakpointState) => state.matches),
    distinctUntilChanged(), // Prevent redundant emissions
    shareReplay({ bufferSize: 1, refCount: true }) // Share subscription, cleanup when no subscribers
  );

  /**
   * Observable that emits true when viewport is tablet or smaller (≤768px)
   */
  readonly isTabletOrSmaller$: Observable<boolean> = this.breakpointObserver.observe(this.tabletQuery).pipe(
    map((state: BreakpointState) => state.matches),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Observable that emits true when viewport is small mobile (≤576px)
   */
  readonly isSmallMobile$: Observable<boolean> = this.breakpointObserver.observe(this.mobileSmallQuery).pipe(
    map((state: BreakpointState) => state.matches),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Synchronous snapshot for mobile (≤992px)
   * Use sparingly - prefer observables for reactive code
   */
  isMobileSnapshot(): boolean {
    return this.breakpointObserver.isMatched(this.mobileQuery);
  }

  /**
   * Synchronous snapshot for tablet or smaller (≤768px)
   */
  isTabletOrSmallerSnapshot(): boolean {
    return this.breakpointObserver.isMatched(this.tabletQuery);
  }

  /**
   * Synchronous snapshot for small mobile (≤576px)
   */
  isSmallMobileSnapshot(): boolean {
    return this.breakpointObserver.isMatched(this.mobileSmallQuery);
  }

  /**
   * Observe a custom breakpoint
   * @param breakpoint CSS media query string
   */
  observe(breakpoint: string): Observable<BreakpointState> {
    return this.breakpointObserver.observe(breakpoint);
  }

  /**
   * Check if a breakpoint matches synchronously
   * @param breakpoint CSS media query string
   */
  isMatched(breakpoint: string): boolean {
    return this.breakpointObserver.isMatched(breakpoint);
  }
}

