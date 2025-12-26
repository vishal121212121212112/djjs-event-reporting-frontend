import { Injectable, ComponentRef, ViewContainerRef, TemplateRef, Type, Injector, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ScrollLockService } from './scroll-lock.service';
import { FocusManagerService } from './focus-manager.service';

export interface ModalConfig {
  id?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  centered?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  scrollable?: boolean;
  data?: any;
  header?: string | TemplateRef<any>;
  footer?: TemplateRef<any>;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  class?: string;
}

export interface ModalInstance {
  id: string;
  componentRef?: ComponentRef<any>;
  componentType?: Type<any>; // Store component type for template rendering
  templateRef?: TemplateRef<any>;
  config: ModalConfig;
  close: () => void;
}

/**
 * Centralized modal portal service.
 * Manages all modals at the body level, ensuring they escape layout containers.
 */
@Injectable({ providedIn: 'root' })
export class ModalPortalService {
  private modalContainer?: ViewContainerRef;
  private activeModals: Map<string, ModalInstance> = new Map();
  private modalClosed$ = new Subject<string>();
  private modalOpened$ = new Subject<string>();

  constructor(
    private scrollLockService: ScrollLockService,
    private focusManager: FocusManagerService
  ) {}

  /**
   * Set the modal container (called by ModalPortalComponent)
   */
  setContainer(container: ViewContainerRef): void {
    this.modalContainer = container;
  }

  /**
   * Open a modal from a template
   */
  openTemplate(
    template: TemplateRef<any>,
    config: ModalConfig = {}
  ): ModalInstance {
    if (!this.modalContainer) {
      throw new Error('Modal container not initialized. Ensure ModalPortalComponent is in AppComponent.');
    }

    const modalId = config.id || `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (this.activeModals.has(modalId)) {
      console.warn(`Modal with id ${modalId} is already open. Closing existing modal.`);
      this.close(modalId);
    }

    const modalInstance: ModalInstance = {
      id: modalId,
      templateRef: template,
      config: {
        size: 'md',
        centered: true,
        backdrop: true,
        keyboard: true,
        scrollable: true,
        showCloseButton: true,
        closeOnBackdropClick: true,
        ...config
      },
      close: () => this.close(modalId)
    };

    this.activeModals.set(modalId, modalInstance);

    // Store active element before opening (only for first modal)
    if (this.activeModals.size === 1) {
      this.focusManager.storeActiveElement();
    }

    // Lock scroll using reference-counted service (supports multiple modals)
    this.scrollLockService.lockScroll('modal');

    // Notify container to render modal
    this.notifyContainer();

    return modalInstance;
  }

  /**
   * Open a modal from a component
   */
  openComponent<T extends object>(
    component: Type<T>,
    config: ModalConfig = {},
    injector?: Injector
  ): ModalInstance {
    if (!this.modalContainer) {
      throw new Error('Modal container not initialized. Ensure ModalPortalComponent is in AppComponent.');
    }

    const modalId = config.id || `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (this.activeModals.has(modalId)) {
      console.warn(`Modal with id ${modalId} is already open. Closing existing modal.`);
      this.close(modalId);
    }

    const modalInstance: ModalInstance = {
      id: modalId,
      componentType: component, // Store component type for template rendering
      config: {
        size: 'md',
        centered: true,
        backdrop: true,
        keyboard: true,
        scrollable: true,
        showCloseButton: true,
        closeOnBackdropClick: true,
        ...config
      },
      close: () => this.close(modalId)
    };

    this.activeModals.set(modalId, modalInstance);

    // Store active element before opening (only for first modal)
    if (this.activeModals.size === 1) {
      this.focusManager.storeActiveElement();
    }

    // Lock scroll using reference-counted service (supports multiple modals)
    this.scrollLockService.lockScroll('modal');

    // Notify container to render modal
    this.notifyContainer();
    this.modalOpened$.next(modalId);

    return modalInstance;
  }

  /**
   * Close a modal by ID
   */
  close(modalId: string): void {
    const modal = this.activeModals.get(modalId);
    if (!modal) {
      return;
    }

    // Destroy component if it exists
    if (modal.componentRef) {
      modal.componentRef.destroy();
    }

    this.activeModals.delete(modalId);
    this.modalClosed$.next(modalId);

    // Unlock scroll using reference-counted service
    this.scrollLockService.unlockScroll('modal');

    // Restore focus when last modal closes (handled by component, but clear here if needed)
    if (this.activeModals.size === 0) {
      // Focus restoration is handled by ModalPortalComponent
    }

    // Notify container to update
    this.notifyContainer();
  }

  /**
   * Close all modals
   */
  closeAll(): void {
    const modalIds = Array.from(this.activeModals.keys());
    modalIds.forEach(id => this.close(id));
  }

  /**
   * Get active modal by ID
   */
  getModal(modalId: string): ModalInstance | undefined {
    return this.activeModals.get(modalId);
  }

  /**
   * Get all active modals
   */
  getActiveModals(): ModalInstance[] {
    return Array.from(this.activeModals.values());
  }

  /**
   * Check if a modal is open
   */
  isOpen(modalId: string): boolean {
    return this.activeModals.has(modalId);
  }

  /**
   * Observable for modal close events
   */
  onModalClosed(): Observable<string> {
    return this.modalClosed$.asObservable();
  }

  /**
   * Observable for modal open events
   */
  onModalOpened(): Observable<string> {
    return this.modalOpened$.asObservable();
  }

  /**
   * Notify container component to update (internal)
   */
  private notifyContainer(): void {
    // This will be handled by the ModalPortalComponent
    // We use a custom event or the component will check activeModals
  }

  /**
   * Get modals for rendering (used by ModalPortalComponent)
   */
  getModalsForRendering(): ModalInstance[] {
    return this.getActiveModals();
  }
}

