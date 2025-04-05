// filepath: c:\Users\Stephanus\Documents\Tarot_tetris\tetris-game\src\game.js
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const board = new Board();
let piece;
let score = 0;
let gameOver = false;

function startGame() {
    score = 0;
    gameOver = false;
    board.reset();
    spawnPiece();
    update();
}

function spawnPiece() {
    piece = new Piece(getRandomShape());
    if (board.collides(piece)) {
        gameOver = true;
        alert('Game Over! Your score: ' + score);
    }
}

function update() {
    if (gameOver) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    piece.draw(context);

    if (piece.canMoveDown(board)) {
        piece.moveDown();
    } else {
        board.mergePiece(piece);
        board.clearLines();
        score += 10;
        spawnPiece();
    }

    requestAnimationFrame(update);
}

document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
            if (piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'ArrowRight':
            if (piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'ArrowDown':
            if (piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 'ArrowUp':
            piece.rotate();
            if (board.collides(piece)) {
                piece.undoRotate();
            }
            break;
    }
});

function getRandomShape() {
    const shapes = [
        [[1, 1, 1, 1]], // I
        [[1, 1], [1, 1]], // O
        [[0, 1, 0], [1, 1, 1]], // T
        [[1, 1, 0], [0, 1, 1]], // S
        [[0, 1, 1], [1, 1, 0]], // Z
        [[1, 0, 0], [1, 1, 1]], // L
        [[0, 0, 1], [1, 1, 1]]  // J
    ];
    return shapes[Math.floor(Math.random() * shapes.length)];
}

startGame();