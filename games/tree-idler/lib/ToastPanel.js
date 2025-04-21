export class ToastPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
        .toast {
          display: block;
          position: fixed;
          bottom: 1.5em;
          right: 1.5em;
          background: linear-gradient(90deg, #a5d6a7 0%, #388e3c 100%);
          color: #fff;
          padding: 1.1em 2em;
          border-radius: 1em;
          box-shadow: 0 4px 16px rgba(56,142,60,0.18);
          font-family: 'Quicksand', Arial, sans-serif;
          font-size: 1.1em;
          opacity: 0;
          transition: opacity 0.3s, transform 0.3s;
          z-index: 2000;
          border: 2px solid #66bb6a;
          letter-spacing: 0.01em;
          transform: translateY(20px);
        }
        .toast.visible {
          opacity: 1;
          transform: translateY(0);
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
    const toast = this.shadowRoot.querySelector('.toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2500);
  }
}