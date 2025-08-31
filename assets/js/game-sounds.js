/**
 * Game Sound Utility
 * 
 * A reusable sound system for games using Web Audio API oscillators.
 * Based on neon-simon's sound implementation.
 * Integrates with the main page SFX toggle system.
 */

(function(window) {
    'use strict';

    // Audio context and settings
    let audioContext = null;
    let isInitialized = false;

    /**
     * Initialize the audio system
     */
    function initAudio() {
        if (isInitialized) return true;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            isInitialized = true;
            return true;
        } catch (e) {
            console.log('Audio not supported');
            return false;
        }
    }

    /**
     * Check if sound is enabled from main page SFX setting
     */
    function isSoundEnabled() {
        const sfxEnabled = localStorage.getItem('sfxEnabled');
        return sfxEnabled === 'true';
    }

    /**
     * Play a tone using Web Audio API oscillator
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in milliseconds (default: 300)
     * @param {string} type - Oscillator type: 'sine', 'square', 'sawtooth', 'triangle' (default: 'square')
     * @param {number} volume - Volume level 0-1 (default: 0.3)
     */
    function playTone(frequency, duration = 300, type = 'square', volume = 0.3) {
        if (!isSoundEnabled() || !audioContext) return;
        
        // Resume audio context if suspended (autoplay policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.warn('Failed to play tone:', e);
        }
    }

    /**
     * Predefined sound effects for common game events
     */
    const SoundEffects = {
        // Basic UI sounds
        MENU_SELECT: () => playTone(800, 150, 'square', 0.3),
        MENU_NAVIGATE: () => playTone(600, 100, 'square', 0.2),
        BUTTON_CLICK: () => playTone(1000, 80, 'square', 0.25),
        
        // Game action sounds
        COLLECT_ITEM: () => playTone(880, 200, 'sine', 0.3),
        POWER_UP: () => {
            // Ascending tone sequence
            playTone(440, 100, 'sine', 0.3);
            setTimeout(() => playTone(550, 100, 'sine', 0.3), 100);
            setTimeout(() => playTone(660, 150, 'sine', 0.3), 200);
        },
        SCORE_POINT: () => playTone(523, 150, 'sine', 0.3), // C5
        
        // Game state sounds
        GAME_START: () => {
            // Rising pitch sequence
            playTone(261, 100, 'square', 0.2); // C4
            setTimeout(() => playTone(330, 100, 'square', 0.2), 100); // E4
            setTimeout(() => playTone(392, 200, 'square', 0.3), 200); // G4
        },
        GAME_OVER: () => {
            // Descending sequence
            playTone(392, 200, 'sawtooth', 0.3); // G4
            setTimeout(() => playTone(330, 200, 'sawtooth', 0.3), 200); // E4
            setTimeout(() => playTone(261, 400, 'sawtooth', 0.3), 400); // C4
        },
        LEVEL_UP: () => {
            // Victory fanfare
            playTone(523, 150, 'square', 0.3); // C5
            setTimeout(() => playTone(659, 150, 'square', 0.3), 150); // E5
            setTimeout(() => playTone(784, 300, 'square', 0.3), 300); // G5
        },
        
        // Impact/collision sounds
        HIT: () => playTone(150, 100, 'sawtooth', 0.4),
        BOUNCE: () => playTone(200, 80, 'triangle', 0.3),
        BREAK: () => playTone(300, 150, 'square', 0.35),
        
        // Movement sounds
        MOVE: () => playTone(400, 50, 'triangle', 0.15),
        JUMP: () => playTone(500, 120, 'sine', 0.25),
        
        // Special effects
        SUCCESS: () => {
            // Happy chord progression
            playTone(523, 200, 'sine', 0.2); // C5
            setTimeout(() => playTone(659, 200, 'sine', 0.2), 50); // E5
            setTimeout(() => playTone(784, 300, 'sine', 0.2), 100); // G5
        },
        ERROR: () => playTone(150, 300, 'sawtooth', 0.4),
        
        // Simon-style tones (matching neon-simon frequencies)
        SIMON_RED: () => playTone(329.63, 200, 'square', 0.3),
        SIMON_BLUE: () => playTone(261.63, 200, 'square', 0.3),
        SIMON_YELLOW: () => playTone(349.23, 200, 'square', 0.3),
        SIMON_GREEN: () => playTone(392.00, 200, 'square', 0.3)
    };

    /**
     * Initialize audio on first user interaction
     * Call this function on user input (click, keypress, etc.)
     */
    function enableAudio() {
        initAudio();
    }

    // Expose the API
    window.GameSounds = {
        playTone: playTone,
        sounds: SoundEffects,
        enableAudio: enableAudio,
        isEnabled: isSoundEnabled,
        isInitialized: () => isInitialized
    };

})(window);