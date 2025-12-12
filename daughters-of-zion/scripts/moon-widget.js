/**
 * Moon Widget for Homepage
 * Displays current moon phase prominently on the main page
 */

class MoonWidget {
    constructor() {
        this.phaseGuidance = {
            new: {
                motto: "In darkness we listen.",
                brief: "This is the Veiled Phase—a time for silence, introspection, and hidden beginnings. No major decisions should be made. Practice the Rite of Listening and embrace stillness."
            },
            waxing: {
                motto: "Let strength gather.",
                brief: "This is the Ascending Phase—a time for growth, intention, and clarity. Begin tasks, repair relationships, and speak truth gently. State your intention for this lunar cycle."
            },
            full: {
                motto: "What is hidden becomes seen.",
                brief: "This is the Revealing Phase—a time for revelation, celebration, and community. Speak openly, act bravely, and celebrate fully. Share your revelations and feast with others."
            },
            waning: {
                motto: "Release what must return to dust.",
                brief: "This is the Returning Phase—a time for letting go and preparation. Do not begin new work. Review your intentions, release what is complete, and prepare for the coming silence."
            }
        };
        
        this.init();
    }

    init() {
        // Wait for MoonCalendar to be initialized
        if (typeof MoonCalendar !== 'undefined') {
            this.moonCalendar = new MoonCalendar();
            this.updateWidget();
            
            // Update every hour
            setInterval(() => {
                this.moonCalendar.calculateMoonPhase();
                this.updateWidget();
            }, 3600000);
        } else {
            console.warn('MoonCalendar class not found. Moon widget will not function.');
        }
    }

    updateWidget() {
        if (!this.moonCalendar) return;

        const phase = this.moonCalendar.currentPhase;
        const phaseData = this.moonCalendar.phaseData[phase];
        const guidance = this.phaseGuidance[phase];

        // Update phase name
        const phaseNameEl = document.getElementById('homePagePhaseName');
        if (phaseNameEl) {
            phaseNameEl.textContent = this.moonCalendar.phaseName;
        }

        // Update motto
        const mottoEl = document.getElementById('homePageMotto');
        if (mottoEl) {
            mottoEl.textContent = `"${guidance.motto}"`;
        }

        // Update date
        const dateEl = document.getElementById('homePageDate');
        if (dateEl) {
            const now = new Date();
            const illumination = (this.moonCalendar.illumination * 100).toFixed(1);
            const age = this.moonCalendar.moonAge.toFixed(1);
            dateEl.innerHTML = `
                ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                <br>
                <small>Illumination: ${illumination}% • Moon Age: ${age} days</small>
            `;
        }

        // Update guidance
        const guidanceEl = document.getElementById('homePageGuidance');
        if (guidanceEl) {
            guidanceEl.innerHTML = `
                <p><strong>${phaseData.element}</strong> • <strong>${phaseData.color}</strong></p>
                <p>${guidance.brief}</p>
            `;
        }

        // Update moon visual
        this.updateMoonVisual();
    }

    updateMoonVisual() {
        if (!this.moonCalendar) return;

        const moonCircle = document.getElementById('homePageMoonCircle');
        if (!moonCircle) return;

        const illumination = this.moonCalendar.illumination;
        const phase = this.moonCalendar.currentPhase;

        // Create moon phase visual using CSS
        if (phase === 'new') {
            moonCircle.style.background = 'radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%)';
        } else if (phase === 'full') {
            moonCircle.style.background = 'radial-gradient(circle, #f5f5dc 0%, #e8e8d0 100%)';
        } else if (phase === 'waxing') {
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the homepage
    if (document.getElementById('homePageMoonCircle')) {
        new MoonWidget();
    }
});

