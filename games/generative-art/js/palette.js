/**
 * palette.js - Color palette generation for the Generative Art Studio
 * Handles creating color palettes based on different themes and art styles
 */

import { randomRange, hslToString } from './utils.js';
import { artStyles } from './styles.js';

/**
 * Generates a color palette based on the selected art style and color theme.
 * @param {string} style - The current art style.
 * @param {string} colorTheme - The color theme to use
 * @param {number} baseHue - Base hue for custom themes (0-360)
 * @param {number} saturation - Saturation for custom themes (0-100)
 * @param {number} lightness - Lightness for custom themes (0-100)
 * @returns {Array<string>} An array of color strings.
 */
function generatePalette(style, colorTheme = 'random', baseHue = 180, saturation = 70, lightness = 50) {
    // Use custom color settings if selected
    let paletteBaseHue = colorTheme === 'custom' ? baseHue : Math.random() * 360;
    let paletteSaturation = colorTheme === 'custom' ? saturation : 70 + Math.random() * 30;
    let paletteLightness = colorTheme === 'custom' ? lightness : 50 + Math.random() * 20;
    
    const palette = [];
    let numColors = 5;
    
    // Generate palette based on color theme
    switch (colorTheme) {
        case 'monochrome':
            numColors = 5;
            for (let i = 0; i < numColors; i++) {
                // Vary lightness for monochrome
                const l = 30 + (i * 60 / numColors);
                palette.push(hslToString(paletteBaseHue, paletteSaturation, l));
            }
            break;
            
        case 'complementary':
            // Base color and its complement
            palette.push(hslToString(paletteBaseHue, paletteSaturation, paletteLightness));
            palette.push(hslToString((paletteBaseHue + 180) % 360, paletteSaturation, paletteLightness));
            
            // Add variations
            palette.push(hslToString(paletteBaseHue, paletteSaturation * 0.8, paletteLightness * 1.2));
            palette.push(hslToString((paletteBaseHue + 180) % 360, paletteSaturation * 0.8, paletteLightness * 1.2));
            palette.push(hslToString(paletteBaseHue, paletteSaturation * 0.6, paletteLightness * 0.8));
            break;
            
        case 'analogous':
            // Base color and analogous colors
            for (let i = 0; i < 5; i++) {
                const hue = (paletteBaseHue + (i - 2) * 30 + 360) % 360;
                palette.push(hslToString(hue, paletteSaturation, paletteLightness));
            }
            break;
            
        case 'triadic':
            // Three colors evenly spaced
            for (let i = 0; i < 3; i++) {
                const hue = (paletteBaseHue + i * 120) % 360;
                palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                // Add a lighter and darker version
                palette.push(hslToString(hue, paletteSaturation * 0.8, Math.min(paletteLightness * 1.3, 95)));
                palette.push(hslToString(hue, paletteSaturation * 1.1, paletteLightness * 0.7));
            }
            break;
            
        case 'random':
        default:
            // Style-specific palettes
            switch (style) {
                case artStyles.GEOMETRIC_GRID:
                    numColors = Math.random() < 0.5 ? 3 : 5;
                    paletteSaturation = Math.random() < 0.5 ? (30 + Math.random() * 20) : (70 + Math.random() * 20);
                    paletteLightness = Math.random() < 0.5 ? (70 + Math.random() * 15) : (40 + Math.random() * 20);
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (Math.random() < 0.5 ? (360 / numColors) : 180))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;
                    
                case artStyles.ORGANIC_NOISE:
                    numColors = 7;
                    paletteSaturation = 60 + Math.random() * 25;
                    paletteLightness = 55 + Math.random() * 20;
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (15 + Math.random() * 20))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;
                    
                case artStyles.FRACTAL_LINES:
                    palette.push(hslToString(paletteBaseHue, 80 + Math.random() * 20, 30 + Math.random() * 20));
                    palette.push(hslToString((paletteBaseHue + 180 + (Math.random() - 0.5) * 60) % 360, 80 + Math.random() * 20, 70 + Math.random() * 20));
                    break;
                    
                case artStyles.PARTICLE_SWARM:
                    numColors = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + i * (120 + Math.random() * 60)) % 360;
                        palette.push(hslToString(hue, 90 + Math.random() * 10, 50 + Math.random() * 10));
                    }
                    break;
                    
                case artStyles.ORGANIC_SPLATTERS:
                    numColors = 4;
                    paletteSaturation = 75 + Math.random() * 25;
                    paletteLightness = 45 + Math.random() * 15;
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (90 + Math.random() * 30))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;
                    
                case artStyles.GLITCH_MOSAIC:
                    if (Math.random() < 0.5) {
                        numColors = 6;
                        for (let i = 0; i < numColors; i++) {
                            palette.push(hslToString(Math.random() * 360, 70 + Math.random() * 30, 50 + Math.random() * 25));
                        }
                    } else {
                        const accentHue = Math.random() * 360;
                        palette.push(hslToString(accentHue, 80 + Math.random() * 20, 50 + Math.random() * 10));
                        palette.push(hslToString(0, 0, 20 + Math.random() * 10));
                        palette.push(hslToString(0, 0, 50 + Math.random() * 10));
                        palette.push(hslToString(0, 0, 80 + Math.random() * 10));
                    }
                    break;
                    
                case artStyles.NEON_WAVES:
                    // Neon colors with dark background
                    palette.push(hslToString(paletteBaseHue, 100, 60)); // Main neon color
                    palette.push(hslToString((paletteBaseHue + 60) % 360, 100, 60));
                    palette.push(hslToString((paletteBaseHue + 180) % 360, 100, 60));
                    palette.push(hslToString((paletteBaseHue + 240) % 360, 100, 60));
                    palette.push(hslToString(0, 0, 10)); // Dark background/accent
                    break;
                    
                case artStyles.PIXEL_SORT:
                    // Limited palette for pixel sorting
                    numColors = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + i * (360 / numColors)) % 360;
                        palette.push(hslToString(hue, 70 + Math.random() * 30, 40 + Math.random() * 30));
                    }
                    break;
                    
                case artStyles.VORONOI_CELLS:
                    // Soft colors for Voronoi cells
                    numColors = 5 + Math.floor(Math.random() * 3);
                    paletteSaturation = 50 + Math.random() * 30;
                    paletteLightness = 60 + Math.random() * 20;
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + i * (360 / numColors)) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
                    break;
                    
                default:
                    for (let i = 0; i < numColors; i++) {
                        const hue = (paletteBaseHue + (i * (360 / numColors))) % 360;
                        palette.push(hslToString(hue, paletteSaturation, paletteLightness));
                    }
            }
    }
    
    return palette;
}

export { generatePalette };
