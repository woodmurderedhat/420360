/**
 * Text Tool - place text on canvas using a built-in 4×5 pixel bitmap font
 */

import state from "../core/state.js";
import { validCoordinates } from "../core/math.js";
import { PIXEL_SIZE } from "../config/constants.js";

// ---------------------------------------------------------------------------
// 4×5 pixel bitmap font
// Each character is 5 rows × 4 columns.
// Each row is a 4-bit mask: bit 3 = column 0 (left), bit 0 = column 3 (right).
// Characters are rendered at stride 5 (4px glyph + 1px gap).
// ---------------------------------------------------------------------------
const FONT = {
  " ": [0b0000, 0b0000, 0b0000, 0b0000, 0b0000],
  "!": [0b0100, 0b0100, 0b0100, 0b0000, 0b0100],
  "?": [0b0110, 0b1001, 0b0010, 0b0000, 0b0100],
  ".": [0b0000, 0b0000, 0b0000, 0b0000, 0b0100],
  ",": [0b0000, 0b0000, 0b0000, 0b0100, 0b1000],
  ":": [0b0000, 0b0100, 0b0000, 0b0100, 0b0000],
  "-": [0b0000, 0b0000, 0b1110, 0b0000, 0b0000],
  "_": [0b0000, 0b0000, 0b0000, 0b0000, 0b1111],
  "(": [0b0010, 0b0100, 0b0100, 0b0100, 0b0010],
  ")": [0b1000, 0b0100, 0b0100, 0b0100, 0b1000],
  "0": [0b0110, 0b1011, 0b1101, 0b1001, 0b0110],
  "1": [0b0100, 0b1100, 0b0100, 0b0100, 0b1110],
  "2": [0b0110, 0b1001, 0b0010, 0b0100, 0b1111],
  "3": [0b1110, 0b0001, 0b0110, 0b0001, 0b1110],
  "4": [0b1001, 0b1001, 0b1111, 0b0001, 0b0001],
  "5": [0b1111, 0b1000, 0b1110, 0b0001, 0b1110],
  "6": [0b0111, 0b1000, 0b1110, 0b1001, 0b0110],
  "7": [0b1111, 0b0001, 0b0010, 0b0100, 0b0100],
  "8": [0b0110, 0b1001, 0b0110, 0b1001, 0b0110],
  "9": [0b0110, 0b1001, 0b0111, 0b0001, 0b1110],
  "A": [0b0110, 0b1001, 0b1111, 0b1001, 0b1001],
  "B": [0b1110, 0b1001, 0b1110, 0b1001, 0b1110],
  "C": [0b0111, 0b1000, 0b1000, 0b1000, 0b0111],
  "D": [0b1110, 0b1001, 0b1001, 0b1001, 0b1110],
  "E": [0b1111, 0b1000, 0b1110, 0b1000, 0b1111],
  "F": [0b1111, 0b1000, 0b1110, 0b1000, 0b1000],
  "G": [0b0111, 0b1000, 0b1011, 0b1001, 0b0110],
  "H": [0b1001, 0b1001, 0b1111, 0b1001, 0b1001],
  "I": [0b1110, 0b0100, 0b0100, 0b0100, 0b1110],
  "J": [0b0011, 0b0001, 0b0001, 0b1001, 0b0110],
  "K": [0b1001, 0b1010, 0b1100, 0b1010, 0b1001],
  "L": [0b1000, 0b1000, 0b1000, 0b1000, 0b1111],
  "M": [0b1001, 0b1111, 0b1111, 0b1001, 0b1001],
  "N": [0b1001, 0b1101, 0b1011, 0b1001, 0b1001],
  "O": [0b0110, 0b1001, 0b1001, 0b1001, 0b0110],
  "P": [0b1110, 0b1001, 0b1110, 0b1000, 0b1000],
  "Q": [0b0110, 0b1001, 0b1001, 0b1010, 0b0101],
  "R": [0b1110, 0b1001, 0b1110, 0b1010, 0b1001],
  "S": [0b0111, 0b1000, 0b0110, 0b0001, 0b1110],
  "T": [0b1111, 0b0100, 0b0100, 0b0100, 0b0100],
  "U": [0b1001, 0b1001, 0b1001, 0b1001, 0b0110],
  "V": [0b1001, 0b1001, 0b1001, 0b0110, 0b0110],
  "W": [0b1001, 0b1001, 0b1111, 0b1111, 0b1001],
  "X": [0b1001, 0b0110, 0b0110, 0b1001, 0b1001],
  "Y": [0b1001, 0b1001, 0b0110, 0b0100, 0b0100],
  "Z": [0b1111, 0b0001, 0b0110, 0b1000, 0b1111],
};

const GLYPH_WIDTH = 4;
const GLYPH_HEIGHT = 5;
const GLYPH_STRIDE = GLYPH_WIDTH + 1; // 1px gap between chars

/**
 * Convert a string into board-coordinate cells using the bitmap font.
 * @param {string} text
 * @param {number} originX - board x of top-left of first character
 * @param {number} originY - board y of top-left of first character
 * @returns {{ x: number, y: number }[]}
 */
