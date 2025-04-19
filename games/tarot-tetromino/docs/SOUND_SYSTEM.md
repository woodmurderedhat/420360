# Tarot Tetris Sound System

This document explains how the sound system works in Tarot Tetris and how to add or modify sounds and music.

## Overview

The sound system handles both sound effects and background music for the game. It supports:

- Playing sound effects for various game events
- Playing background music with automatic cycling through all tracks
- Volume controls for both sound effects and music
- Muting/unmuting sound effects and music
- Saving sound settings to local storage

## Sound Files

### Sound Effects

Sound effects are stored in the `assets/sounds` directory. The system maps game events to specific sound files.

Current sound mappings:

| Event | Sound File |
|-------|------------|
| Piece Move | Clap02.wav |
| Piece Rotate | Clap03.wav |
| Piece Drop | Clap04.wav |
| Piece Lock | Clap05.wav |
| Piece Hold | Clap06.wav |
| Line Clear | Clap02.wav |
| Level Up | Clap03.wav |
| Game Over | Clap04.wav |
| Tarot Card Play | Clap05.wav |
| Tarot Card Draw | Clap06.wav |
| Menu Select | Clap02.wav |
| Menu Navigate | Clap03.wav |
| Shop Purchase | Clap04.wav |
| Shop Upgrade | Clap05.wav |
| Tetrimino Unlock | Clap06.wav |

### Background Music

Background music is stored in the `assets/music` directory. The system automatically creates a playlist of all music files in this directory and cycles through them.

## Adding New Sounds

### Adding Sound Effects

1. Place the new sound file in the `assets/sounds` directory
2. To map the sound to a specific event, modify the `DEFAULT_SOUND_MAPPINGS` object in `src/soundSystem.js`

Example:
```javascript
const DEFAULT_SOUND_MAPPINGS = {
    [SOUND_EFFECTS.PIECE_MOVE]: 'NewMoveSound.wav',
    // ... other mappings
};
```

### Adding Music Tracks

1. Simply place the new music file in the `assets/music` directory
2. The system will automatically detect and include it in the playlist
3. If you add files while the game is running, you'll need to refresh the page for them to be detected

## Utility Scripts

### Scan Sound Files

The `utils/scanSoundFiles.js` script scans the sound and music directories and generates JavaScript code for sound mappings and music playlist.

To run it:
```
node utils/scanSoundFiles.js
```

### Move BreakBeat Files

The `utils/moveBreakBeatFiles.js` script moves the BreakBeat files from the sounds directory to the music directory.

To run it:
```
node utils/moveBreakBeatFiles.js
```

## Testing

The `soundTest.html` file provides a simple interface to test all sounds and music. It includes:

- Buttons to play each sound effect
- Controls to play, stop, and navigate through the music playlist
- Display of the current track information
- Sound settings UI (volume controls, mute buttons)

## API Reference

The sound system exposes the following methods:

- `initialize()` - Initialize the sound system
- `playSound(soundId, volume)` - Play a sound effect
- `startMusicPlaylist()` - Start playing the music playlist
- `playNextTrack()` - Play the next track in the playlist
- `playPreviousTrack()` - Play the previous track in the playlist
- `playMusic(musicPath, loop)` - Play a specific music file (legacy method)
- `stopMusic()` - Stop the currently playing music
- `toggleMusic()` - Toggle music on/off
- `toggleSound()` - Toggle sound effects on/off
- `setMusicVolume(volume)` - Set music volume (0-1)
- `setSoundVolume(volume)` - Set sound effects volume (0-1)
- `getSettings()` - Get current sound settings
- `createSoundSettingsUI()` - Create sound settings UI
- `getCurrentTrackInfo()` - Get information about the current track

## Event Handling

The sound system listens for the following game events:

- Game state events (initialized, started, paused, resumed, game over, level up)
- Piece events (spawned, moved, rotated, locked, held, dropped)
- Board events (lines cleared, board cleared)
- Tarot events (card added, card played)
- Shop events (opened, closed, tetrimino upgraded, tetrimino unlocked, item purchased)
- UI events (overlay shown, overlay hidden)

Each event triggers a specific sound effect or music change.
