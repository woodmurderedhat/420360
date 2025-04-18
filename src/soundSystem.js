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

    // Sound file paths - using actual sound files from assets/sounds directory
    const SOUND_PATHS = {
        [SOUND_EFFECTS.PIECE_MOVE]: 'assets/sounds/Clap02.wav',
        [SOUND_EFFECTS.PIECE_ROTATE]: 'assets/sounds/Clap03.wav',
        [SOUND_EFFECTS.PIECE_DROP]: 'assets/sounds/Clap04.wav',
        [SOUND_EFFECTS.PIECE_LOCK]: 'assets/sounds/Clap05.wav',
        [SOUND_EFFECTS.PIECE_HOLD]: 'assets/sounds/Clap06.wav',
        [SOUND_EFFECTS.LINE_CLEAR]: 'assets/sounds/Clap02.wav',
        [SOUND_EFFECTS.LEVEL_UP]: 'assets/sounds/Clap03.wav',
        [SOUND_EFFECTS.GAME_OVER]: 'assets/sounds/Clap04.wav',
        [SOUND_EFFECTS.TAROT_CARD_PLAY]: 'assets/sounds/Clap05.wav',
        [SOUND_EFFECTS.TAROT_CARD_DRAW]: 'assets/sounds/Clap06.wav',
        [SOUND_EFFECTS.MENU_SELECT]: 'assets/sounds/Clap02.wav',
        [SOUND_EFFECTS.MENU_NAVIGATE]: 'assets/sounds/Clap03.wav',
        [SOUND_EFFECTS.SHOP_PURCHASE]: 'assets/sounds/Clap04.wav',
        [SOUND_EFFECTS.SHOP_UPGRADE]: 'assets/sounds/Clap05.wav',
        [SOUND_EFFECTS.TETRIMINO_UNLOCK]: 'assets/sounds/Clap06.wav'
    };

    // Music tracks - using actual music files from assets/music directory
    const MUSIC_TRACKS = {
        MAIN_THEME: 'assets/music/BreakBeat_Slice01.wav',
        GAME_PLAY: 'assets/music/BreakBeat_Slice02.wav',
        GAME_OVER: 'assets/music/BreakBeat_Slice03.wav',
        LEVEL_UP: 'assets/music/BreakBeat_Slice04.wav'
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
        audioElements.music.loop = true;
        audioElements.music.volume = soundSettings.musicVolume;

        // Set up event listeners
        setupEventListeners();

        // Create placeholder elements for sound effects
        // We'll create actual audio elements on demand to save resources
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
                // Start with main theme music
                playMusic(MUSIC_TRACKS.MAIN_THEME);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_STARTED, () => {
                playMusic(MUSIC_TRACKS.GAME_PLAY);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_PAUSED, () => {
                // Play a pause sound
                playSound(SOUND_EFFECTS.MENU_SELECT);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_RESUMED, () => {
                // Play a resume sound
                playSound(SOUND_EFFECTS.MENU_SELECT);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.GAME_OVER, () => {
                playSound(SOUND_EFFECTS.GAME_OVER);
                playMusic(MUSIC_TRACKS.GAME_OVER, false);
            });

            TarotTetris.events.on(TarotTetris.EVENTS.LEVEL_UP, () => {
                playSound(SOUND_EFFECTS.LEVEL_UP);
                // Briefly play level up music, then return to game play
                const currentMusic = audioElements.music.src;
                playMusic(MUSIC_TRACKS.LEVEL_UP, false);
                setTimeout(() => {
                    playMusic(currentMusic);
                }, 3000);
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
                if (data.overlayType === 'pause') {
                    // Pause music when pause overlay is shown
                    if (audioElements.music) {
                        audioElements.music.pause();
                    }
                }
            });

            TarotTetris.events.on(TarotTetris.EVENTS.UI_OVERLAY_HIDDEN, (data) => {
                if (data.overlayType === 'pause') {
                    // Resume music when pause overlay is hidden
                    if (audioElements.music && !audioElements.music.ended && soundSettings.musicEnabled) {
                        audioElements.music.play().catch(e => console.warn('Could not play audio:', e));
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

        // Create or reuse audio element
        let audio = audioElements.effects[soundId];
        if (!audio) {
            audio = new Audio(soundPath);
            audioElements.effects[soundId] = audio;
        } else {
            // Reset the audio to play from the beginning
            audio.currentTime = 0;
        }

        // Set volume and play
        audio.volume = soundVolume;
        audio.play().catch(e => console.warn('Could not play audio:', e));
    }

    /**
     * Play background music
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
    }

    /**
     * Stop the currently playing music
     */
    function stopMusic() {
        if (audioElements.music) {
            audioElements.music.pause();
            audioElements.music.currentTime = 0;
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
            if (audioElements.music && audioElements.music.src) {
                audioElements.music.play().catch(e => console.warn('Could not play audio:', e));
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
        SOUND_EFFECTS,
        MUSIC_TRACKS
    };

})(window.TarotTetris = window.TarotTetris || {});
