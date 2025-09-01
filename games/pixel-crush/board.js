/**
 * Board.js - Grid logic and matching system for Pixel Crush
 * Handles the 8x8 game board, pixel matching, falling physics, and power-ups
 */

(function(window) {
    'use strict';

    const GRID_SIZE = 8;
    const PIXEL_TYPES = 6; // Number of different pixel colors/types
    const MIN_MATCH = 3;

    // Color themes for pixels
    const THEMES = {
        classic: [
            '#ff4444', // Red
            '#44ff44', // Green  
            '#4444ff', // Blue
            '#ffff44', // Yellow
            '#ff44ff', // Magenta
            '#44ffff'  // Cyan
        ],
        neon: [
            '#ff0080', // Hot Pink
            '#00ff80', // Bright Green
            '#8000ff', // Purple
            '#ff8000', // Orange
            '#0080ff', // Blue
            '#80ff00'  // Lime
        ],
        retro: [
            '#ff6b35', // Orange
            '#f9ca24', // Yellow
            '#6c5ce7', // Purple
            '#a29bfe', // Light Purple
            '#fd79a8', // Pink
            '#00b894'  // Teal
        ],
        pastel: [
            '#fab1a0', // Peach
            '#fd79a8', // Pink
            '#fdcb6e', // Yellow
            '#6c5ce7', // Purple
            '#74b9ff', // Blue
            '#55a3ff'  // Light Blue
        ]
    };

    class Board {
        constructor() {
            this.grid = [];
            this.selectedPixel = null;
            this.theme = 'classic';
            this.isAnimating = false;
            this.powerUps = new Map(); // Track power-up pixels
            this.lastMatchPositions = [];
            
            this.initializeGrid();
        }

        initializeGrid() {
            this.grid = [];
            for (let row = 0; row < GRID_SIZE; row++) {
                this.grid[row] = [];
                for (let col = 0; col < GRID_SIZE; col++) {
                    this.grid[row][col] = this.getRandomPixelType();
                }
            }
            
            // Remove any initial matches
            this.removeInitialMatches();
        }

        getRandomPixelType() {
            return Math.floor(Math.random() * PIXEL_TYPES);
        }

        removeInitialMatches() {
            let hasMatches = true;
            let attempts = 0;
            const maxAttempts = 100;

            while (hasMatches && attempts < maxAttempts) {
                hasMatches = false;
                
                for (let row = 0; row < GRID_SIZE; row++) {
                    for (let col = 0; col < GRID_SIZE; col++) {
                        if (this.hasMatchAt(row, col)) {
                            this.grid[row][col] = this.getRandomPixelType();
                            hasMatches = true;
                        }
                    }
                }
                attempts++;
            }
        }

        hasMatchAt(row, col) {
            const pixelType = this.grid[row][col];
            
            // Check horizontal match
            let horizontalCount = 1;
            // Check left
            for (let c = col - 1; c >= 0 && this.grid[row][c] === pixelType; c--) {
                horizontalCount++;
            }
            // Check right
            for (let c = col + 1; c < GRID_SIZE && this.grid[row][c] === pixelType; c++) {
                horizontalCount++;
            }
            
            // Check vertical match
            let verticalCount = 1;
            // Check up
            for (let r = row - 1; r >= 0 && this.grid[r][col] === pixelType; r--) {
                verticalCount++;
            }
            // Check down
            for (let r = row + 1; r < GRID_SIZE && this.grid[r][col] === pixelType; r++) {
                verticalCount++;
            }
            
            return horizontalCount >= MIN_MATCH || verticalCount >= MIN_MATCH;
        }

        isValidPosition(row, col) {
            return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
        }

        isAdjacent(pos1, pos2) {
            const rowDiff = Math.abs(pos1.row - pos2.row);
            const colDiff = Math.abs(pos1.col - pos2.col);
            return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        }

        swapPixels(pos1, pos2) {
            if (!this.isValidPosition(pos1.row, pos1.col) || 
                !this.isValidPosition(pos2.row, pos2.col)) {
                return false;
            }

            const temp = this.grid[pos1.row][pos1.col];
            this.grid[pos1.row][pos1.col] = this.grid[pos2.row][pos2.col];
            this.grid[pos2.row][pos2.col] = temp;
            
            return true;
        }

        findMatches() {
            const matches = new Set();
            
            // Find horizontal matches
            for (let row = 0; row < GRID_SIZE; row++) {
                let count = 1;
                let currentType = this.grid[row][0];
                
                for (let col = 1; col < GRID_SIZE; col++) {
                    if (this.grid[row][col] === currentType) {
                        count++;
                    } else {
                        if (count >= MIN_MATCH) {
                            for (let i = col - count; i < col; i++) {
                                matches.add(`${row},${i}`);
                            }
                        }
                        count = 1;
                        currentType = this.grid[row][col];
                    }
                }
                
                // Check the last sequence
                if (count >= MIN_MATCH) {
                    for (let i = GRID_SIZE - count; i < GRID_SIZE; i++) {
                        matches.add(`${row},${i}`);
                    }
                }
            }
            
            // Find vertical matches
            for (let col = 0; col < GRID_SIZE; col++) {
                let count = 1;
                let currentType = this.grid[0][col];
                
                for (let row = 1; row < GRID_SIZE; row++) {
                    if (this.grid[row][col] === currentType) {
                        count++;
                    } else {
                        if (count >= MIN_MATCH) {
                            for (let i = row - count; i < row; i++) {
                                matches.add(`${i},${col}`);
                            }
                        }
                        count = 1;
                        currentType = this.grid[row][col];
                    }
                }
                
                // Check the last sequence
                if (count >= MIN_MATCH) {
                    for (let i = GRID_SIZE - count; i < GRID_SIZE; i++) {
                        matches.add(`${i},${col}`);
                    }
                }
            }
            
            return Array.from(matches).map(pos => {
                const [row, col] = pos.split(',').map(Number);
                return { row, col };
            });
        }

        findMatchGroups() {
            const matches = this.findMatches();
            const groups = [];
            const processed = new Set();
            
            for (const match of matches) {
                const key = `${match.row},${match.col}`;
                if (processed.has(key)) continue;
                
                const group = this.getMatchGroup(match.row, match.col, matches);
                if (group.length >= MIN_MATCH) {
                    groups.push(group);
                    group.forEach(pos => processed.add(`${pos.row},${pos.col}`));
                }
            }
            
            return groups;
        }

        getMatchGroup(startRow, startCol, allMatches) {
            const pixelType = this.grid[startRow][startCol];
            const group = [];
            const visited = new Set();
            const queue = [{ row: startRow, col: startCol }];
            
            while (queue.length > 0) {
                const current = queue.shift();
                const key = `${current.row},${current.col}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (this.grid[current.row][current.col] === pixelType) {
                    group.push(current);
                    
                    // Check adjacent cells
                    const directions = [
                        { row: -1, col: 0 }, // Up
                        { row: 1, col: 0 },  // Down
                        { row: 0, col: -1 }, // Left
                        { row: 0, col: 1 }   // Right
                    ];
                    
                    for (const dir of directions) {
                        const newRow = current.row + dir.row;
                        const newCol = current.col + dir.col;
                        const newKey = `${newRow},${newCol}`;
                        
                        if (this.isValidPosition(newRow, newCol) && 
                            !visited.has(newKey) &&
                            allMatches.some(m => m.row === newRow && m.col === newCol)) {
                            queue.push({ row: newRow, col: newCol });
                        }
                    }
                }
            }
            
            return group;
        }

        removeMatches(matches) {
            this.lastMatchPositions = [...matches];
            
            for (const match of matches) {
                this.grid[match.row][match.col] = null;
            }
            
            return this.generatePowerUps(matches);
        }

        generatePowerUps(matches) {
            const powerUps = [];
            const groups = this.groupMatchesByLine(matches);
            
            for (const group of groups) {
                if (group.length === 4) {
                    // Create line power-up
                    const centerPos = group[Math.floor(group.length / 2)];
                    powerUps.push({
                        type: 'line',
                        position: centerPos,
                        direction: this.getLineDirection(group)
                    });
                } else if (group.length >= 5) {
                    // Create rainbow power-up
                    const centerPos = group[Math.floor(group.length / 2)];
                    powerUps.push({
                        type: 'rainbow',
                        position: centerPos
                    });
                }
            }
            
            return powerUps;
        }

        groupMatchesByLine(matches) {
            const groups = [];
            const processed = new Set();
            
            for (const match of matches) {
                const key = `${match.row},${match.col}`;
                if (processed.has(key)) continue;
                
                // Find horizontal line
                const horizontalGroup = matches.filter(m => 
                    m.row === match.row && !processed.has(`${m.row},${m.col}`)
                ).sort((a, b) => a.col - b.col);
                
                // Find vertical line
                const verticalGroup = matches.filter(m => 
                    m.col === match.col && !processed.has(`${m.row},${m.col}`)
                ).sort((a, b) => a.row - b.row);
                
                // Use the longer line
                const group = horizontalGroup.length > verticalGroup.length ? 
                    horizontalGroup : verticalGroup;
                
                if (group.length >= MIN_MATCH) {
                    groups.push(group);
                    group.forEach(pos => processed.add(`${pos.row},${pos.col}`));
                }
            }
            
            return groups;
        }

        getLineDirection(group) {
            if (group.length < 2) return 'horizontal';
            return group[0].row === group[1].row ? 'horizontal' : 'vertical';
        }

        applyGravity() {
            let moved = false;
            
            for (let col = 0; col < GRID_SIZE; col++) {
                // Collect non-null pixels
                const pixels = [];
                for (let row = GRID_SIZE - 1; row >= 0; row--) {
                    if (this.grid[row][col] !== null) {
                        pixels.push(this.grid[row][col]);
                    }
                }
                
                // Clear the column
                for (let row = 0; row < GRID_SIZE; row++) {
                    this.grid[row][col] = null;
                }
                
                // Place pixels from bottom up
                for (let i = 0; i < pixels.length; i++) {
                    this.grid[GRID_SIZE - 1 - i][col] = pixels[i];
                }
                
                // Fill empty spaces at top with new pixels
                for (let row = 0; row < GRID_SIZE - pixels.length; row++) {
                    this.grid[row][col] = this.getRandomPixelType();
                    moved = true;
                }
                
                if (pixels.length < GRID_SIZE) {
                    moved = true;
                }
            }
            
            return moved;
        }

        activatePowerUp(row, col, type, direction = null) {
            const affectedPositions = [];
            
            if (type === 'line') {
                if (direction === 'horizontal') {
                    // Clear entire row
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (this.grid[row][c] !== null) {
                            affectedPositions.push({ row, col: c });
                            this.grid[row][c] = null;
                        }
                    }
                } else {
                    // Clear entire column
                    for (let r = 0; r < GRID_SIZE; r++) {
                        if (this.grid[r][col] !== null) {
                            affectedPositions.push({ row: r, col });
                            this.grid[r][col] = null;
                        }
                    }
                }
            } else if (type === 'rainbow') {
                // Clear all pixels of the same type
                const targetType = this.grid[row][col];
                if (targetType !== null) {
                    for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (this.grid[r][c] === targetType) {
                                affectedPositions.push({ row: r, col: c });
                                this.grid[r][c] = null;
                            }
                        }
                    }
                }
            }
            
            return affectedPositions;
        }

        canMakeMove() {
            // Check if any valid moves are possible
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    // Try swapping with adjacent pixels
                    const directions = [
                        { row: 0, col: 1 },  // Right
                        { row: 1, col: 0 }   // Down
                    ];
                    
                    for (const dir of directions) {
                        const newRow = row + dir.row;
                        const newCol = col + dir.col;
                        
                        if (this.isValidPosition(newRow, newCol)) {
                            // Try the swap
                            this.swapPixels(
                                { row, col }, 
                                { row: newRow, col: newCol }
                            );
                            
                            // Check if this creates matches
                            const hasMatches = this.hasMatchAt(row, col) || 
                                             this.hasMatchAt(newRow, newCol);
                            
                            // Swap back
                            this.swapPixels(
                                { row, col }, 
                                { row: newRow, col: newCol }
                            );
                            
                            if (hasMatches) {
                                return true;
                            }
                        }
                    }
                }
            }
            
            return false;
        }

        shuffleBoard() {
            // Create a list of all current pixel types
            const pixels = [];
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    pixels.push(this.grid[row][col]);
                }
            }
            
            // Shuffle the pixels
            for (let i = pixels.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
            }
            
            // Redistribute shuffled pixels
            let index = 0;
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    this.grid[row][col] = pixels[index++];
                }
            }
            
            // Remove any accidental matches
            this.removeInitialMatches();
        }

        setTheme(themeName) {
            if (THEMES[themeName]) {
                this.theme = themeName;
            }
        }

        getPixelColor(pixelType) {
            if (pixelType === null || pixelType < 0 || pixelType >= PIXEL_TYPES) {
                return '#000000';
            }
            return THEMES[this.theme][pixelType];
        }

        getGrid() {
            return this.grid;
        }

        getThemes() {
            return Object.keys(THEMES);
        }

        getCurrentTheme() {
            return this.theme;
        }
    }

    // Export to global namespace
    window.PixelCrushBoard = Board;

})(window);