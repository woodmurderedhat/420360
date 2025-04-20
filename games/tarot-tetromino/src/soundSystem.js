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
        [SOUND_EFFECTS.PIECE_MOVE]: 'Clap.wav',
        [SOUND_EFFECTS.PIECE_ROTATE]: 'Clap.wav',
        [SOUND_EFFECTS.PIECE_DROP]: 'Clap.wav',
        [SOUND_EFFECTS.PIECE_LOCK]: 'Clap.wav',
        [SOUND_EFFECTS.PIECE_HOLD]: 'Clap.wav',
        [SOUND_EFFECTS.LINE_CLEAR]: 'Clap.wav',
        [SOUND_EFFECTS.LEVEL_UP]: 'Clap.wav',
        [SOUND_EFFECTS.GAME_OVER]: 'Clap.wav',
        [SOUND_EFFECTS.TAROT_CARD_PLAY]: 'Clap.wav',
        [SOUND_EFFECTS.TAROT_CARD_DRAW]: 'Clap.wav',
        [SOUND_EFFECTS.MENU_SELECT]: 'Clap.wav',
        [SOUND_EFFECTS.MENU_NAVIGATE]: 'Clap.wav',
        [SOUND_EFFECTS.SHOP_PURCHASE]: 'Clap.wav',
        [SOUND_EFFECTS.SHOP_UPGRADE]: 'Clap.wav',
        [SOUND_EFFECTS.TETRIMINO_UNLOCK]: 'Clap.wav'
    };

    /**
     * Initialize the sound system
     */
    function initialize() {
        // Load settings from local storage
        loadSettings();

        console.log('Sound system initialized in silent mode - no sound files available');

        // Load available sounds and music (which will be empty)
        loadSoundFiles();
        loadMusicFiles();

        // We're not setting up event listeners since sound is disabled
        // This prevents unnecessary error messages in the console
    }

    /**
     * Load sound files from the assets/sounds directory
     */
    function loadSoundFiles() {
        // Currently no sound files are available
        // This function is intentionally left empty to prevent errors
        console.log('Sound system disabled - no sound files available');
    }

    /**
     * Load music files from the assets/music directory
     * and also include music files from assets/sounds if needed
     */
    function loadMusicFiles() {
        // Currently no music files are available
        // This function is intentionally left empty to prevent errors
        musicPlaylist.tracks = [];
        musicPlaylist.currentIndex = 0;

        console.log('Music system disabled - no music files available');
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
        // Sound system is disabled - no event listeners needed
        // This function is intentionally left empty to prevent errors
        console.log('Sound event listeners disabled - no sound files available');
    }

    /**
     * Play a sound effect
     * @param {string} soundId - The ID of the sound effect to play
     * @param {number} volume - Optional volume override (0-1)
     */
    function playSound(soundId, volume) {
        // Sound system is disabled - no sound files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Start playing the music playlist
     */
    function startMusicPlaylist() {
        // Music system is disabled - no music files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Play the current track in the playlist
     */
    function playCurrentTrack() {
        // Music system is disabled - no music files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Play the next track in the playlist
     */
    function playNextTrack() {
        // Music system is disabled - no music files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Play the previous track in the playlist
     */
    function playPreviousTrack() {
        // Music system is disabled - no music files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Play background music (legacy method, now uses playlist)
     * @param {string} musicPath - The path to the music file
     * @param {boolean} loop - Whether to loop the music (default: true)
     */
    function playMusic(musicPath, loop = true) {
        // Music system is disabled - no music files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Stop the currently playing music
     */
    function stopMusic() {
        // Music system is disabled - no music files available
        // This is a no-op function to prevent errors
        return;
    }

    /**
     * Toggle music on/off
     * @returns {boolean} The new music enabled state
     */
    function toggleMusic() {
        soundSettings.musicEnabled = !soundSettings.musicEnabled;
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
        saveSettings();
    }

    /**
     * Get the current music track information
     * @returns {Object} Information about the current track
     */
    function getCurrentTrackInfo() {
        // Music system is disabled - no tracks available
        return { index: -1, path: null, total: 0 };
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
