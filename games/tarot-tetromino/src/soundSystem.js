/**
 * Sound System for Tarot Tetris
 * A centralized sound system to handle sound effects and background music.
 */

(function(exports) {
    // Store sound settings
    const soundSettings = {
        musicEnabled: true,
        soundEnabled: true,
        musicVolume: 0.5,
        soundVolume: 0.7
    };

    // Store audio elements
    const audioElements = {
        music: null,
        effects: {}
    };

    // Music playlist management
    const musicPlaylist = {
        tracks: [],
        currentIndex: 0,
        isPlaying: false,
        gameMode: 'menu' // Can be 'menu', 'gameplay', 'gameover'
    };

    // List of sound effects
    const SOUND_EFFECTS = {
        PIECE_MOVE: 'move',
        PIECE_ROTATE: 'rotate',
        PIECE_DROP: 'drop',
        PIECE_LOCK: 'lock',
        PIECE_HOLD: 'hold',
        LINE_CLEAR: 'lineClear',
        LEVEL_UP: 'levelUp',
        GAME_OVER: 'gameOver',
        TAROT_CARD_PLAY: 'tarotPlay',
        TAROT_CARD_DRAW: 'tarotDraw',
        MENU_SELECT: 'menuSelect',
        MENU_NAVIGATE: 'menuNavigate',
        SHOP_PURCHASE: 'purchase',
        SHOP_UPGRADE: 'upgrade',
        TETRIMINO_UNLOCK: 'unlock'
    };

    // Sound file paths - will be populated dynamically
    const SOUND_PATHS = {};

    // Default sound mappings - fallbacks if specific sounds aren't found
    const DEFAULT_SOUND_MAPPINGS = {
        [SOUND_EFFECTS.PIECE_MOVE]: 'Clap02.wav',
        [SOUND_EFFECTS.PIECE_ROTATE]: 'Clap03.wav',
        [SOUND_EFFECTS.PIECE_DROP]: 'Clap04.wav',
        [SOUND_EFFECTS.PIECE_LOCK]: 'Clap05.wav',
        [SOUND_EFFECTS.PIECE_HOLD]: 'Clap06.wav',
        [SOUND_EFFECTS.LINE_CLEAR]: 'Clap02.wav',
        [SOUND_EFFECTS.LEVEL_UP]: 'Clap03.wav',
        [SOUND_EFFECTS.GAME_OVER]: 'Clap04.wav',
        [SOUND_EFFECTS.TAROT_CARD_PLAY]: 'Clap05.wav',
        [SOUND_EFFECTS.TAROT_CARD_DRAW]: 'Clap06.wav',
        [SOUND_EFFECTS.MENU_SELECT]: 'Clap02.wav',
        [SOUND_EFFECTS.MENU_NAVIGATE]: 'Clap03.wav',
        [SOUND_EFFECTS.SHOP_PURCHASE]: 'Clap04.wav',
        [SOUND_EFFECTS.SHOP_UPGRADE]: 'Clap05.wav',
        [SOUND_EFFECTS.TETRIMINO_UNLOCK]: 'Clap06.wav'
    };

    /**
     * Initialize the sound system
     */
    function initialize() {
        // Load settings from local storage
        loadSettings();

        // Create audio context (if supported)
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API is not supported in this browser');
        }

        // Create music element
        audioElements.music = new Audio();
        audioElements.music.loop = false; // Set to false for playlist functionality
        audioElements.music.volume = soundSettings.musicVolume;

        // Set up event for when a track ends to play the next one
        audioElements.music.addEventListener('ended', playNextTrack);

        // Load available sounds and music
        loadSoundFiles();
        loadMusicFiles();

        // Set up event listeners
        setupEventListeners();

        // Create placeholder elements for sound effects
        // We'll create actual audio elements on demand to save resources
    }

    /**
     * Load sound files from the assets/sounds directory
     */
    function loadSoundFiles() {
        // In a browser environment, we can't directly read directory contents
        // So we'll use our default mappings and check if files exist
        for (const [soundId, filename] of Object.entries(DEFAULT_SOUND_MAPPINGS)) {
            SOUND_PATHS[soundId] = `../assets/sounds/${filename}`;
        }

        console.log('Sound files loaded:', Object.keys(SOUND_PATHS).length);
    }

    /**
     * Load music files from the assets/music directory
     * and also include music files from assets/sounds if needed
     */
    function loadMusicFiles() {
        // In a browser environment, we can't directly read directory contents
        // So we'll hardcode the music files we know exist
        const knownMusicFiles = [
            '../assets/music/recording_2024-03-24_14-41.wav'
        ];

        // Add BreakBeat files - check both music and sounds directories
        const breakBeatFiles = [
            { path: '../assets/music/BreakBeat_Slice01.wav', fallback: '../assets/sounds/BreakBeat_Slice01.wav' },
            { path: '../assets/music/BreakBeat_Slice02.wav', fallback: '../assets/sounds/BreakBeat_Slice02.wav' },
            { path: '../assets/music/BreakBeat_Slice03.wav', fallback: '../assets/sounds/BreakBeat_Slice03.wav' },
            { path: '../assets/music/BreakBeat_Slice04.wav', fallback: '../assets/sounds/BreakBeat_Slice04.wav' }
        ];

        // Check each BreakBeat file and add it to the playlist
        breakBeatFiles.forEach(file => {
            // We'll add the primary path and let the audio system fall back if needed
            knownMusicFiles.push(file.path);

            // Log a warning if we're using the fallback path
            const testAudio = new Audio();
            testAudio.src = file.path;
            testAudio.addEventListener('error', () => {
                console.warn(`Music file ${file.path} not found, using fallback: ${file.fallback}`);
                // Replace the path in the playlist
                const index = musicPlaylist.tracks.indexOf(file.path);
                if (index !== -1) {
                    musicPlaylist.tracks[index] = file.fallback;
                }
            });
        });

        // Add all known music files to the playlist
        musicPlaylist.tracks = knownMusicFiles;
        musicPlaylist.currentIndex = 0;

        console.log('Music playlist loaded:', musicPlaylist.tracks.length, 'tracks');
    }

    /**
     * Load sound settings from local storage
     */
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('tarotTetrisSoundSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                soundSettings.musicEnabled = parsedSettings.musicEnabled !== undefined ? parsedSettings.musicEnabled : true;
                soundSettings.soundEnabled = parsedSettings.soundEnabled !== undefined ? parsedSettings.soundEnabled : true;
                soundSettings.musicVolume = parsedSettings.musicVolume !== undefined ? parsedSettings.musicVolume : 0.5;
                soundSettings.soundVolume = parsedSettings.soundVolume !== undefined ? parsedSettings.soundVolume : 0.7;
            }
        } catch (e) {
            console.error('Error loading sound settings:', e);
        }
    }

    /**
     * Save sound settings to local storage
     */
    function saveSettings() {
        try {
            localStorage.setItem('tarotTetrisSoundSettings', JSON.stringify(soundSettings));
        } catch (e) {
            console.error('Error saving sound settings:', e);
        }
    }

    /**
     * Set up event listeners for game events
     */
    function setupEventListeners() {
        if (TarotTetris.events) {
            // Game state events
            TarotTetris.events.on(TarotTetris.EVENTS.GAME_INITIALIZED, () => {
                // Play a startup sound when the game is initialized
                playSound(SOUND_EFFECTS.MENU_SELECT);
                // Start with menu music
                musicPlaylist.gameMode = 'menu';
                startMusicPlaylist();
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_STARTED, () => {
                musicPlaylist.gameMode = 'gameplay';
                startMusicPlaylist();
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_PAUSED, () => {
                // Play a pause sound
                playSound(SOUND_EFFECTS.MENU_SELECT);
                // Pause music
                if (audioElements.music) {
                    audioElements.music.pause();
                    musicPlaylist.isPlaying = false;
                }
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_RESUMED, () => {
                // Play a resume sound
                playSound(SOUND_EFFECTS.MENU_SELECT);
                // Resume music
                if (audioElements.music && soundSettings.musicEnabled) {
                    audioElements.music.play().catch(e => console.warn('Could not play audio:', e));
                    musicPlaylist.isPlaying = true;
                }
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, () => {
                playSound(SOUND_EFFECTS.GAME_OVER);
                musicPlaylist.gameMode = 'gameover';
                startMusicPlaylist();
            });

            TarotTetris.events.on(TarotTetris.EVENTS.LEVEL_UP, () => {
                playSound(SOUND_EFFECTS.LEVEL_UP);
                // We'll just play the level up sound without changing music
            });

            // Piece events
            TarotTetris.events.on(TarotTetris.EVENTS.PIECE_SPAWNED, () => {
                // Play a subtle sound when a new piece appears
                playSound(SOUND_EFFECTS.PIECE_MOVE, 0.3); // Lower volume for this frequent event
            });

            TarotTetris.events.on(TarotTetris.EVENTS.PIECE_MOVED, () => {
                playSound(SOUND_EFFECTS.PIECE_MOVE);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.PIECE_ROTATED, () => {
                playSound(SOUND_EFFECTS.PIECE_ROTATE);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.PIECE_LOCKED, () => {
                playSound(SOUND_EFFECTS.PIECE_LOCK);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.PIECE_HELD, () => {
                playSound(SOUND_EFFECTS.PIECE_HOLD);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.PIECE_DROPPED, () => {
                playSound(SOUND_EFFECTS.PIECE_DROP);
            });

            // Board events
            TarotTetris.events.on(TarotTetris.EVENTS.LINES_CLEARED, (data) => {
                playSound(SOUND_EFFECTS.LINE_CLEAR);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.BOARD_CLEARED, () => {
                // Play a special sound when the board is cleared
                playSound(SOUND_EFFECTS.LEVEL_UP);
            });

            // Tarot events
            TarotTetris.events.on(TarotTetris.EVENTS.TAROT_CARD_ADDED, () => {
                playSound(SOUND_EFFECTS.TAROT_CARD_DRAW);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.TAROT_CARD_PLAYED, () => {
                playSound(SOUND_EFFECTS.TAROT_CARD_PLAY);
            });

            // Shop events
            TarotTetris.events.on(TarotTetris.EVENTS.SHOP_OPENED, () => {
                playSound(SOUND_EFFECTS.MENU_SELECT);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.SHOP_CLOSED, () => {
                playSound(SOUND_EFFECTS.MENU_SELECT);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.TETRIMINO_UPGRADED, () => {
                playSound(SOUND_EFFECTS.SHOP_UPGRADE);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.TETRIMINO_UNLOCKED, () => {
                playSound(SOUND_EFFECTS.TETRIMINO_UNLOCK);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.ITEM_PURCHASED, () => {
                playSound(SOUND_EFFECTS.SHOP_PURCHASE);
            });

            // UI events
            TarotTetris.events.on(TarotTetris.EVENTS.UI_OVERLAY_SHOWN, (data) => {
                if (data && data.overlayType === 'pause') {
                    // Pause music when pause overlay is shown
                    if (audioElements.music) {
                        audioElements.music.pause();
                        musicPlaylist.isPlaying = false;
                    }
                }
            });

            TarotTetris.events.on(TarotTetris.EVENTS.UI_OVERLAY_HIDDEN, (data) => {
                if (data && data.overlayType === 'pause') {
                    // Resume music when pause overlay is hidden
                    if (audioElements.music && !audioElements.music.ended && soundSettings.musicEnabled) {
                        audioElements.music.play().catch(e => console.warn('Could not play audio:', e));
                        musicPlaylist.isPlaying = true;
                    }
                }
            });
        }
    }

    /**
     * Play a sound effect
     * @param {string} soundId - The ID of the sound effect to play
     * @param {number} volume - Optional volume override (0-1)
     */
    function playSound(soundId, volume) {
        if (!soundSettings.soundEnabled) return;

        // Use the provided volume or the default sound volume
        const soundVolume = volume !== undefined ? volume : soundSettings.soundVolume;

        // Get the sound path
        const soundPath = SOUND_PATHS[soundId];
        if (!soundPath) {
            console.warn(`Sound effect "${soundId}" not found`);
            return;
        }

        try {
            // Always create a new audio element to avoid interruption issues
            const audio = new Audio(soundPath);
            audio.volume = soundVolume;

            // Store the audio element for potential future reference
            audioElements.effects[soundId] = audio;

            // Play the sound with a promise to handle errors
            audio.play().catch(e => {
                // Just log the error but don't retry for sound effects
                // as they're usually time-sensitive
                console.warn(`Could not play sound effect ${soundId}:`, e);
            });
        } catch (e) {
            console.warn(`Error setting up sound effect ${soundId}:`, e);
        }
    }

    /**
     * Start playing the music playlist
     */
    function startMusicPlaylist() {
        if (!soundSettings.musicEnabled || musicPlaylist.tracks.length === 0) return;

        // Stop any currently playing music first
        if (audioElements.music) {
            try {
                audioElements.music.pause();
                audioElements.music.currentTime = 0;
            } catch (e) {
                console.warn('Error stopping current music:', e);
            }
        }

        // Reset to the first track
        musicPlaylist.currentIndex = 0;
        musicPlaylist.isPlaying = true;

        // Play the current track
        setTimeout(playCurrentTrack, 100); // Small delay to avoid interruption issues
    }

    /**
     * Play the current track in the playlist
     */
    function playCurrentTrack() {
        if (!soundSettings.musicEnabled || !musicPlaylist.isPlaying) return;

        // Make sure we have a valid index
        if (musicPlaylist.currentIndex >= musicPlaylist.tracks.length) {
            musicPlaylist.currentIndex = 0;
        }

        // Get the current track
        const currentTrack = musicPlaylist.tracks[musicPlaylist.currentIndex];

        // Create a new audio element each time to avoid interruption issues
        const oldAudio = audioElements.music;

        // Create a new audio element
        audioElements.music = new Audio();
        audioElements.music.loop = false; // We handle looping through the playlist
        audioElements.music.volume = soundSettings.musicVolume;

        // Set up event for when a track ends to play the next one
        audioElements.music.addEventListener('ended', playNextTrack);

        // Set new music source
        audioElements.music.src = currentTrack;

        // Stop old audio if it exists
        if (oldAudio) {
            try {
                oldAudio.pause();
                oldAudio.currentTime = 0;
                // Remove event listeners to prevent memory leaks
                oldAudio.removeEventListener('ended', playNextTrack);
            } catch (e) {
                console.warn('Error stopping previous audio:', e);
            }
        }

        // Play the music with retry logic
        const playWithRetry = (retries = 3) => {
            audioElements.music.play().catch(e => {
                console.warn(`Could not play audio (retries left: ${retries}):`, e);
                if (retries > 0) {
                    // Wait a bit and retry
                    setTimeout(() => playWithRetry(retries - 1), 500);
                } else {
                    // Try the next track if this one fails after all retries
                    setTimeout(playNextTrack, 1000);
                }
            });
        };

        playWithRetry();
    }

    /**
     * Play the next track in the playlist
     */
    function playNextTrack() {
        if (!soundSettings.musicEnabled) return;

        // Set playing state
        musicPlaylist.isPlaying = true;

        // Move to the next track
        musicPlaylist.currentIndex = (musicPlaylist.currentIndex + 1) % musicPlaylist.tracks.length;

        // Play the current track with a small delay to avoid interruption issues
        setTimeout(playCurrentTrack, 50);
    }

    /**
     * Play the previous track in the playlist
     */
    function playPreviousTrack() {
        if (!soundSettings.musicEnabled) return;

        // Set playing state
        musicPlaylist.isPlaying = true;

        // Move to the previous track
        musicPlaylist.currentIndex = (musicPlaylist.currentIndex - 1 + musicPlaylist.tracks.length) % musicPlaylist.tracks.length;

        // Play the current track with a small delay to avoid interruption issues
        setTimeout(playCurrentTrack, 50);
    }

    /**
     * Play background music (legacy method, now uses playlist)
     * @param {string} musicPath - The path to the music file
     * @param {boolean} loop - Whether to loop the music (default: true)
     */
    function playMusic(musicPath, loop = true) {
        if (!soundSettings.musicEnabled) return;

        // Stop current music if playing
        if (audioElements.music) {
            audioElements.music.pause();
            audioElements.music.currentTime = 0;
        }

        // Set new music source
        audioElements.music.src = musicPath;
        audioElements.music.loop = loop;
        audioElements.music.volume = soundSettings.musicVolume;

        // Play the music
        audioElements.music.play().catch(e => console.warn('Could not play audio:', e));

        // Update playlist state
        musicPlaylist.isPlaying = true;
    }

    /**
     * Stop the currently playing music
     */
    function stopMusic() {
        // Update playlist state first
        musicPlaylist.isPlaying = false;

        // Then stop the audio
        if (audioElements.music) {
            try {
                audioElements.music.pause();
                audioElements.music.currentTime = 0;
            } catch (e) {
                console.warn('Error stopping music:', e);
                // Create a new audio element to ensure clean state
                audioElements.music = new Audio();
                audioElements.music.volume = soundSettings.musicVolume;
                audioElements.music.addEventListener('ended', playNextTrack);
            }
        }
    }

    /**
     * Toggle music on/off
     * @returns {boolean} The new music enabled state
     */
    function toggleMusic() {
        soundSettings.musicEnabled = !soundSettings.musicEnabled;

        if (soundSettings.musicEnabled) {
            // Resume music if it was playing
            if (musicPlaylist.isPlaying) {
                if (audioElements.music && audioElements.music.src) {
                    audioElements.music.play().catch(e => console.warn('Could not play audio:', e));
                } else {
                    // Start the playlist if no music is currently loaded
                    startMusicPlaylist();
                }
            }
        } else {
            // Pause music
            if (audioElements.music) {
                audioElements.music.pause();
            }
        }

        saveSettings();
        return soundSettings.musicEnabled;
    }

    /**
     * Toggle sound effects on/off
     * @returns {boolean} The new sound enabled state
     */
    function toggleSound() {
        soundSettings.soundEnabled = !soundSettings.soundEnabled;
        saveSettings();
        return soundSettings.soundEnabled;
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    function setMusicVolume(volume) {
        soundSettings.musicVolume = Math.max(0, Math.min(1, volume));
        if (audioElements.music) {
            audioElements.music.volume = soundSettings.musicVolume;
        }
        saveSettings();
    }

    /**
     * Get the current music track information
     * @returns {Object} Information about the current track
     */
    function getCurrentTrackInfo() {
        if (musicPlaylist.tracks.length === 0) {
            return { index: -1, path: null, total: 0 };
        }

        return {
            index: musicPlaylist.currentIndex,
            path: musicPlaylist.tracks[musicPlaylist.currentIndex],
            total: musicPlaylist.tracks.length
        };
    }

    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    function setSoundVolume(volume) {
        soundSettings.soundVolume = Math.max(0, Math.min(1, volume));
        saveSettings();
    }

    /**
     * Get current sound settings
     * @returns {Object} The current sound settings
     */
    function getSettings() {
        return { ...soundSettings };
    }

    /**
     * Create sound settings UI
     * @returns {HTMLElement} The sound settings UI element
     */
    function createSoundSettingsUI() {
        const container = document.createElement('div');
        container.className = 'sound-settings';

        container.innerHTML = `
            <h3>Sound Settings</h3>
            <div class="setting-row">
                <label for="music-toggle">Music</label>
                <label class="switch">
                    <input type="checkbox" id="music-toggle" ${soundSettings.musicEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="setting-row">
                <label for="music-volume">Music Volume</label>
                <input type="range" id="music-volume" min="0" max="1" step="0.1" value="${soundSettings.musicVolume}">
            </div>
            <div class="setting-row">
                <label for="sound-toggle">Sound Effects</label>
                <label class="switch">
                    <input type="checkbox" id="sound-toggle" ${soundSettings.soundEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="setting-row">
                <label for="sound-volume">Sound Volume</label>
                <input type="range" id="sound-volume" min="0" max="1" step="0.1" value="${soundSettings.soundVolume}">
            </div>
        `;

        // Set up event listeners
        const musicToggle = container.querySelector('#music-toggle');
        const musicVolume = container.querySelector('#music-volume');
        const soundToggle = container.querySelector('#sound-toggle');
        const soundVolume = container.querySelector('#sound-volume');

        musicToggle.addEventListener('change', () => {
            toggleMusic();
            // Play a test sound when toggling on
            if (soundSettings.musicEnabled) {
                playSound(SOUND_EFFECTS.MENU_SELECT);
            }
        });

        musicVolume.addEventListener('input', (e) => {
            setMusicVolume(parseFloat(e.target.value));
        });

        soundToggle.addEventListener('change', () => {
            toggleSound();
            // Play a test sound when toggling on
            if (soundSettings.soundEnabled) {
                playSound(SOUND_EFFECTS.MENU_SELECT);
            }
        });

        soundVolume.addEventListener('input', (e) => {
            setSoundVolume(parseFloat(e.target.value));
            // Play a test sound when adjusting volume
            playSound(SOUND_EFFECTS.MENU_NAVIGATE);
        });

        return container;
    }

    // Export sound system functions
    exports.sound = {
        initialize,
        playSound,
        playMusic,
        stopMusic,
        toggleMusic,
        toggleSound,
        setMusicVolume,
        setSoundVolume,
        getSettings,
        createSoundSettingsUI,
        startMusicPlaylist,
        playNextTrack,
        playPreviousTrack,
        getCurrentTrackInfo,
        SOUND_EFFECTS
    };

})(window.TarotTetris = window.TarotTetris || {});
