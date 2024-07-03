// Generate a map with random noise for terrain types
export function generateMap(width, height) {
    const map = [];
    const terrainColors = ['#0000FF', '#008000', '#332e22', '#FFFFFF']; // Blue (Ocean), Green (Grassland), Grey (Mountain), White (Peaks)
    const tundraColor = '#FFFFFF'; // White
    const plainsColor = '#a8a500'; // Yellow (Plains)
    const forestColor = '#002f00'; // Dark Green for Forest

    const noise = new SimplexNoise(); // Create an instance of SimplexNoise

    // Calculate fading probability for speckled tundra
    let maxTundraProbability = 1; // Maximum probability at the edges

    // Calculate fading probability for plains
    const startingPlainsProbability = 0.1;

    // Calculate fading probability for forest
    const forestStart1 = 7;
    const forestEnd1 = Math.floor(height * 0.45);
    const forestStart2 = Math.floor(height * 0.55);
    const forestEnd2 = height - 7;

    let maxForestProbability = 0.5; // Maximum probability for forest
    let minForestProbability = 0.1; // Minimum probability for forest

    // Function to add forest terrain in the specified rows with inverted fading probability
    function addForestTerrain(startY, endY) {
        for (let y = startY; y <= endY; y++) {
            const distanceFromEdge = Math.abs((y - startY) - (endY - startY) / 2);
            const invertedDistance = (endY - startY) / 2 - distanceFromEdge;
            const forestProbability = minForestProbability + (invertedDistance / ((endY - startY) / 2)) * (maxForestProbability - minForestProbability);
            for (let x = 0; x < width; x++) {
                if (map[y][x] !== terrainColors[0] && map[y][x] !== terrainColors[2] && map[y][x] !== terrainColors[3] && map[y][x] !== tundraColor && Math.random() < forestProbability) {
                    map[y][x] = forestColor; // Replace non-ocean, non-mountain, non-peaks, and non-tundra terrain with forest
                }
            }
        }
    }

    // Generate initial terrain map
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            if (y < 3 || y >= height - 3) {
                // Set first 3 rows and last 3 rows to tundra
                row.push(tundraColor);
            } else {
                // Calculate noise values for terrain generation
                const baseNoiseValue = noise.noise2D(x / 80, y / 80); // Low frequency for large shapes
                const detailNoiseValue = noise.noise2D(x / 40, y / 40); // Higher frequency for details

                // Combine noise values to influence terrain
                const combinedNoiseValue = (baseNoiseValue + detailNoiseValue * 0.3);

                // Normalize noise value to 0-1
                const normalizedValue = (combinedNoiseValue + 1) / 2;

                // Determine terrain type based on normalized noise value
                let terrainIndex;
                if (normalizedValue < 0.5) { // Lower threshold for more distinct land/ocean separation
                    terrainIndex = 0; // Ocean
                } else if (normalizedValue < 0.82) {
                    terrainIndex = 1; // Grassland
                } else if (normalizedValue < 0.92) {
                    terrainIndex = 2; // Mountain
                } else {
                    terrainIndex = 3; // Peaks
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
        maxTundraProbability -= 0.08;
    }

    for (let y = height - 15; y < height - 3; y++) {
        const tundraProbability = maxTundraProbability;
        for (let x = 0; x < width; x++) {
            if (Math.random() < tundraProbability) {
                map[y][x] = tundraColor; // Replace any terrain with tundra
            }
        }
        maxTundraProbability += 0.08;
    }

    // Add plains after initial generation with a probability on grassland tiles in the 30% above and below center
    const centerStart = Math.floor(height * 0.25); // 25% from the top
    const centerEnd = Math.floor(height * 0.75); // 75% from the top

    let plainsCenterProbability = startingPlainsProbability;
    for (let y = centerStart; y <= centerEnd; y++) {
        if (y < (centerStart + centerEnd) / 2) {
            plainsCenterProbability += 0.01;
        } else {
            plainsCenterProbability -= 0.01;
        }
        for (let x = 0; x < width; x++) {
            if (map[y][x] === terrainColors[1] && Math.random() < plainsCenterProbability) {
                map[y][x] = plainsColor; // Convert grassland to plains
            }
        }
    }

    // Add forest terrain using the defined function
    addForestTerrain(forestStart1, forestEnd1);
    addForestTerrain(forestStart2, forestEnd2);

    // Initialize red pixel position randomly within map bounds
    const redPixelPosition = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height)
    };

    // Store red pixel position in map array
    map.redPixelPosition = redPixelPosition;

    return map;
}
