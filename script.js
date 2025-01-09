const gameContainer = document.getElementById('game-container');
const timerDisplay = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameArea = document.getElementById('game-area');

const gridSize = 10; // 10x10 maze
let timer = 60;
let playerPosition = { x: 0, y: 0 };
let treasuresLeft = 0;
let timerInterval;

// Generate the maze grid
function generateMaze() {
    const maze = [];
    gameContainer.innerHTML = '';
    treasuresLeft = 0;

    for (let y = 0; y < gridSize; y++) {
        const row = [];
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            // Randomly place walls and treasures
            if (Math.random() < 0.2 && (x !== 0 || y !== 0)) {
                cell.classList.add('wall');
                row.push('wall');
            } else if (Math.random() < 0.1) {
                cell.classList.add('treasure');
                row.push('treasure');
                treasuresLeft++;
            } else {
                row.push('empty');
            }

            cell.dataset.x = x;
            cell.dataset.y = y;
            gameContainer.appendChild(cell);
        }
        maze.push(row);
    }

    ensureReachability(maze);
    updatePlayerPosition();
}

// Ensure treasures are reachable using BFS
function ensureReachability(maze) {
    const directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 },  // Right
    ];

    function isWithinBounds(x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }

    function bfs(startX, startY) {
        const queue = [{ x: startX, y: startY }];
        const visited = Array.from({ length: gridSize }, () =>
            Array(gridSize).fill(false)
        );

        visited[startY][startX] = true;

        while (queue.length > 0) {
            const { x, y } = queue.shift();

            for (const { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (isWithinBounds(nx, ny) && !visited[ny][nx] && maze[ny][nx] !== 'wall') {
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny });
                }
            }
        }

        return visited;
    }

    const treasures = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (maze[y][x] === 'treasure') {
                treasures.push({ x, y });
            }
        }
    }

    const reachable = bfs(0, 0);

    for (const { x, y } of treasures) {
        if (!reachable[y][x]) {
            const queue = [{ x, y }];
            while (queue.length > 0) {
                const { x, y } = queue.shift();

                for (const { dx, dy } of directions) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (isWithinBounds(nx, ny) && maze[ny][nx] === 'wall') {
                        maze[ny][nx] = 'empty';

                        const wallCell = document.querySelector(
                            `.cell[data-x='${nx}'][data-y='${ny}']`
                        );
                        wallCell.classList.remove('wall');

                        queue.push({ x: nx, y: ny });
                        break;
                    }
                }
            }
        }
    }
}

// Update player position visually
function updatePlayerPosition() {
    document.querySelectorAll('.player').forEach(player => {
        player.classList.remove('player');
    });

    const playerCell = document.querySelector(
        `.cell[data-x='${playerPosition.x}'][data-y='${playerPosition.y}']`
    );

    if (playerCell) {
        playerCell.classList.add('player');
    }
}

// Handle player movement
function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (
        newX >= 0 &&
        newX < gridSize &&
        newY >= 0 &&
        newY < gridSize
    ) {
        const targetCell = document.querySelector(
            `.cell[data-x='${newX}'][data-y='${newY}']`
        );

        if (!targetCell.classList.contains('wall')) {
            if (targetCell.classList.contains('treasure')) {
                targetCell.classList.remove('treasure');
                treasuresLeft--;
                checkWinCondition();
            }

            playerPosition.x = newX;
            playerPosition.y = newY;
            updatePlayerPosition();
        }
    }
}

// Check if the game is won
function checkWinCondition() {
    if (treasuresLeft === 0) {
        clearInterval(timerInterval);
        alert(`You win! Time remaining: ${timer} seconds`);
        initGame();
    }
}

// Handle keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
});

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = `Time: ${timer}`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            alert('Time up! Game over.');
            initGame();
        }
    }, 1000);
}

// Initialize the game
function initGame() {
    playerPosition = { x: 0, y: 0 };
    timer = 60;
    timerDisplay.textContent = `Time: ${timer}`;
    generateMaze();
    startTimer();
}

// Handle start button click
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameArea.style.display = 'block';
    initGame();
});
