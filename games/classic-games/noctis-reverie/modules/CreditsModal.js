/**
 * CreditsModal.js
 * 
 * Handles the credits modal/dialog for displaying information about the app.
 */

export class CreditsModal {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.modal = null;
    this.closeButton = null;
    this.isOpen = false;
  }
  
  /**
   * Initialize the credits modal
   */
  init() {
    // Get modal elements
    this.modal = document.getElementById('credits-modal');
    this.closeButton = document.getElementById('close-credits-btn');
    
    if (!this.modal || !this.closeButton) {
      console.error('Credits modal elements not found in the DOM');
      return;
    }
    
    // Add event listeners
    this.closeButton.addEventListener('click', this.close.bind(this));
    
    // Close when clicking outside the modal (on the backdrop)
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Subscribe to showCredits event
    this.eventBus.subscribe('showCredits', () => {
      this.open();
    });
  }
  
  /**
   * Open the credits modal
   */
  open() {
    if (!this.modal) return;
    
    // Check if the browser supports the <dialog> element
    if (typeof this.modal.showModal === 'function') {
      this.modal.showModal();
    } else {
      // Fallback for browsers that don't support <dialog>
      this.modal.setAttribute('open', '');
      this.modal.style.display = 'block';
      
      // Add a backdrop if the browser doesn't support ::backdrop
      this.createBackdrop();
    }
    
    this.isOpen = true;
  }
  
  /**
   * Close the credits modal
   */
  close() {
    if (!this.modal) return;
    
    // Check if the browser supports the <dialog> element
    if (typeof this.modal.close === 'function') {
      this.modal.close();
    } else {
      // Fallback for browsers that don't support <dialog>
      this.modal.removeAttribute('open');
      this.modal.style.display = 'none';
      
      // Remove backdrop
      this.removeBackdrop();
    }
    
    this.isOpen = false;
  }
  
  /**
   * Create a backdrop for browsers that don't support ::backdrop
   */
  createBackdrop() {
    // Check if backdrop already exists
    if (document.getElementById('modal-backdrop')) {
      return;
    }
    
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    backdrop.style.zIndex = '9';
    
    // Add click handler to close modal when clicking backdrop
    backdrop.addEventListener('click', this.close.bind(this));
    
    // Insert backdrop before the modal in the DOM
    this.modal.parentNode.insertBefore(backdrop, this.modal);
  }
  
  /**
   * Remove the backdrop
   */
  removeBackdrop() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.parentNode.removeChild(backdrop);
    }
  }
  
  /**
   * Set the content of the credits modal
   * @param {string} title - Modal title
   * @param {string} content - Modal content (HTML)
   */
  setContent(title, content) {
    if (!this.modal) return;
    
    const titleElement = document.getElementById('credits-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    
    // Find the content area (all paragraphs except the last one, which contains the close button)
    const paragraphs = this.modal.querySelectorAll('p:not(:last-child)');
    
    if (paragraphs.length > 0) {
      // Replace the first paragraph with the new content
      paragraphs[0].innerHTML = content;
      
      // Remove any additional paragraphs
      for (let i = 1; i < paragraphs.length; i++) {
        paragraphs[i].parentNode.removeChild(paragraphs[i]);
      }
    } else {
      // If no paragraphs found, insert content before the close button
      const closeButtonContainer = this.closeButton.parentNode;
      const contentElement = document.createElement('p');
      contentElement.innerHTML = content;
      this.modal.insertBefore(contentElement, closeButtonContainer);
    }
  }
}
