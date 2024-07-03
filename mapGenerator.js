// Generate a map with random noise for terrain types
export function generateMap(width, height) {
    const map = [];
    const terrainColors = ['#0000FF', '#008000', '#808080']; // Blue (Ocean), Green (Grassland), Grey (Mountain)
    const tundraColor = '#FFFFFF'; // White
    const plainsColor = '#FFFF00'; // Yellow (Plains)

    const noise = new SimplexNoise(); // Create an instance of SimplexNoise

    // Calculate fading probability for speckled tundra
    let maxTundraProbability = 1; // Maximum probability at the edges

    // Calculate fading probability for plains
    const startingPlainsProbability = 0.1; // Maximum probability at the edges (30%)

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            if (y < 3 || y >= height - 3) {
                // Set first 3 rows and last 3 rows to tundra
                row.push(tundraColor);
            } else {
                // Calculate noise value for terrain generation
                const noiseValue = noise.noise2D(x / 50, y / 50); // Adjust frequency for different terrain sizes

                // Normalize noise value to 0-1
                const normalizedValue = (noiseValue + 1) / 2;

                // Determine terrain type based on normalized noise value
                let terrainIndex;
                if (normalizedValue < 0.5) {
                    terrainIndex = 0; // Ocean
                } else if (normalizedValue < 0.9) {
                    terrainIndex = 1; // Grassland
                } else {
                    terrainIndex = 2; // Mountain
                }

                row.push(terrainColors[terrainIndex]);
            }
        }
        map.push(row);
    }

    // Add speckled tundra effect in the specified rows with fading probability
    for (let y = 3; y <= 15; y++) {
        const tundraProbability = maxTundraProbability;
        for (let x = 0; x < width; x++) {
            if (Math.random() < tundraProbability) {
                map[y][x] = tundraColor; // Replace any terrain with tundra
            }
        }
        maxTundraProbability = maxTundraProbability - 0.08;
    }

    for (let y = height - 15; y < height - 3; y++) {
        const tundraProbability = maxTundraProbability;
        for (let x = 0; x < width; x++) {
            if (Math.random() < tundraProbability) {
                map[y][x] = tundraColor; // Replace any terrain with tundra
            }
        }
        maxTundraProbability = maxTundraProbability + 0.08;
    }

    // Add plains after initial generation with a probability on grassland tiles in the 30% above and below center
    const centerStart = Math.floor(height * 0.35); // 35% from the top
    const centerEnd = Math.floor(height * 0.65); // 65% from the top

    const centerMidpoint = (centerStart + centerEnd) / 2;

    let plainsCenterProbability = startingPlainsProbability;
    for (let y = centerStart; y <= centerEnd; y++) {

        if (y < centerMidpoint) {
            plainsCenterProbability = plainsCenterProbability + 0.015;
        } else {
            plainsCenterProbability = plainsCenterProbability - 0.015;
        }
        for (let x = 0; x < width; x++) {
            if (map[y][x] === terrainColors[1] && Math.random() < plainsCenterProbability) {
                map[y][x] = plainsColor; // Convert grassland to plains
            }
        }
    }

    return map;
}

// Render the map on the canvas
export function renderMap(context, map, tileSize) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            context.fillStyle = map[y][x];
            context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}
