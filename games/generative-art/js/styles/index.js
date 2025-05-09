/**
 * index.js - Re-exports all art styles from the styles directory
 * This file makes it easier to import all styles from a single location
 */

import { artStyles } from './artStyles.js';
import { drawGeometricGrid } from './geometricGrid.js';
import { drawOrganicNoise } from './organicNoise.js';
import { drawFractalLines, drawFractalLineRecursive } from './fractalLines.js';
import { drawParticleSwarm } from './particleSwarm.js';
import { drawOrganicSplatters } from './organicSplatters.js';
import { drawGlitchMosaic } from './glitchMosaic.js';
import { drawNeonWaves } from './neonWaves.js';
import { drawPixelSort } from './pixelSort.js';
import { drawVoronoiCells } from './voronoiCells.js';
import { drawGeometricGridPrimitive } from './geometricGridPrimitive.js';
import { drawOrganicNoisePrimitive } from './organicNoisePrimitive.js';

// Export all styles
export {
    artStyles,
    drawGeometricGrid,
    drawOrganicNoise,
    drawFractalLines,
    drawFractalLineRecursive,
    drawParticleSwarm,
    drawOrganicSplatters,
    drawGlitchMosaic,
    drawNeonWaves,
    drawPixelSort,
    drawVoronoiCells,
    drawGeometricGridPrimitive,
    drawOrganicNoisePrimitive
};