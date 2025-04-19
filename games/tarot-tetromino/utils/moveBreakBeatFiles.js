/**
 * Utility script to move BreakBeat files from sounds to music folder
 * This script is meant to be run in Node.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const SOUND_DIR = path.join(__dirname, '..', 'assets', 'sounds');
const MUSIC_DIR = path.join(__dirname, '..', 'assets', 'music');

// Files to move
const filesToMove = [
    'BreakBeat_Slice01.wav',
    'BreakBeat_Slice02.wav',
    'BreakBeat_Slice03.wav',
    'BreakBeat_Slice04.wav'
];

// Make sure music directory exists
if (!fs.existsSync(MUSIC_DIR)) {
    console.log(`Creating music directory: ${MUSIC_DIR}`);
    fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

// Move each file
filesToMove.forEach(file => {
    const sourcePath = path.join(SOUND_DIR, file);
    const destPath = path.join(MUSIC_DIR, file);
    
    if (fs.existsSync(sourcePath)) {
        console.log(`Moving ${file} from sounds to music folder...`);
        
        try {
            // Copy the file
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Successfully copied ${file} to music folder`);
            
            // Optionally remove the original file
            // Uncomment the next line if you want to remove the original files
            // fs.unlinkSync(sourcePath);
            // console.log(`Removed original ${file} from sounds folder`);
        } catch (error) {
            console.error(`Error moving ${file}:`, error);
        }
    } else {
        console.log(`File not found: ${sourcePath}`);
    }
});

console.log('Done!');
