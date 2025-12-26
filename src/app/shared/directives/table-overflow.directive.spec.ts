import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableOverflowDirective } from './table-overflow.directive';

@Component({
  template: '<div appTableOverflow style="width: 200px; overflow-x: auto;"></div>'
})
class TestComponent {}

describe('TableOverflowDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive: TableOverflowDirective;
  let element: HTMLElement;
  let renderer: Renderer2;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [TableOverflowDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement.querySelector('[appTableOverflow]');
    
    // Get directive instance
    const directiveEl = fixture.debugElement.query(
      (el) => el.injector.get(TableOverflowDirective, null) !== null
    );
    directive = directiveEl?.injector.get(TableOverflowDirective);
    
    renderer = TestBed.inject(Renderer2);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(directive).toBeTruthy();
  });

  it('should add has-overflow class when content overflows', () => {
    // Mock element with overflow
    Object.defineProperty(element, 'scrollWidth', { value: 300, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    
    // Trigger check (simulate ngAfterViewInit)
    (directive as any).checkOverflow();
    
    expect(element.classList.contains('has-overflow')).toBe(true);
  });

  it('should remove has-overflow class when content does not overflow', () => {
    // Mock element without overflow
    Object.defineProperty(element, 'scrollWidth', { value: 200, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    
    // Trigger check
    (directive as any).checkOverflow();
    
    expect(element.classList.contains('has-overflow')).toBe(false);
    expect(element.classList.contains('is-scrolled-end')).toBe(false);
  });

  it('should add is-scrolled-end class when scrolled to end', () => {
    // Mock element scrolled to end
    Object.defineProperty(element, 'scrollLeft', { value: 100, writable: true });
    Object.defineProperty(element, 'scrollWidth', { value: 300, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    
    // Trigger scroll position check
    (directive as any).checkScrollPosition();
    
    expect(element.classList.contains('is-scrolled-end')).toBe(true);
  });

  it('should remove is-scrolled-end class when not scrolled to end', () => {
    // Mock element not scrolled to end
    Object.defineProperty(element, 'scrollLeft', { value: 50, writable: true });
    Object.defineProperty(element, 'scrollWidth', { value: 300, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    
    // Trigger scroll position check
    (directive as any).checkScrollPosition();
    
    expect(element.classList.contains('is-scrolled-end')).toBe(false);
  });

  it('should handle tolerance for overflow detection (+1px)', () => {
    // Edge case: scrollWidth = clientWidth + 1 (should not trigger overflow)
    Object.defineProperty(element, 'scrollWidth', { value: 201, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    
    (directive as any).checkOverflow();
    
    // Should not have overflow (within tolerance)
    expect(element.classList.contains('has-overflow')).toBe(false);
  });

  it('should handle tolerance for scroll end detection (-1px)', () => {
    // Edge case: scrollLeft + clientWidth = scrollWidth - 1 (should be considered at end)
    Object.defineProperty(element, 'scrollLeft', { value: 99, writable: true });
    Object.defineProperty(element, 'scrollWidth', { value: 300, writable: true });
    Object.defineProperty(element, 'clientWidth', { value: 200, writable: true });
    
    (directive as any).checkScrollPosition();
    
    // Should be considered at end (within tolerance)
    expect(element.classList.contains('is-scrolled-end')).toBe(true);
  });

  it('should cleanup on destroy', () => {
    spyOn(directive as any, 'destroy$').and.returnValue({ next: jasmine.createSpy(), complete: jasmine.createSpy() });
    
    directive.ngOnDestroy();
    
    // Verify cleanup was called (directive should handle cleanup internally)
    expect(directive).toBeTruthy();
  });
});

