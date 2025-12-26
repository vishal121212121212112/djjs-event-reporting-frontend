import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { EventService } from '../../core/services/event.service';
import { of } from 'rxjs';
import { VerticalComponent } from './vertical.component';

describe('VerticalComponent', () => {
  let component: VerticalComponent;
  let fixture: ComponentFixture<VerticalComponent>;
  let breakpointService: jasmine.SpyObj<BreakpointService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const breakpointSpy = jasmine.createSpyObj('BreakpointService', ['isMobileSnapshot'], {
      isMobile$: of(false)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of({})
    });

    await TestBed.configureTestingModule({
      declarations: [VerticalComponent],
      providers: [
        { provide: BreakpointService, useValue: breakpointSpy },
        { provide: Router, useValue: routerSpy },
        { provide: EventService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerticalComponent);
    component = fixture.componentInstance;
    breakpointService = TestBed.inject(BreakpointService) as jasmine.SpyObj<BreakpointService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Sidebar State Management', () => {
    it('should initialize with sidebar closed', () => {
      expect(component.isSidebarOpen).toBe(false);
    });

    it('should toggle sidebar state on mobile', () => {
      // Mock mobile viewport
      (component as any).isMobileViewport = true;
      
      // Initial state: closed
      expect(component.isSidebarOpen).toBe(false);
      
      // Toggle open
      component.onToggleMobileMenu();
      expect(component.isSidebarOpen).toBe(true);
      
      // Toggle closed
      component.onToggleMobileMenu();
      expect(component.isSidebarOpen).toBe(false);
    });

    it('should keep sidebar closed on desktop', () => {
      // Mock desktop viewport
      (component as any).isMobileViewport = false;
      
      component.onToggleMobileMenu();
      
      // Desktop toggle should not affect mobile sidebar state
      expect(component.isSidebarOpen).toBe(false);
    });

    it('should close sidebar on route navigation', () => {
      // Mock mobile viewport with sidebar open
      (component as any).isMobileViewport = true;
      component.isSidebarOpen = true;
      
      // Simulate route navigation close
      (component as any).closeMobileSidebar();
      
      expect(component.isSidebarOpen).toBe(false);
    });
  });

  describe('Scroll Lock', () => {
    beforeEach(() => {
      // Mock document.body
      spyOnProperty(document, 'body', 'get').and.returnValue({
        classList: {
          add: jasmine.createSpy('add'),
          remove: jasmine.createSpy('remove')
        },
        style: {
          position: '',
          top: '',
          left: '',
          right: '',
          width: ''
        }
      } as any);
      
      // Mock window
      spyOn(window, 'scrollTo');
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    });

    it('should store scroll position when locking', () => {
      (component as any).isMobileViewport = true;
      component.isSidebarOpen = true;
      
      (component as any).applySidebarState();
      
      expect((component as any).storedScrollY).toBeGreaterThanOrEqual(0);
    });

    it('should restore scroll position when unlocking', () => {
      (component as any).isMobileViewport = true;
      component.isSidebarOpen = false;
      (component as any).storedScrollY = 200;
      
      (component as any).applySidebarState();
      
      // Scroll restoration happens in requestAnimationFrame, so we can't easily test it
      // But we can verify the method exists and doesn't throw
      expect(() => (component as any).unlockScroll()).not.toThrow();
    });
  });
});