function textToCells(text, originX, originY) {
  const cells = [];
  const upper = text.toUpperCase();

  for (let ci = 0; ci < upper.length; ci++) {
    const ch = upper[ci];
    const glyph = FONT[ch] ?? FONT[" "];

    for (let row = 0; row < GLYPH_HEIGHT; row++) {
      for (let col = 0; col < GLYPH_WIDTH; col++) {
        if (glyph[row] & (0b1000 >> col)) {
          const px = originX + ci * GLYPH_STRIDE + col;
          const py = originY + row;
          if (validCoordinates(px, py)) {
            cells.push({ x: px, y: py });
          }
        }
      }
    }
  }

  return cells;
}

export function createTextTool(toolManager, renderer) {
  return {
    name: "text",

    // -- internal state --
    _originX: 0,
    _originY: 0,
    _inputEl: null,
    _overlayEl: null,
    _inputListener: null,
    _keydownListener: null,
    _blurListener: null,

    _getEls() {
      if (!this._inputEl) this._inputEl = document.getElementById("textInputField");
      if (!this._overlayEl) this._overlayEl = document.getElementById("textInputOverlay");
    },

    _showOverlay(clientX, clientY) {
      this._getEls();
      if (!this._overlayEl || !this._inputEl) return;

      // Position near click, keep on-screen
      const margin = 8;
      const ow = 220;
      const oh = 56;
      const left = Math.min(clientX + margin, window.innerWidth - ow - margin);
      const top = Math.min(clientY + margin, window.innerHeight - oh - margin);

      this._overlayEl.style.left = `${left}px`;
      this._overlayEl.style.top = `${top}px`;
      this._overlayEl.hidden = false;
      this._inputEl.value = "";

      // Preview as user types
      this._inputListener = () => {
        renderer.clearOverlay();
        const val = this._inputEl.value;
        if (val.length === 0) return;
        const cells = textToCells(val, this._originX, this._originY);
        renderer.overlayCtx.globalAlpha = 0.7;
        renderer.overlayCtx.fillStyle = state.selectedColor;
        for (const cell of cells) {
          renderer.overlayCtx.fillRect(cell.x * PIXEL_SIZE, cell.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
        renderer.overlayCtx.globalAlpha = 1.0;
      };

      this._keydownListener = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this._commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          this.cancel();
        }
      };

      this._blurListener = () => {
        // Small delay so Enter keydown can fire commit before blur
        setTimeout(() => {
          if (this._overlayEl && !this._overlayEl.hidden) {
            this._commit();
          }
        }, 120);
      };

      this._inputEl.addEventListener("input", this._inputListener);
      this._inputEl.addEventListener("keydown", this._keydownListener);
      this._inputEl.addEventListener("blur", this._blurListener);

      // Focus after attaching listeners
      requestAnimationFrame(() => this._inputEl?.focus());
    },

    _commit() {
      this._getEls();
      const text = this._inputEl?.value?.trim() || "";
      this._hideOverlay();
      renderer.clearOverlay();
      if (text.length > 0) {
        const cells = textToCells(text, this._originX, this._originY);
        if (cells.length > 0) {
          toolManager.commitPixels(cells, state.selectedColor);
        }
      }
    },

    _hideOverlay() {
      this._getEls();
      if (this._overlayEl) this._overlayEl.hidden = true;
      if (this._inputEl) {
        if (this._inputListener) this._inputEl.removeEventListener("input", this._inputListener);
        if (this._keydownListener) this._inputEl.removeEventListener("keydown", this._keydownListener);
        if (this._blurListener) this._inputEl.removeEventListener("blur", this._blurListener);
        this._inputEl.value = "";
      }
      this._inputListener = null;
      this._keydownListener = null;
      this._blurListener = null;
    },

    async onPointerDown(x, y, event) {
      if (!validCoordinates(x, y)) return;
      this._getEls();
      // If overlay already open, commit current text and start fresh
      if (this._overlayEl && !this._overlayEl.hidden) {
        this._commit();
      }
      this._originX = x;
      this._originY = y;
      this._showOverlay(event.clientX, event.clientY);
    },

    onPointerMove(x, y, event) {
      this._getEls();
      // Only show cursor preview when overlay is not active
      if (this._overlayEl && !this._overlayEl.hidden) return;
      renderer.clearOverlay();
      if (!validCoordinates(x, y)) return;
      const previewCells = textToCells("A", x, y);
      renderer.overlayCtx.globalAlpha = 0.5;
      renderer.overlayCtx.fillStyle = state.selectedColor;
      for (const cell of previewCells) {
        renderer.overlayCtx.fillRect(cell.x * PIXEL_SIZE, cell.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
      renderer.overlayCtx.globalAlpha = 1.0;
    },

    async onPointerUp(x, y, event) {
      // handled by onPointerDown
    },

    cancel() {
      this._hideOverlay();
      renderer.clearOverlay();
    }
  };
}
