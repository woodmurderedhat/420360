class Piece {
    constructor(shape) {
        this.shape = shape;
        this.position = { x: 0, y: 0 };
    }

    rotate() {
        this.shape = this.shape[0].map((val, index) =>
            this.shape.map(row => row[index]).reverse()
        );
    }

    move(direction) {
        this.position.x += direction.x;
        this.position.y += direction.y;
    }

    getCoordinates() {
        const coordinates = [];
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    coordinates.push({ x: this.position.x + x, y: this.position.y + y });
                }
            });
        });
        return coordinates;
    }

    canMoveDown(board) {
        this.position.y += 1;
        const canMove = !board.collides(this);
        this.position.y -= 1; // Reset position
        return canMove;
    }

    canMoveLeft(board) {
        this.position.x -= 1;
        const canMove = !board.collides(this);
        this.position.x += 1; // Reset position
        return canMove;
    }

    canMoveRight(board) {
        this.position.x += 1;
        const canMove = !board.collides(this);
        this.position.x -= 1; // Reset position
        return canMove;
    }

    moveDown() {
        this.position.y += 1;
    }

    draw(ctx) {
        this.getCoordinates().forEach(coord => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(coord.x * 30, coord.y * 30, 30, 30);
            ctx.strokeRect(coord.x * 30, coord.y * 30, 30, 30);
        });
    }

    undoRotate() {
        this.shape = this.shape[0].map((val, index) =>
            this.shape.map(row => row[index]).reverse()
        );
    }
}