/**
 * Moon Calendar System for Daughters of Zion
 * Calculates current moon phase and provides liturgical guidance
 */

class MoonCalendar {
    constructor() {
        this.phaseData = {
            new: {
                name: "New Moon — The Veiled Phase",
                motto: "In darkness we listen.",
                color: "Black or deep indigo",
                element: "Dust",
                gesture: "Lowered palm",
                theme: "Silence, introspection, hidden beginnings",
                guidance: `
                    <h3>Primary Rite: The Rite of Listening</h3>
                    <p>This is the time to gather with no lamps, only starlight. Stand alone facing the East and take three breaths:</p>
                    <ul>
                        <li>Breath of entering</li>
                        <li>Breath of emptying</li>
                        <li>Breath of waiting</li>
                    </ul>
                    <p class="invocation">"Let the hidden speak beneath the noise."</p>
                    <p>Open your palms toward the earth and listen for whatever rises—emotion, memory, intuition, or Name.</p>
                    
                    <h3>Social Rule of This Phase</h3>
                    <p><strong>No major decisions. No oaths. No confrontations.</strong></p>
                    <p>This phase requires stillness. The wise do not move during the hidden phase.</p>
                    
                    <h3>Additional Practices</h3>
                    <ul>
                        <li><strong>The Rite of Forgetting:</strong> Write a fear, false name, or unwanted memory on paper. Bury it secretly before the crescent appears.</li>
                        <li><strong>Dance of Dust:</strong> Perform barefoot with small, grounded, circular steps.</li>
                    </ul>
                `,
                icon: "🌑"
            },
            waxing: {
                name: "Waxing Moon — The Ascending Phase",
                motto: "Let strength gather.",
                color: "Blue or silver",
                element: "Water",
                gesture: "Right hand over heart",
                theme: "Growth, intention, clarity, strengthening",
                guidance: `
                    <h3>Primary Rite: The Rite of Naming Intention</h3>
                    <p>State aloud a single intention for the month:</p>
                    <ul>
                        <li>Something to build</li>
                        <li>Something to heal</li>
                        <li>Something to learn</li>
                        <li>Or something to free yourself from</li>
                    </ul>
                    <p>Stand with bare feet shoulder-width apart, symbolizing stability.</p>
                    <p class="invocation">"Let your path become your teacher."</p>
                    
                    <h3>Social Rule of This Phase</h3>
                    <p><strong>Begin tasks. Repair relationships. Speak truth gently.</strong></p>
                    <p>This is the time to move outward, but with caution.</p>
                    
                    <h3>Additional Practices</h3>
                    <ul>
                        <li><strong>The Water-Cleansing Rite:</strong> Dip two fingers in clean water and touch your forehead for clarity.</li>
                        <li><strong>The Three Questions:</strong> Reflect privately on: What truth am I avoiding? What strength am I refusing? What gift am I withholding?</li>
                        <li><strong>Dance of Water:</strong> Move with arms sweeping like waves, feet tracing crescent shapes.</li>
                    </ul>
                `,
                icon: "🌒"
            },
            full: {
                name: "Full Moon — The Revealing Phase",
                motto: "What is hidden becomes seen.",
                color: "White or gold",
                element: "Light",
                gesture: "Raised palm",
                theme: "Revelation, prophecy, joy, clarity, community, embodiment",
                guidance: `
                    <h3>Primary Rite: The Rite of Illumination</h3>
                    <p>Form the Circle of Seven (whether seven women are present or not). Light lamps at cardinal directions.</p>
                    <p class="invocation">"By this light we see what we could not see."</p>
                    <p>This is the <strong>only</strong> phase in which personal revelation is shared aloud. Speak what you have learned, realized, uncovered, or healed.</p>
                    
                    <h3>Social Rule of This Phase</h3>
                    <p><strong>Speak openly. Act bravely. Celebrate fully.</strong></p>
                    <p>Restraint during the full moon is considered a spiritual mistake.</p>
                    
                    <h3>Additional Practices</h3>
                    <ul>
                        <li><strong>Dance of Light:</strong> The highlight of the lunar month. Rise arms as if lifting a lamp, make a full circle, hold motionless radiance, then spiral exit.</li>
                        <li><strong>The Rite of the Open Mirror:</strong> Meet your own gaze in a mirror until your breath synchronizes with your reflection.</li>
                        <li><strong>The Feast of Fullness:</strong> Share food—figs, dates, wine, barley bread, honey. No one eats alone during this phase.</li>
                    </ul>
                `,
                icon: "🌕"
            },
            waning: {
                name: "Waning Moon — The Returning Phase",
                motto: "Release what must return to dust.",
                color: "Brown or grey",
                element: "Ash",
                gesture: "Palm over the belly",
                theme: "Letting go, introspection, endings, rebalancing, preparation",
                guidance: `
                    <h3>Primary Rite: The Rite of Unmaking</h3>
                    <p>Review your intention from the waxing moon:</p>
                    <ul>
                        <li>If fulfilled: burn the written intention in a clay bowl and bury the ashes</li>
                        <li>If unfinished: tear it into seven strips and release them into wind or flowing water</li>
                    </ul>
                    <p>Both are acceptable. The Order never shames incomplete intentions.</p>
                    <p class="invocation">"Nothing is wasted. Nothing is lost. Everything returns."</p>
                    
                    <h3>Social Rule of This Phase</h3>
                    <p><strong>Do not begin new work. Do not confront. Do not reveal. Do not swear oaths.</strong></p>
                    <p>This is the time to withdraw and prepare for the coming Veiled Phase.</p>
                    
                    <h3>Additional Practices</h3>
                    <ul>
                        <li><strong>Dance of Ash:</strong> Slow clockwise turning, fingers touching forehead → heart → earth, with low humming.</li>
                        <li><strong>The Rite of Memory:</strong> Choose a single memory from the month to keep. Press your palm to the earth and whisper it.</li>
                        <li><strong>The Rite of the Closed Door:</strong> Mark a line of ash on the ground, step over it, then wipe it away with your foot.</li>
                    </ul>
                `,
                icon: "🌘"
            }
        };
        
        this.init();
    }

