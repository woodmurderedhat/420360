/**
 * Utility script to scan for sound files in the assets directory
 * This script is meant to be run in Node.js to generate a list of available sound files
 */

const fs = require('fs');
const path = require('path');

// Paths to scan
const SOUND_DIR = path.join(__dirname, '..', 'assets', 'sounds');
const MUSIC_DIR = path.join(__dirname, '..', 'assets', 'music');

// Function to scan a directory for audio files
function scanDirectory(dir) {
    try {
        // Check if directory exists
        if (!fs.existsSync(dir)) {
            console.error(`Directory does not exist: ${dir}`);
            return [];
        }

        // Get all files in the directory
        const files = fs.readdirSync(dir);
        
        // Filter for audio files
        const audioFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.wav', '.mp3', '.ogg', '.m4a'].includes(ext);
        });
        
        return audioFiles;
    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error);
        return [];
    }
}

// Scan for sound files
console.log('Scanning for sound files...');
const soundFiles = scanDirectory(SOUND_DIR);
console.log(`Found ${soundFiles.length} sound files in ${SOUND_DIR}:`);
soundFiles.forEach(file => console.log(`- ${file}`));

// Scan for music files
console.log('\nScanning for music files...');
const musicFiles = scanDirectory(MUSIC_DIR);
console.log(`Found ${musicFiles.length} music files in ${MUSIC_DIR}:`);
musicFiles.forEach(file => console.log(`- ${file}`));

// Generate JavaScript code for sound mappings
console.log('\nGenerated code for sound mappings:');
console.log('const SOUND_FILES = [');
soundFiles.forEach(file => console.log(`    '${file}',`));
console.log('];');

// Generate JavaScript code for music playlist
console.log('\nGenerated code for music playlist:');
console.log('const MUSIC_FILES = [');
musicFiles.forEach(file => console.log(`    'assets/music/${file}',`));
console.log('];');

console.log('\nYou can copy these arrays into your soundSystem.js file.');
