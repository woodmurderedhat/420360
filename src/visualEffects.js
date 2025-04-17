/**
 * Tarot Visual Effect Manager: Arcade-inspired visual effects for tarot cards.
 * Handles adding and rendering visual effects overlays.
 */
(function(exports) {
    /**
     * Add a tarot visual effect.
     * @param {string} type - The effect type (e.g., 'screen-shake', 'scanlines', 'neon-glow', etc.)
     * @param {number} duration - Duration in ms
     * @param {object} [options] - Additional effect options
     */
    function addTarotVisualEffect(type, duration, options = {}) {
        window.__tarotVisualEffects = window.__tarotVisualEffects || [];
        window.__tarotVisualEffects.push({
            type,
            duration,
            options,
            start: performance.now()
        });
    }

    /**
     * Render active tarot visual effects (arcade style overlays).
     * Call this after drawing the board and pieces.
     * @param {CanvasRenderingContext2D} ctx
     */
    function renderTarotEffects(ctx) {
        window.__tarotVisualEffects = window.__tarotVisualEffects || [];
        const now = performance.now();
        // Remove expired effects
        window.__tarotVisualEffects = window.__tarotVisualEffects.filter(effect => now - effect.start < effect.duration);

        for (const effect of window.__tarotVisualEffects) {
            const t = (now - effect.start) / effect.duration;
            switch (effect.type) {
                case 'screen-shake':
                    // Apply a small shake to the canvas
                    const shake = Math.sin(now / 30) * 8 * (1 - t);
                    ctx.save();
                    ctx.translate(shake, 0);
                    ctx.restore();
                    break;
                case 'scanlines':
                    // Draw scanlines overlay
                    ctx.save();
                    ctx.globalAlpha = 0.18 * (1 - t);
                    for (let y = 0; y < ctx.canvas.height; y += 4) {
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, y, ctx.canvas.width, 2);
                    }
                    ctx.globalAlpha = 1.0;
                    ctx.restore();
                    break;
                case 'neon-glow':
                    // Neon border glow
                    ctx.save();
                    ctx.shadowColor = effect.options.color || '#ffaa00';
                    ctx.shadowBlur = 40 * (1 - t);
                    ctx.lineWidth = 8;
                    ctx.strokeStyle = effect.options.color || '#ffaa00';
                    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.restore();
                    break;
                case 'particle-burst':
                    // Simple particle burst (centered)
                    ctx.save();
                    const cx = ctx.canvas.width / 2;
                    const cy = ctx.canvas.height / 2;
                    for (let i = 0; i < 24; i++) {
                        const angle = (i / 24) * 2 * Math.PI;
                        const r = 40 + 80 * t;
                        ctx.beginPath();
                        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 6 * (1 - t), 0, 2 * Math.PI);
                        ctx.fillStyle = effect.options.color || '#ffaa00';
                        ctx.globalAlpha = 0.7 * (1 - t);
                        ctx.fill();
                    }
                    ctx.globalAlpha = 1.0;
                    ctx.restore();
                    break;
                case 'flash':
                    // Full screen flash
                    ctx.save();
                    ctx.globalAlpha = 0.5 * (1 - t);
                    ctx.fillStyle = effect.options.color || '#fff';
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.globalAlpha = 1.0;
                    ctx.restore();
                    break;
                // Add more effect types as needed
            }
        }
    }

    exports.addTarotVisualEffect = addTarotVisualEffect;
    exports.renderTarotEffects = renderTarotEffects;
})(window.TarotTetris = window.TarotTetris || {});
