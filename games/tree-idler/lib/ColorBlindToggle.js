export class ColorBlindToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          cursor: pointer;
        }
      </style>
      <slot></slot>
    `;
    this.addEventListener('click', this.toggleColorBlindMode);
  }

  toggleColorBlindMode() {
    document.body.classList.toggle('color-blind-mode');
  }
}