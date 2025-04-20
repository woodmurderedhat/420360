import Config from "./Config.js";

/**
 * Renderer.js - Handles canvas rendering of the tree and its components
 * @classdesc Handles canvas rendering of the tree, roots, leaves, and fruits.
 */
export default class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.updateDimensions();
        this.fruitClickCallbacks = [];
        this.graphicsQuality = 'high'; // Default to high quality

        // Load saved graphics quality if available
        const savedQuality = localStorage.getItem('treeIdlerGraphics');
        if (savedQuality) {
            this.setGraphicsQuality(savedQuality);
        }

        // Add resize listener for responsive canvas
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Update canvas dimensions and related properties
     */
    updateDimensions() {
        // Get the current dimensions of the canvas element
        const rect = this.canvas.getBoundingClientRect();

        // Update canvas dimensions if they've changed
        if (this.canvas.width !== rect.width || this.canvas.height !== rect.height) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height * 0.8; // Tree base is near bottom
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        this.updateDimensions();
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Render the entire tree scene
     * @param {Object} gameState - Current game state
     */
    render(gameState) {
        this.updateDimensions();
        this.clear();

        // Parallax background
        this.drawParallaxBackground();

        const { tree, leaves, roots, fruits } = gameState;
        const treeProperties = tree.getCurrentStageProperties();
        const growthStage = tree.growthStage || 1;
        const maxStage = tree.maxGrowthStage || 10;

        // Calculate scale: start small, grow to fill more of the background
        // At stage 1: ~20% of height, at max: ~70%
        const minScale = 0.18;
        const maxScale = 0.7;
        const scale = minScale + (maxScale - minScale) * ((growthStage - 1) / (maxStage - 1));
        this.treeScale = scale;

        // CenterY: base of tree is a bit above bottom, but leaves room for UI overlays
        this.centerY = this.height * (0.88 - 0.18 * scale);
        this.centerX = this.width / 2;

        // Draw ground
        this.drawGround();
        // Draw roots
        this.drawRoots(roots.slots, treeProperties.branchDepth);
        // Draw trunk and branches
        this.drawTree(treeProperties.branchDepth, growthStage, maxStage);
        // Draw leaves with animation
        this.drawLeaves(leaves.slots, growthStage, maxStage, performance.now() / 1000);
        // Draw fruits
        if (fruits.enabled) {
            this.drawFruits(fruits.fruits);
        }
    }

    /**
     * Draw the parallax background
     */
    drawParallaxBackground() {
        const { COLORS } = Config;
        // Sky
        this.ctx.fillStyle = COLORS.backgroundSky;
        this.ctx.fillRect(0, 0, this.width, this.height);
        // Mountains (simple parallax)
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = COLORS.backgroundMountains;
        const offset = (performance.now() / 10000) % this.width;
        for (let i = 0; i < 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(-offset + i * this.width, this.height * 0.7);
            this.ctx.lineTo(200 - offset + i * this.width, this.height * 0.5);
            this.ctx.lineTo(400 - offset + i * this.width, this.height * 0.7);
            this.ctx.lineTo(600 - offset + i * this.width, this.height * 0.55);
            this.ctx.lineTo(800 - offset + i * this.width, this.height * 0.7);
            this.ctx.lineTo(this.width + 100 - offset + i * this.width, this.height * 0.7);
            this.ctx.lineTo(this.width + 100 - offset + i * this.width, this.height);
            this.ctx.lineTo(-100 - offset + i * this.width, this.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    /**
     * Draw the ground
     */
    drawGround() {
        this.ctx.fillStyle = Config.COLORS.backgroundGround;
        this.ctx.beginPath();
        this.ctx.rect(0, this.centerY, this.width, this.height - this.centerY);
        this.ctx.fill();

        // Add some texture
        this.ctx.fillStyle = '#654321'; // Darker brown
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = this.centerY + Math.random() * (this.height - this.centerY);
            const size = 2 + Math.random() * 5;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Draw the tree trunk and branches
     * @param {number} depth - Branch recursion depth
     * @param {number} growthStage - Current growth stage
     * @param {number} maxStage - Max growth stage
     */
    drawTree(depth, growthStage, maxStage) {
        // Scale trunk height/width with treeScale
        const trunkHeight = this.height * this.treeScale * (0.25 + 0.04 * depth);
        const trunkWidth = Math.max(8, this.width * 0.012 * this.treeScale + depth * 1.2);

        this.ctx.fillStyle = Config.COLORS.treeTrunk;
        this.ctx.beginPath();
        this.ctx.rect(this.centerX - trunkWidth / 2, this.centerY - trunkHeight, trunkWidth, trunkHeight);
        this.ctx.fill();

        // Branch length and spread scale with growth
        const startX = this.centerX;
        const startY = this.centerY - trunkHeight;
        const baseLength = this.height * this.treeScale * 0.18;
        const length = baseLength + depth * 8;
        // Spread: at stage 1, branches are more upright; at max, more horizontal
        const minSpread = Math.PI / 7;
        const maxSpread = Math.PI / 3.2;
        const spread = minSpread + (maxSpread - minSpread) * ((growthStage - 1) / (maxStage - 1));
        const angle = -Math.PI / 2;
        this.drawBranch(startX, startY, length, angle, depth, spread);
    }

    /**
     * Recursively draw a branch
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {number} length - Branch length
     * @param {number} angle - Branch angle
     * @param {number} depth - Recursion depth remaining
     * @param {number} spread - Branch spread angle
     */
    drawBranch(x, y, length, angle, depth, spread) {
        if (depth <= 0) return;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        const width = Math.max(2, 2 + depth * this.treeScale * 2);
        this.ctx.strokeStyle = '#5D4037';
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        if (!this.branchEnds) this.branchEnds = [];
        if (depth === 1) {
            this.branchEnds.push({ x: endX, y: endY, angle });
        }
        // Recursively draw child branches
        const newLength = length * (0.68 + 0.04 * this.treeScale);
        this.drawBranch(endX, endY, newLength, angle - spread, depth - 1, spread);
        this.drawBranch(endX, endY, newLength, angle + spread, depth - 1, spread);
    }

    /**
     * Draw leaves
     * @param {Array} leaves - Array of leaf objects
     * @param {number} growthStage
     * @param {number} maxStage
     * @param {number} time - Current time for animation
     */
    drawLeaves(leaves, growthStage, maxStage, time = 0) {
        this.branchEnds = [];
        // Use same scaling as drawTree
        const startX = this.centerX;
        const trunkHeight = this.height * this.treeScale * (0.25 + 0.04 * 6);
        const startY = this.centerY - trunkHeight;
        const baseLength = this.height * this.treeScale * 0.18;
        const length = baseLength + 6 * 8;
        const minSpread = Math.PI / 7;
        const maxSpread = Math.PI / 3.2;
        const spread = minSpread + (maxSpread - minSpread) * ((growthStage - 1) / (maxStage - 1));
        const angle = -Math.PI / 2;
        this.drawBranch(startX, startY, length, angle, 6, spread);
        if (this.branchEnds.length > 0) {
            leaves.forEach((leaf, index) => {
                if (index < this.branchEnds.length) {
                    const end = this.branchEnds[index];
                    // Sway animation - default values if not using Config.ANIMATION
                    const leafSwaySpeed = Config.ANIMATION ? Config.ANIMATION.leafSwaySpeed : 1.2;
                    const leafSwayAmplitude = Config.ANIMATION ? Config.ANIMATION.leafSwayAmplitude : 0.15;
                    const sway = Math.sin(time * leafSwaySpeed + index) * leafSwayAmplitude;
                    const size = 8 + leaf.level * 1.7 * this.treeScale;
                    this.ctx.save();
                    this.ctx.translate(end.x, end.y);
                    this.ctx.rotate(end.angle + Math.PI / 4 + sway);
                    this.ctx.fillStyle = Config.COLORS.leaf;
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = Config.COLORS.leafStroke;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(size, 0);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            });
        }
    }

    /**
     * Draw roots
     * @param {Array} roots - Array of root objects
     * @param {number} depth - Recursion depth
     */
    drawRoots(roots, depth) {
        const rootStartX = this.centerX;
        const rootStartY = this.centerY;
        const baseAngle = Math.PI / 2; // Downward

        // Draw main roots
        roots.forEach((root, index) => {
            const angle = baseAngle + (index - (roots.length - 1) / 2) * (Math.PI / 6);
            const length = 40 + root.level * 5;

            this.drawRoot(rootStartX, rootStartY, length, angle, Math.min(depth, 3), root.level);
        });
    }

    /**
     * Recursively draw a root
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {number} length - Root length
     * @param {number} angle - Root angle
     * @param {number} depth - Recursion depth remaining
     * @param {number} level - Root level (for color)
     */
    drawRoot(x, y, length, angle, depth, level) {
        if (depth <= 0) return;

        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        const width = 2 + depth;

        // Draw this root
        this.ctx.strokeStyle = `rgba(101, 67, 33, ${0.6 + level * 0.05})`; // Brown with opacity based on level
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Recursively draw child roots
        if (depth > 1) {
            const newLength = length * 0.6;
            const rootAngle = Math.PI / 5;

            this.drawRoot(endX, endY, newLength, angle - rootAngle, depth - 1, level);
            this.drawRoot(endX, endY, newLength, angle + rootAngle, depth - 1, level);
        }
    }

    /**
     * Draw fruits
     * @param {Array} fruits - Array of fruit objects
     */
    drawFruits(fruits) {
        // Store fruit positions for click detection
        this.fruitPositions = [];

        fruits.forEach(fruit => {
            // Calculate position based on angle and distance from center
            const x = this.centerX + Math.cos(fruit.position.angle) * (fruit.position.distance * 100);
            const y = (this.centerY - 100) + Math.sin(fruit.position.angle) * (fruit.position.distance * 100);

            // Store position for click detection
            this.fruitPositions.push({
                id: fruit.id,
                x,
                y,
                radius: 10 * fruit.growth
            });

            // Draw fruit
            this.ctx.fillStyle = fruit.growth >= 1 ? Config.COLORS.fruitRipe : Config.COLORS.fruitUnripe;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10 * fruit.growth, 0, Math.PI * 2);
            this.ctx.fill();

            // Add highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x - 3, y - 3, 3 * fruit.growth, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * Register a callback for fruit clicks
     * @param {Function} callback - Function to call when a fruit is clicked
     */
    onFruitClick(callback) {
        this.fruitClickCallbacks.push(callback);

        // Add click event listener if not already added
        if (this.fruitClickCallbacks.length === 1) {
            this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        }
    }

    /**
     * Handle canvas click events
     * @param {Event} event - Click event
     */
    handleCanvasClick(event) {
        if (!this.fruitPositions) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if click is on a fruit
        for (const fruit of this.fruitPositions) {
            const distance = Math.sqrt(Math.pow(x - fruit.x, 2) + Math.pow(y - fruit.y, 2));

            if (distance <= fruit.radius) {
                // Notify all callbacks
                this.fruitClickCallbacks.forEach(callback => {
                    callback(fruit.id);
                });
                break;
            }
        }
    }

    /**
     * Set graphics quality level
     * @param {string} quality - Quality level ('high', 'medium', or 'low')
     */
    setGraphicsQuality(quality) {
        if (!['high', 'medium', 'low'].includes(quality)) {
            console.warn(`Invalid graphics quality: ${quality}. Using 'high' instead.`);
            quality = 'high';
        }

        this.graphicsQuality = quality;

        // Apply quality settings
        switch (quality) {
            case 'low':
                // Reduce visual effects
                this.ctx.imageSmoothingEnabled = false;
                break;
            case 'medium':
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'low';
                break;
            case 'high':
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                break;
        }
    }
}
