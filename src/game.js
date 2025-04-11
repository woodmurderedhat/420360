// This file manages the overall game state. It handles the spawning of new pieces, collision detection, and scoring. It also manages the game over state and restarts the game.

const canvas = document.getElementById('tetris');
const context = canvas ? canvas.getContext('2d') : null;

if (!canvas) {
    console.error("Canvas element not found!");
    alert("Error: Canvas element is missing. Please check the HTML structure.");
}

if (!context) {
    console.error("Failed to get 2D rendering context!");
    alert("Error: Unable to initialize the game. Please try reloading the page.");
}

const board = new Board();
let piece;
let score = 0;
let gameOver = false;
let lastTime = 0;
let dropInterval = 500; // Default speed (milliseconds)
let level = 1;
let linesClearedThisLevel = 0;
const linesToLevelUp = 10;
let combo = 0;

const playerNameInput = document.getElementById('player-name');
const scoreElement = document.getElementById('score');
const gameInfoElement = document.getElementById('game-info');
const startGameButton = document.getElementById('start-game-button');
const levelElement = document.getElementById('level');

// Add a "hold" feature to save a piece for later use
let heldPiece = null;
let canHold = true;

function holdPiece() {
    if (!canHold) return;
    if (heldPiece) {
        const temp = heldPiece;
        heldPiece = piece;
        piece = temp;
        piece.position = { x: 3, y: 0 }; // Reset position
    } else {
        heldPiece = piece;
        spawnPiece();
    }
    canHold = false; // Prevent holding multiple times in a row
    updateHoldUI();
}

function updateHoldUI() {
    const holdContainer = document.getElementById('hold-container');
    if (!holdContainer) {
        console.warn("Hold container not found.");
        return;
    }
    holdContainer.innerHTML = '';
    if (heldPiece) {
        heldPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const block = document.createElement('div');
                    block.style.gridRowStart = y + 1;
                    block.style.gridColumnStart = x + 1;
                    block.className = 'block';
                    block.style.backgroundColor = '#ff5722'; // Example color
                    holdContainer.appendChild(block);
                }
            });
        });
    }
}

// Add a "ghost piece" to show where the current piece will land
function drawGhostPiece(context) {
    if (!piece || !piece.type) return;
    const ghostPiece = new Piece(piece.type);
    ghostPiece.shape = piece.shape;
    ghostPiece.position = { ...piece.position };

    while (ghostPiece.canMoveDown(board)) {
        ghostPiece.moveDown();
    }

    ghostPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Semi-transparent color
                context.fillRect((ghostPiece.position.x + x) * 30, (ghostPiece.position.y + y) * 30, 30, 30);
            }
        });
    });
}

// Function to set the game speed
function setGameSpeed(speed) {
    dropInterval = speed;
}

// Update the score display
function updateScore() {
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    } else {
        console.warn("Score element not found.");
    }
}

// Update game info
function updateGameInfo(info) {
    if (gameInfoElement) {
        gameInfoElement.textContent = `Game Info: ${info}`;
        gameInfoElement.setAttribute('aria-live', 'polite'); // Announce updates for screen readers
    } else {
        console.warn("Game info element not found.");
    }
}

// Function to update the level display
function updateLevel() {
    if (levelElement) {
        levelElement.textContent = `Level: ${level}`;
    } else {
        console.warn("Level element not found.");
    }
}

// Initialize the level display
updateLevel();

// Improved game initialization
function initializeGame() {
    score = 0;
    level = 1;
    linesClearedThisLevel = 0;
    dropInterval = 500;
    gameOver = false;
    combo = 0;
    board.reset();
    initializeTarotDeck();
    playerHand = [];
    spawnPiece();
    updateScore();
    updateLevel();
    updateGameInfo('Game Initialized');
    updateTarotUI();
    lastTime = performance.now();
}

// Enhanced game start logic
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name to start the game.');
            return;
        }
        document.body.classList.add('game-started');
        leaderboard.displayScores();
        initializeGame();
        requestAnimationFrame(update);
    });
} else {
    console.warn("Start game button not found.");
}

// Improved game over handling
function handleGameOver() {
    gameOver = true;
    updateGameInfo('Game Over');
    const playerName = playerNameInput.value.trim() || 'Player';
    leaderboard.addScore(playerName, score);
    leaderboard.displayScores();
    alert(`Game Over! ${playerName}, your score: ${score}`);
}

// Optimized piece spawning
function spawnPiece() {
    piece = new Piece();
    piece.position = { x: 3, y: 0 };
    addTarotCardToHand();

    if (board.collides(piece) || board.isBoardFull()) {
        handleGameOver();
    }
    canHold = true;
}

let coyoteTime = 300; // 300ms coyote time
let coyoteTimerActive = false;

