import { generateMap } from './mapGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');

    // Set canvas size to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const tileSize = 7; // Fixed tile size
    let mapWidth = Math.floor(canvas.width / tileSize);
    let mapHeight = Math.floor(canvas.height / tileSize);
    let gameState = 'menu'; // Initial state is 'menu'
    let map = null; // Initialize map as null
    let movesCount = 0; // Counter to track number of moves
    let turnPoints = 3; // Total turn points available per turn
    let flashing = false; // Flag to control red pixel flashing

    const menu = document.createElement('div');
    menu.id = 'menu';
    document.body.appendChild(menu);

    // Create buttons
    const buttonLabels = ['Start Game', 'Options', 'Help', 'Credits', 'Load Game', 'Quit'];
    const buttons = {};
    buttonLabels.forEach((label) => {
        const button = document.createElement('button');
        button.innerText = label;
        menu.appendChild(button);
        buttons[label] = button;
        button.addEventListener('click', () => {
            if (label === 'Start Game') {
                if (map === null) {
                    // Generate map only if it's the first time starting the game
                    map = generateMap(mapWidth, mapHeight);
                    selectStartPosition();
                }
                gameState = 'game';
                menu.style.display = 'none';
                button.innerText = 'Continue';
                console.log(`Game state changed to: ${gameState}`);
                renderGame();
            }
        });
    });

    // Event listener to start the game directly
    buttons['Start Game'].addEventListener('click', () => {
        if (gameState === 'menu') {
            if (map === null) {
                map = generateMap(mapWidth, mapHeight);
                selectStartPosition();
            }
            gameState = 'game';
            menu.style.display = 'none';
            console.log(`Game state changed to: ${gameState}`);
            renderGame();
        }
    });

    // Function to randomly select a starting position for the red pixel
    function selectStartPosition() {
        let startX, startY;
        do {
            startX = Math.floor(Math.random() * mapWidth);
            startY = Math.floor(Math.random() * mapHeight);
        } while (isMountainOrOcean(startY, startX));

        map.redPixelPosition = { x: startX, y: startY };
    }

    // Event listener for keyboard input to move the red pixel
    window.addEventListener('keydown', (event) => {
        if (turnPoints === 0) {
            console.log('Turn done');
            return;
        }

        const { key } = event;
        const { x, y } = map.redPixelPosition;
        let newX = x;
        let newY = y;
        let moved = false; // Flag to check if movement occurred

        switch (key) {
            case 'Numpad8': // Up (Numpad 8)
            case 'ArrowUp': // Additional control for Up arrow key
                if (y > 0 && !isMountainOrOcean(y - 1, x)) {
                    newY = y - 1;
                    moved = true;
                }
                break;
            case 'Numpad2': // Down (Numpad 2)
            case 'ArrowDown': // Additional control for Down arrow key
                if (y < mapHeight - 1 && !isMountainOrOcean(y + 1, x)) {
                    newY = y + 1;
                    moved = true;
                }
                break;
            case 'Numpad4': // Left (Numpad 4)
            case 'ArrowLeft': // Additional control for Left arrow key
                if (x > 0 && !isMountainOrOcean(y, x - 1)) {
                    newX = x - 1;
                    moved = true;
                }
                break;
            case 'Numpad6': // Right (Numpad 6)
            case 'ArrowRight': // Additional control for Right arrow key
                if (x < mapWidth - 1 && !isMountainOrOcean(y, x + 1)) {
                    newX = x + 1;
                    moved = true;
                }
                break;
            case 'Numpad7': // Up and Left (Numpad 7) or Home
            case 'Home':
                if (y > 0 && x > 0 && !isMountainOrOcean(y - 1, x - 1)) {
                    newY = y - 1;
                    newX = x - 1;
                    moved = true;
                }
                break;
            case 'Numpad9': // Up and Right (Numpad 9) or PageUp
            case 'PageUp':
                if (y > 0 && x < mapWidth - 1 && !isMountainOrOcean(y - 1, x + 1)) {
                    newY = y - 1;
                    newX = x + 1;
                    moved = true;
                }
                break;
            case 'Numpad1': // Down and Left (Numpad 1) or End
            case 'End':
                if (y < mapHeight - 1 && x > 0 && !isMountainOrOcean(y + 1, x - 1)) {
                    newY = y + 1;
                    newX = x - 1;
                    moved = true;
                }
                break;
            case 'Numpad3': // Down and Right (Numpad 3) or PageDown
            case 'PageDown':
                if (y < mapHeight - 1 && x < mapWidth - 1 && !isMountainOrOcean(y + 1, x + 1)) {
                    newY = y + 1;
                    newX = x + 1;
                    moved = true;
                }
                break;
        }

        if (moved) {
            // Determine terrain cost for the destination tile
            let terrainCost = 0;
            switch (map[newY][newX]) {
                case '#008000': // Grassland
                    terrainCost = 1;
                    break;
                case '#a8a500': // Plains
                    terrainCost = 2;
                    break;
                case '#002f00': // Forest
                    terrainCost = 3;
                    break;
                default:
                    terrainCost = 0; // No cost for other terrains
                    break;
            }

            if (terrainCost > turnPoints) {
                // If the terrain cost is higher than the remaining turn points, do not move
                turnPoints = 0;
                console.log("Turn Points Left: 0");
                console.log('Turn done');
                movesCount = 0;
                turnPoints = 3;
            } else {
                // Move the red pixel and deduct turn points based on terrain cost
                map.redPixelPosition = { x: newX, y: newY };
                movesCount++;
                turnPoints -= terrainCost; // Deduct turn points based on terrain cost
                console.log("Turn Points Left: " + turnPoints);

                // Check if move exceeds the limit of 3 moves per turn or turn points are exhausted
                if (movesCount === 3 || turnPoints === 0) {
                    console.log('Turn done');
                    movesCount = 0;
                    turnPoints = 3;
                }
            }

            renderGame();
        }
    });

    // Function to check if a given position is a mountain or ocean tile
    function isMountainOrOcean(y, x) {
        const tile = map[y][x];
        return tile === "#0000FF" || tile === "#332e22" || tile === "#FFFFFF";
    }

    // Function to render the game
    function renderGame() {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Toggle flashing effect
        flashing = !flashing;

        // Render the map if it exists
        if (map) {
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    context.fillStyle = map[y][x];
                    context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }

            // Flashing red pixel
            if (flashing) {
                const { x, y } = map.redPixelPosition;
                context.fillStyle = '#FF0000'; // Red color
                context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // Flash the red pixel every second
    setInterval(renderGame, 1000);

    // Event listener for window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        mapWidth = Math.floor(canvas.width / tileSize); // Update mapWidth based on tileSize
        mapHeight = Math.floor(canvas.height / tileSize); // Update mapHeight based on tileSize
        renderGame(); // Re-render the game on window resize
    });

    // Event listener to switch to menu state when Escape key is pressed
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gameState === 'game') {
            gameState = 'menu'; // Switch game state to menu
            menu.style.display = 'flex'; // Display the menu
            context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            console.log(`Game state changed to: ${gameState}`);
        }
    });
});