    init() {
        this.calculateMoonPhase();

        // Only update display if we're on the moon calendar page
        if (document.getElementById('currentPhase')) {
            this.updateDisplay();
            this.highlightCurrentPhase();

            // Update every hour
            setInterval(() => {
                this.calculateMoonPhase();
                this.updateDisplay();
            }, 3600000);
        }
    }

    calculateMoonPhase() {
        const now = new Date();

        // Known new moon reference point (January 11, 2024)
        const knownNewMoon = new Date('2024-01-11T11:57:00Z');
        const lunarCycle = 29.53058867; // days

        // Calculate days since known new moon
        const daysSinceNew = (now - knownNewMoon) / (1000 * 60 * 60 * 24);

        // Calculate current position in lunar cycle
        this.moonAge = daysSinceNew % lunarCycle;

        // Calculate illumination percentage
        this.illumination = (1 - Math.cos(2 * Math.PI * this.moonAge / lunarCycle)) / 2;

        // Determine phase
        if (this.moonAge < 1.84566) {
            this.currentPhase = 'new';
            this.phaseName = 'New Moon';
        } else if (this.moonAge < 7.38264) {
            this.currentPhase = 'waxing';
            this.phaseName = 'Waxing Crescent';
        } else if (this.moonAge < 9.22830) {
            this.currentPhase = 'waxing';
            this.phaseName = 'First Quarter';
        } else if (this.moonAge < 14.76529) {
            this.currentPhase = 'waxing';
            this.phaseName = 'Waxing Gibbous';
        } else if (this.moonAge < 16.61095) {
            this.currentPhase = 'full';
            this.phaseName = 'Full Moon';
        } else if (this.moonAge < 22.14794) {
            this.currentPhase = 'waning';
            this.phaseName = 'Waning Gibbous';
        } else if (this.moonAge < 23.99360) {
            this.currentPhase = 'waning';
            this.phaseName = 'Last Quarter';
        } else if (this.moonAge < 29.53059) {
            this.currentPhase = 'waning';
            this.phaseName = 'Waning Crescent';
        } else {
            this.currentPhase = 'new';
            this.phaseName = 'New Moon';
        }
    }

    updateDisplay() {
        const phaseInfo = this.phaseData[this.currentPhase];

        // Update phase name
        document.getElementById('currentPhase').textContent = phaseInfo.name;

        // Update date and moon info
        const now = new Date();
        document.getElementById('moonDate').textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('moonIllumination').textContent =
            `Illumination: ${(this.illumination * 100).toFixed(1)}%`;

        document.getElementById('moonAge').textContent =
            `Moon Age: ${this.moonAge.toFixed(1)} days`;

        // Update moon visual
        this.updateMoonVisual();

        // Update guidance content
        document.getElementById('guidanceContent').innerHTML = phaseInfo.guidance;
    }

    updateMoonVisual() {
        const moonCircle = document.getElementById('moonCircle');
        const illumination = this.illumination;

        // Create moon phase visual using CSS
        if (this.currentPhase === 'new') {
            moonCircle.style.background = 'radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%)';
        } else if (this.currentPhase === 'full') {
            moonCircle.style.background = 'radial-gradient(circle, #f5f5dc 0%, #e8e8d0 100%)';
        } else if (this.currentPhase === 'waxing') {
            const gradientPos = 50 + (illumination - 0.5) * 100;
            moonCircle.style.background = `linear-gradient(90deg,
                #f5f5dc 0%,
                #f5f5dc ${gradientPos}%,
                #1a1a2e ${gradientPos}%,
                #1a1a2e 100%)`;
        } else { // waning
            const gradientPos = 50 - (illumination - 0.5) * 100;
            moonCircle.style.background = `linear-gradient(90deg,
                #1a1a2e 0%,
                #1a1a2e ${gradientPos}%,
                #f5f5dc ${gradientPos}%,
                #f5f5dc 100%)`;
        }
    }

    highlightCurrentPhase() {
        // Highlight the current phase card
        const cards = document.querySelectorAll('.phase-card');
        cards.forEach(card => {
            if (card.dataset.phase === this.currentPhase) {
                card.classList.add('active-phase');
            }
        });
    }
}

// Initialize when DOM is ready - only on moon calendar page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('currentPhase')) {
        new MoonCalendar();
    }
});