// Enhanced update loop
function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    if (deltaTime > dropInterval) {
        if (piece.canMoveDown(board)) {
            piece.moveDown();
        } else {
            board.mergePiece(piece);
            const linesCleared = clearLines();
            if (linesCleared > 0) {
                score += calculateScore(linesCleared);
                updateScore();
            }
            spawnPiece();
        }
        lastTime = time;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    drawGhostPiece(context);
    if (piece) {
        piece.draw(context);
    }

    requestAnimationFrame(update);
}

// Restore clearLines and increaseLevel (needed for game logic)
function clearLines() {
    const linesToClear = board.checkFullLines();
    if (!Array.isArray(linesToClear)) {
        console.error("checkFullLines did not return an array:", linesToClear);
        return 0;
    }

    const numLinesCleared = linesToClear.length;
    if (numLinesCleared > 0) {
        combo++; // Increase combo counter
        score += combo * 50; // Add combo bonus to score
        updateScore();
    } else {
        combo = 0; // Reset combo if no lines are cleared
    }
    
    for (let line of linesToClear) {
        if (line >= 0 && line < board.grid.length) {
            board.grid.splice(line, 1);
            board.grid.unshift(Array(board.columns).fill(0));
        } else {
            console.warn(`Line index out of bounds: ${line}`);
        }
    }

    linesClearedThisLevel += numLinesCleared;
    if (linesClearedThisLevel >= linesToLevelUp) {
        increaseLevel();
    }

    updateTarotUI(); // Ensure tarot UI is updated after clearing lines
    return numLinesCleared;
}

function increaseLevel() {
    level++;
    updateLevel();
    linesClearedThisLevel = 0;
    // Increase game speed (reduce drop interval)
    dropInterval = Math.max(100, dropInterval - 50);
    updateGameInfo(`Level Up! New level: ${level}`);
}

function calculateScore(linesCleared) {
    if (!piece) {
        console.warn("Piece is undefined when calculating score.");
        return 0;
    }
    const pieceScore = piece.getScoreValue(); // Get the unique score value of the current piece
    return linesCleared * pieceScore;
}


// Mobile controls
const moveLeftButton = document.getElementById('move-left');
const rotateButton = document.getElementById('rotate');
const moveRightButton = document.getElementById('move-right');
const moveDownButton = document.getElementById('move-down');

if (moveLeftButton) {
    moveLeftButton.addEventListener('click', () => {
        if (!gameOver && piece.canMoveLeft(board)) {
            piece.moveLeft();
            updateScore();
        }
    });
}

if (rotateButton) {
    rotateButton.addEventListener('click', () => {
        if (!gameOver) {
            piece.rotate(board);
            if (board.collides(piece)) {
                piece.undoRotate();
            }
            updateScore();
        }
    });
}

if (moveRightButton) {
    moveRightButton.addEventListener('click', () => {
        if (!gameOver && piece.canMoveRight(board)) {
            piece.moveRight();
            updateScore();
        }
    });
}

if (moveDownButton) {
    moveDownButton.addEventListener('click', () => {
        if (!gameOver && piece.canMoveDown(board)) {
            piece.moveDown();
            updateScore();
        }
    });
}

// Add event listener for fullscreen toggle
const fullscreenButton = document.getElementById('fullscreen-button');
if (fullscreenButton) {
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
            });
        }
    });
} else {
    console.warn("Fullscreen button not found.");
}

// Add event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft': // Move left
        case 'a':
        case 'A':
            if (piece.canMoveLeft(board)) {
                piece.moveLeft();
            }
            break;
        case 'ArrowRight': // Move right
        case 'd':
        case 'D':
            if (piece.canMoveRight(board)) {
                piece.moveRight();
            }
            break;
        case 'ArrowDown': // Move down
        case 's':
        case 'S':
            if (piece.canMoveDown(board)) {
                piece.moveDown();
            }
            break;
        case 'ArrowUp': // Rotate
        case 'w':
        case 'W':
            piece.rotate(board);
            if (board.collides(piece)) {
                piece.undoRotate();
            }
            break;
        case 'Shift': // Hold piece
            holdPiece();
            break;
        case '1': // Play tarot card 1
        case '2': // Play tarot card 2
        case '3': // Play tarot card 3
        case '4': // Play tarot card 4
        case '5': // Play tarot card 5
        case '6': // Play tarot card 6
            const cardIndex = parseInt(event.key, 10) - 1;
            playTarotCard(cardIndex);
            break;
        default:
            break;
    }

    // Redraw the game board and piece after any movement
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(context);
    drawGhostPiece(context);
    if (piece) {
        piece.draw(context);
    }
});

// Prevent arrow keys from scrolling the page
window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
});

// Dynamically adjust canvas size based on screen size
function resizeCanvas() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (canvasWrapper) {
        const width = Math.min(window.innerWidth * 0.8, 300);
        const height = width * 2; // Maintain 1:2 aspect ratio
        canvas.width = width;
        canvas.height = height;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize
