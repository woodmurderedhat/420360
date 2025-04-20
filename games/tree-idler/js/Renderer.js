/**
 * Renderer.js - Handles canvas rendering of the tree and its components
 */
export default class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height * 0.8; // Tree base is near bottom
        this.fruitClickCallbacks = [];
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
        this.clear();
        
        const { tree, leaves, roots, fruits } = gameState;
        const treeProperties = tree.getCurrentStageProperties();
        
        // Draw ground
        this.drawGround();
        
        // Draw roots
        this.drawRoots(roots.slots, treeProperties.branchDepth);
        
        // Draw trunk and branches
        this.drawTree(treeProperties.branchDepth);
        
        // Draw leaves
        this.drawLeaves(leaves.slots);
        
        // Draw fruits
        if (fruits.enabled) {
            this.drawFruits(fruits.fruits);
        }
    }

    /**
     * Draw the ground
     */
    drawGround() {
        this.ctx.fillStyle = '#8B4513'; // Brown
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
     */
    drawTree(depth) {
        // Draw trunk
        const trunkHeight = 100 + depth * 15;
        const trunkWidth = 10 + depth * 2;
        
        this.ctx.fillStyle = '#5D4037'; // Brown
        this.ctx.beginPath();
        this.ctx.rect(this.centerX - trunkWidth / 2, this.centerY - trunkHeight, trunkWidth, trunkHeight);
        this.ctx.fill();
        
        // Draw branches recursively
        const startX = this.centerX;
        const startY = this.centerY - trunkHeight;
        const length = 60 + depth * 5;
        const angle = -Math.PI / 2; // Straight up
        
        this.drawBranch(startX, startY, length, angle, depth);
    }

    /**
     * Recursively draw a branch
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {number} length - Branch length
     * @param {number} angle - Branch angle
     * @param {number} depth - Recursion depth remaining
     */
    drawBranch(x, y, length, angle, depth) {
        if (depth <= 0) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        const width = 3 + depth;
        
        // Draw this branch
        this.ctx.strokeStyle = '#5D4037'; // Brown
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Store branch end points for leaf placement
        if (!this.branchEnds) {
            this.branchEnds = [];
        }
        
        if (depth === 1) {
            this.branchEnds.push({ x: endX, y: endY, angle });
        }
        
        // Recursively draw child branches
        const newLength = length * 0.7;
        const branchAngle = Math.PI / 4 + Math.random() * 0.2;
        
        this.drawBranch(endX, endY, newLength, angle - branchAngle, depth - 1);
        this.drawBranch(endX, endY, newLength, angle + branchAngle, depth - 1);
    }

    /**
     * Draw leaves
     * @param {Array} leaves - Array of leaf objects
     */
    drawLeaves(leaves) {
        // Reset branch ends for new render
        this.branchEnds = [];
        
        // Get branch ends from the tree
        const startX = this.centerX;
        const startY = this.centerY - (100 + 15 * 6); // Same as in drawTree
        const length = 60 + 5 * 6;
        const angle = -Math.PI / 2;
        
        this.drawBranch(startX, startY, length, angle, 6);
        
        // Draw leaves at branch ends
        if (this.branchEnds.length > 0) {
            leaves.forEach((leaf, index) => {
                if (index < this.branchEnds.length) {
                    const end = this.branchEnds[index];
                    const size = 10 + leaf.level * 2;
                    
                    this.ctx.fillStyle = `rgba(0, 128, 0, ${0.7 + leaf.efficiency * 0.1})`; // Green with opacity based on efficiency
                    this.ctx.beginPath();
                    this.ctx.ellipse(end.x, end.y, size, size * 0.6, end.angle + Math.PI / 4, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Add a vein
                    this.ctx.strokeStyle = '#006400'; // Dark green
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(end.x, end.y);
                    this.ctx.lineTo(end.x + Math.cos(end.angle) * size, end.y + Math.sin(end.angle) * size);
                    this.ctx.stroke();
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
            this.ctx.fillStyle = fruit.growth >= 1 ? '#FF5722' : '#FFA726'; // Orange/amber based on growth
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
}
