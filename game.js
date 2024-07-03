import { generateMap, renderMap } from './mapGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');

    // Set canvas size to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let tileSize = 7;
    const initialTileSize = tileSize; // Save the initial tile size for zoom limits
    let mapWidth = Math.floor(canvas.width / tileSize);
    let mapHeight = Math.floor(canvas.height / tileSize);
    let gameState = 'menu'; // Initial state is 'menu'
    let map = null; // Initialize map as null

    const menu = document.createElement('div');
    menu.id = 'menu';
    document.body.appendChild(menu);

    // Create buttons
    const buttonLabels = ['Start Game', 'Options', 'Help', 'Credits', 'Load Game', 'Quit'];
    const buttons = {};
    buttonLabels.forEach((label, index) => {
        const button = document.createElement('button');
        button.innerText = label;
        menu.appendChild(button);
        buttons[label] = button;
        button.addEventListener('click', () => {
            if (label === 'Start Game') {
                if (map === null) {
                    // Generate map only if it's the first time starting the game
                    map = generateMap(mapWidth, mapHeight);
                }
                gameState = 'game';
                menu.style.display = 'none';
                button.innerText = 'Continue';
                console.log(`Game state changed to: ${gameState}`);
                renderGame();
            }
        });
    });

    buttons['Start Game'].addEventListener('click', () => {
        if (gameState === 'menu') {
            if (map === null) {
                map = generateMap(mapWidth, mapHeight);
            }
            gameState = 'game';
            menu.style.display = 'none';
            console.log(`Game state changed to: ${gameState}`);
            renderGame();
        }
    });

    // Create zoom in/out buttons
    const zoomInButton = document.createElement('button');
    zoomInButton.innerText = '+';
    zoomInButton.style.position = 'absolute';
    zoomInButton.style.top = '10px';
    zoomInButton.style.left = '10px';
    document.body.appendChild(zoomInButton);

    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerText = '-';
    zoomOutButton.style.position = 'absolute';
    zoomOutButton.style.top = '50px';
    zoomOutButton.style.left = '10px';
    document.body.appendChild(zoomOutButton);

    // Zoom in/out functionality with limits
    const maxZoomInLevels = 5;
    const maxTileSize = initialTileSize + maxZoomInLevels;
    const minTileSize = initialTileSize;

    zoomInButton.addEventListener('click', () => {
        if (tileSize < maxTileSize) {
            tileSize++;
            updateMapDimensions();
            renderGame();
        }
    });

    zoomOutButton.addEventListener('click', () => {
        if (tileSize > minTileSize) {
            tileSize--;
            updateMapDimensions();
            renderGame();
        }
    });

    // Update map dimensions based on tileSize
    function updateMapDimensions() {
        mapWidth = Math.floor(canvas.width / tileSize);
        mapHeight = Math.floor(canvas.height / tileSize);
    }

    function renderGame() {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render the map if it exists
        if (map) {
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    const tileColor = map[y][x];
                    context.fillStyle = tileColor;
                    context.fillRect(
                        x * tileSize,
                        y * tileSize,
                        tileSize,
                        tileSize
                    );
                }
            }
        }
    }

    function gameLoop() {
        if (gameState === 'game') {
            // Game logic update (if any) can go here
            renderGame();
        }

        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        updateMapDimensions();
        if (gameState === 'game') {
            renderGame();
        }
    });

    // Event listener to switch to menu state when Escape is pressed
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gameState === 'game') {
            gameState = 'menu';
            menu.style.display = 'flex';
            context.clearRect(0, 0, canvas.width, canvas.height);
            console.log(`Game state changed to: ${gameState}`);
        }
    });
});
