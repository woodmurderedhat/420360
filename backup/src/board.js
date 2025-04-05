class Board {
    constructor() {
        this.rows = 20;
        this.columns = 10;
        this.grid = this.createGrid();
    }

    createGrid() {
        return Array.from({ length: this.rows }, () => Array(this.columns).fill(0));
    }

    draw(ctx) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                ctx.fillStyle = this.grid[row][col] === 0 ? 'white' : 'blue';
                ctx.fillRect(col * 30, row * 30, 30, 30);
                ctx.strokeRect(col * 30, row * 30, 30, 30);
            }
        }
    }

    checkFullLines() {
        let linesToClear = [];
        for (let row = 0; row < this.rows; row++) {
            if (this.grid[row].every(cell => cell !== 0)) {
                linesToClear.push(row);
            }
        }
        return linesToClear;
    }

    clearLines(lines) {
        for (let line of lines) {
            this.grid.splice(line, 1);
            this.grid.unshift(Array(this.columns).fill(0));
        }
    }

    addPiece(piece) {
        piece.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value !== 0) {
                    this.grid[r + piece.position.y][c + piece.position.x] = value;
                }
            });
        });
    }

    reset() {
        this.grid = this.createGrid();
    }
}