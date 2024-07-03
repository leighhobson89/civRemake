// mapGenerator.js

// Import SimplexNoise from the specific path to the module
import SimplexNoise from './node_modules/simplex-noise/dist/esm/simplex-noise.js'; // Adjust the path as needed

// Helper function to generate a random integer within a range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a map with continents, oceans, and varying terrain based on latitude
export function generateMap(width, height, tileSize) {
    const map = [];
    const terrainTypes = ['#808080', '#0000FF', '#008000', '#FFFF00', '#FFFFFF']; // Grey, Blue, Green, Yellow, White
    const oceanColor = '#0000FF'; // Blue
    const tundraColor = '#FFFFFF'; // White
    const grasslandColor = '#008000'; // Green
    const plainsColor = '#FFFF00'; // Yellow

    const oceanThreshold = 0.3; // Percentage of the map that will be ocean
    const tundraThreshold = 0.1; // Percentage of the map that will be tundra (polar regions)
    const grasslandThreshold = 0.5; // Percentage of the map that will be grassland (mid-latitudes)
    // The rest will be plains (equatorial regions)

    // Generate map with ocean initially
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push(oceanColor);
        }
        map.push(row);
    }

    // Define latitude thresholds
    const tundraStart = Math.floor(height * tundraThreshold);
    const grasslandStart = Math.floor(height * grasslandThreshold);

    // Generate continents using Perlin noise for more natural shapes
    const noise = new SimplexNoise(); // You can use a noise library like SimplexNoise

    for (let y = tundraStart; y < height - tundraStart; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate noise value for continent generation
            const noiseValue = noise.createNoise2D(x / 50, y / 50); // Adjust frequency for different continent sizes

            // Adjust threshold for more or less continent coverage
            if (noiseValue > -0.2) {
                map[y][x] = terrainTypes[getRandomInt(1, 4)]; // Randomly assign grassland, plains, or mountains
            }
        }
    }

    // Add tundra and plains based on latitude
    for (let y = 0; y < tundraStart; y++) {
        for (let x = 0; x < width; x++) {
            map[y][x] = tundraColor; // Set top of the map (north pole) to tundra
            map[height - 1 - y][x] = tundraColor; // Set bottom of the map (south pole) to tundra
        }
    }

    // Add grasslands in between
    for (let y = tundraStart; y < grasslandStart; y++) {
        for (let x = 0; x < width; x++) {
            map[y][x] = grasslandColor;
        }
    }

    // Add plains in the middle (equatorial regions)
    for (let y = grasslandStart; y < height - grasslandStart; y++) {
        for (let x = 0; x < width; x++) {
            map[y][x] = plainsColor;
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
