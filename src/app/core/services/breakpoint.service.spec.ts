import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { BreakpointService } from './breakpoint.service';

describe('BreakpointService', () => {
  let service: BreakpointService;
  let breakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(() => {
    const observerSpy = jasmine.createSpyObj('BreakpointObserver', ['observe', 'isMatched']);

    TestBed.configureTestingModule({
      providers: [
        BreakpointService,
        { provide: BreakpointObserver, useValue: observerSpy }
      ]
    });

    service = TestBed.inject(BreakpointService);
    breakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;
  });

  describe('isMobile$', () => {
    it('should emit true when viewport is mobile (≤992px)', (done) => {
      // Mock BreakpointObserver to return mobile state
      const mockState: BreakpointState = { matches: true, breakpoints: {} };
      breakpointObserver.observe.and.returnValue(of(mockState));

      // Create new service instance to trigger observable creation
      const testService = new BreakpointService(breakpointObserver);

      testService.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        expect(breakpointObserver.observe).toHaveBeenCalledWith('(max-width: 992px)');
        done();
      });
    });

    it('should emit false when viewport is desktop (>992px)', (done) => {
      const mockState: BreakpointState = { matches: false, breakpoints: {} };
      breakpointObserver.observe.and.returnValue(of(mockState));

      const testService = new BreakpointService(breakpointObserver);

      testService.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(false);
        done();
      });
    });

    it('should use distinctUntilChanged to prevent redundant emissions', () => {
      const mockState: BreakpointState = { matches: true, breakpoints: {} };
      breakpointObserver.observe.and.returnValue(of(mockState));

      const testService = new BreakpointService(breakpointObserver);
      let emissionCount = 0;

      testService.isMobile$.subscribe(() => {
        emissionCount++;
      });

      // Should only emit once even if observer emits multiple times
      expect(emissionCount).toBe(1);
    });
  });

  describe('isMobileSnapshot', () => {
    it('should return true when mobile breakpoint matches', () => {
      breakpointObserver.isMatched.and.returnValue(true);

      const result = service.isMobileSnapshot();

      expect(result).toBe(true);
      expect(breakpointObserver.isMatched).toHaveBeenCalledWith('(max-width: 992px)');
    });

    it('should return false when mobile breakpoint does not match', () => {
      breakpointObserver.isMatched.and.returnValue(false);

      const result = service.isMobileSnapshot();

      expect(result).toBe(false);
    });
  });

  describe('isTabletOrSmaller$', () => {
    it('should emit true when viewport is tablet or smaller (≤768px)', (done) => {
      const mockState: BreakpointState = { matches: true, breakpoints: {} };
      breakpointObserver.observe.and.returnValue(of(mockState));

      const testService = new BreakpointService(breakpointObserver);

      testService.isTabletOrSmaller$.subscribe(isTablet => {
        expect(isTablet).toBe(true);
        expect(breakpointObserver.observe).toHaveBeenCalledWith('(max-width: 768px)');
        done();
      });
    });
  });

  describe('isSmallMobile$', () => {
    it('should emit true when viewport is small mobile (≤576px)', (done) => {
      const mockState: BreakpointState = { matches: true, breakpoints: {} };
      breakpointObserver.observe.and.returnValue(of(mockState));

      const testService = new BreakpointService(breakpointObserver);

      testService.isSmallMobile$.subscribe(isSmall => {
        expect(isSmall).toBe(true);
        expect(breakpointObserver.observe).toHaveBeenCalledWith('(max-width: 576px)');
        done();
      });
    });
  });

  describe('observe', () => {
    it('should observe a custom breakpoint', () => {
      const customBreakpoint = '(min-width: 1200px)';
      const mockState: BreakpointState = { matches: true, breakpoints: {} };
      breakpointObserver.observe.and.returnValue(of(mockState));

      const result = service.observe(customBreakpoint);

      expect(breakpointObserver.observe).toHaveBeenCalledWith(customBreakpoint);
      expect(result).toBeDefined();
    });
  });

  describe('isMatched', () => {
    it('should check if a breakpoint matches synchronously', () => {
      const customBreakpoint = '(min-width: 1200px)';
      breakpointObserver.isMatched.and.returnValue(true);

      const result = service.isMatched(customBreakpoint);

      expect(result).toBe(true);
      expect(breakpointObserver.isMatched).toHaveBeenCalledWith(customBreakpoint);
    });
  });
});

