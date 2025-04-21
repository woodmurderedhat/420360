export class ToastPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .toast {
          display: block;
          position: fixed;
          bottom: 1em;
          right: 1em;
          background: #333;
          color: #fff;
          padding: 1em;
          border-radius: 0.5em;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          opacity: 0;
          transition: opacity 0.3s;
        }
      </style>
      <div class="toast" role="alert"></div>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'alert');
    }
  }

  showToast(message) {
    // Simple toast: show message, fade after 2.5s
    this.shadowRoot.querySelector('.toast').textContent = message;
    this.shadowRoot.querySelector('.toast').style.opacity = 1;
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this.shadowRoot.querySelector('.toast').style.opacity = 0;
    }, 2500);
  }
}