// Fragments of Sandra - Interactive Comic Engine

// Embedded Comic Data
const COMIC_DATA = {
  "title": "Fragments of Sandra",
  "description": "A glitching reality comic about loss and memory",
  "panels": [
    {
      "id": "panel_1",
      "number": 1,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel1a.webp",
          "dialogue": "I told you not to run across the street…",
          "caption": "Car accident memory - Sandra kneeling in acid rain beside crushed autonomous taxi",
          "imagePrompt": "Cyberpunk street at night under acid rain, a crushed autonomous taxi glowing with blue police drones, Sandra kneeling in the rain holding a small child's lifeless hand, eyes filled with shock, holographic police tape flickering, gritty cinematic lighting, dystopian neon signs"
        },
        {
          "reality": "B",
          "image": "img/panel1b.webp",
          "dialogue": "I told you to stop… I told you…",
          "caption": "Overdose memory - Sandra holding her child in dim apartment",
          "imagePrompt": "Dystopian apartment interior, dim flickering neon through window blinds, Sandra on the floor holding her child, syringe nearby, malfunctioning medical drone hovering confused, faint static distortions"
        }
      ]
    },
    {
      "id": "panel_2",
      "number": 2,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel2a.webp",
          "dialogue": "Cause of death: high-speed collision, impact at 94 km/h.",
          "speaker": "Nurse",
          "caption": "Hospital hallway with morgue sign",
          "imagePrompt": "Sandra in a hospital hallway, fluorescent lights flickering, holographic sign 'City Morgue →', android nurse watching her without blinking"
        },
        {
          "reality": "B",
          "image": "img/panel2b.webp",
          "dialogue": "Cause of death: synthetic opioid toxicity.",
          "speaker": "Nurse",
          "caption": "Same hallway but addiction recovery unit sign",
          "imagePrompt": "Same hospital hallway, but the holographic sign reads 'Addiction Recovery Unit', graffiti over walls, Sandra trembling"
        }
      ]
    },
    {
      "id": "panel_3",
      "number": 3,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel3a.webp",
          "dialogue": "He was only thirteen…",
          "caption": "Sandra looking at glitching holo-frame showing boy at 13",
          "imagePrompt": "Sandra alone at home, looking at a cracked holo-frame showing a smiling boy, glitching so the boy's face flickers between alive and lifeless, dystopian cyberpunk living room"
        },
        {
          "reality": "B",
          "image": "img/panel3b.webp",
          "dialogue": "He was only seventeen…",
          "caption": "Same scene but holo-frame shows him at 17",
          "imagePrompt": "Same scene, but the holo-frame shows him at seventeen, gaunt but smiling faintly"
        }
      ]
    },
    {
      "id": "panel_4",
      "number": 4,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel4a.webp",
          "dialogue": "Your safety is our priority.",
          "speaker": "Billboard AI",
          "caption": "Sandra walking past traffic safety billboard",
          "imagePrompt": "Sandra walking through crowded neon streets, huge billboard blaring AI public service announcement: 'Stay Safe. Trust the Traffic Grid.', pedestrians ignoring her"
        },
        {
          "reality": "B",
          "image": "img/panel4b.webp",
          "dialogue": "Your health is our priority.",
          "speaker": "Billboard AI",
          "caption": "Same street but substance registry billboard",
          "imagePrompt": "Same street, billboard says: 'Stay Clean. Trust the Substance Registry.', same pedestrians but slight clothing differences"
        }
      ]
    },
    {
      "id": "panel_5",
      "number": 5,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel5a.webp",
          "dialogue": "It wasn't the machine's fault…",
          "caption": "Sandra reading about taxi AI malfunction",
          "imagePrompt": "Sandra in her kitchen, table covered in newsprint, headline: 'Taxi AI Malfunction Kills Child', the letters melting into static"
        },
        {
          "reality": "B",
          "image": "img/panel5b.webp",
          "dialogue": "It wasn't his fault…",
          "caption": "Sandra reading about drug epidemic",
          "imagePrompt": "Sandra in same kitchen, headline: 'New Drug Wave Sweeps Youth', the text bleeding into binary code"
        }
      ]
    },
    {
      "id": "panel_6",
      "number": 6,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel6a.webp",
          "dialogue": "I keep hearing your voice…",
          "caption": "Graveyard visit - died at 13",
          "imagePrompt": "Sandra visiting a graveyard with neon-lit gravestones, hers reads: 'In Loving Memory – 2089–2102', rain making reflections ripple"
        },
        {
          "reality": "B",
          "image": "img/panel6b.webp",
          "dialogue": "I keep seeing your face…",
          "caption": "Same graveyard - died at 17",
          "imagePrompt": "Same graveyard, stone reads: 'In Loving Memory – 2085–2102', subtle glitch where numbers swap"
        }
      ]
    },
    {
      "id": "panel_7",
      "number": 7,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel7a.webp",
          "dialogue": "Ma'am, your memory appears… corrupted.",
          "speaker": "Technician",
          "caption": "Memory center showing car crash replays",
          "imagePrompt": "Sandra inside a government 'Memory Regulation Center', screens replaying the car crash over and over, but details keep changing slightly"
        },
        {
          "reality": "B",
          "image": "img/panel7b.webp",
          "dialogue": "Ma'am, your memory appears… edited.",
          "speaker": "Technician",
          "caption": "Same center showing overdose replays",
          "imagePrompt": "Same center, screens replay the overdose, but the drug changes in each replay"
        }
      ]
    },
    {
      "id": "panel_8",
      "number": 8,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel8a.webp",
          "dialogue": "I remember the sound of screeching brakes.",
          "caption": "Child's bedroom with toy car",
          "imagePrompt": "Sandra standing in her child's empty bedroom, bed neatly made, toy car on the shelf"
        },
        {
          "reality": "B",
          "image": "img/panel8b.webp",
          "dialogue": "I remember the sound of his heartbeat slowing.",
          "caption": "Same bedroom with pill bottle",
          "imagePrompt": "Same bedroom, bed messy, half-empty pill bottle on the desk"
        }
      ]
    },
    {
      "id": "panel_9",
      "number": 9,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel9a.webp",
          "dialogue": "He's still alive. I saw him.",
          "caption": "Sandra running through crowd seeing child's face",
          "imagePrompt": "Sandra running through a crowd, faces glitching between strangers and her child"
        },
        {
          "reality": "B",
          "image": "img/panel9b.webp",
          "dialogue": "He's still alive. I felt him.",
          "caption": "Same crowd but with dilated pupils",
          "imagePrompt": "Same crowd, but everyone's pupils are dilated unnaturally, her child's face flickering in random people"
        }
      ]
    },
    {
      "id": "panel_10",
      "number": 10,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel10a.webp",
          "dialogue": "Show me what really happened.",
          "caption": "Hacking AI core - crash holograms",
          "imagePrompt": "Sandra hacking into a massive city AI core, code streaming, holograms of the crash looping"
        },
        {
          "reality": "B",
          "image": "img/panel10b.webp",
          "dialogue": "Show me what really happened.",
          "caption": "Same AI core - overdose holograms",
          "imagePrompt": "Same AI core, but holograms of him injecting a needle looping"
        }
      ]
    },
    {
      "id": "panel_11",
      "number": 11,
      "variants": [
        {
          "reality": "A",
          "image": "img/panel11a.webp",
          "dialogue": "Multiple outcomes detected. Memory integrity compromised.",
          "speaker": "AI",
          "caption": "Reality tearing - both crash and overdose visible",
          "imagePrompt": "Sandra sees both the crash and the overdose overlaid, reality tearing, her screaming"
        },
        {
          "reality": "B",
          "image": "img/panel11b.webp",
          "dialogue": "Multiple outcomes detected. Identity integrity compromised.",
          "speaker": "AI",
          "caption": "Same but Sandra's face glitches between ages",
          "imagePrompt": "Same image, but more distorted — Sandra's own face glitches between young and old"
        }
      ]
    },
    {
      "id": "panel_12",
      "number": 12,
      "variants": [
        {
          "reality": "SHARED",
          "image": "img/panel12.webp",
          "dialogue": "Which one is real?",
          "speaker": "Null Vesper",
          "response": "…I don't remember anymore.",
          "responseBy": "Sandra",
          "caption": "Final ambiguous ending in white void",
          "imagePrompt": "Sandra holding her child's hand, standing in a blinding white void, their faces glitching rapidly between all past versions, city skyline fracturing in background"
        }
      ]
    }
  ]
};

class ComicEngine {
    constructor() {
        this.comicData = COMIC_DATA; // Use embedded data instead of loading from file
        this.currentPanelIndex = 0;
        this.storyState = []; // Tracks which variant is selected for each panel
        this.currentReality = 'A'; // Track current reality (A or B)
        this.isTransitioning = false;

        // DOM elements
        this.panelContainer = document.getElementById('panelContainer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.panelCounter = document.getElementById('panelCounter');
        this.realityIndicator = document.getElementById('realityIndicator');
        this.glitchOverlay = document.getElementById('glitchOverlay');

        this.init();
    }

    async init() {
        try {
            this.initializeStoryState();
            this.setupEventListeners();
            this.renderCurrentPanel();
        } catch (error) {
            console.error('Failed to initialize comic:', error);
            this.showError('Failed to load comic data');
        }
    }

    initializeStoryState() {
        // Initialize with a consistent reality (A or B) for all panels
        this.currentReality = Math.random() < 0.5 ? 'A' : 'B';

        this.storyState = this.comicData.panels.map(panel => {
            if (panel.variants.length === 1) {
                return 0; // Only one variant (like panel 12 - SHARED)
            }

            // Find the variant that matches current reality
            const variantIndex = panel.variants.findIndex(variant =>
                variant.reality === this.currentReality
            );

            // If reality variant found, use it; otherwise use first variant
            return variantIndex !== -1 ? variantIndex : 0;
        });
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.goToPrevious());
        this.nextBtn.addEventListener('click', () => this.goToNext());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;
            
            if (e.key === 'ArrowLeft' && !this.prevBtn.disabled) {
                this.goToPrevious();
            } else if (e.key === 'ArrowRight' && !this.nextBtn.disabled) {
                this.goToNext();
            }
        });
    }
    
    async goToPrevious() {
        if (this.currentPanelIndex <= 0 || this.isTransitioning) return;

        this.isTransitioning = true;

        // Trigger intense glitch effect for reality switching
        await this.triggerGlitchTransition(true);

        // Switch reality when going backward
        this.switchReality();

        this.currentPanelIndex--;
        this.renderCurrentPanel();
        this.updateNavigation();

        this.isTransitioning = false;
    }
    
    async goToNext() {
        if (this.currentPanelIndex >= this.comicData.panels.length - 1 || this.isTransitioning) return;

        this.isTransitioning = true;

        // Trigger tamer effect for forward navigation (staying in same reality)
        await this.triggerGlitchTransition(false);

        this.currentPanelIndex++;
        this.renderCurrentPanel();
        this.updateNavigation();

        this.isTransitioning = false;
    }
    
    switchReality() {
        // Switch between reality A and B
        this.currentReality = this.currentReality === 'A' ? 'B' : 'A';

        // Update story state to match new reality for all panels
        this.storyState = this.comicData.panels.map(panel => {
            if (panel.variants.length === 1) {
                return 0; // Only one variant (like panel 12 - SHARED)
            }

            // Find the variant that matches current reality
            const variantIndex = panel.variants.findIndex(variant =>
                variant.reality === this.currentReality
            );

            // If reality variant found, use it; otherwise use first variant
            return variantIndex !== -1 ? variantIndex : 0;
        });
    }

    async triggerGlitchTransition(isIntenseGlitch = false) {
        return new Promise(resolve => {
            // Add different classes for different intensity levels
            if (isIntenseGlitch) {
                this.glitchOverlay.classList.add('active', 'intense');
            } else {
                this.glitchOverlay.classList.add('active', 'tame');
            }

            // Different durations for different effects
            const duration = isIntenseGlitch ? 800 : 300;

            setTimeout(() => {
                this.glitchOverlay.classList.remove('active', 'intense', 'tame');
                resolve();
            }, duration);
        });
    }
    
    renderCurrentPanel() {
        const panel = this.comicData.panels[this.currentPanelIndex];
        const variantIndex = this.storyState[this.currentPanelIndex];
        const variant = panel.variants[variantIndex];
        
        // Clear previous content
        this.panelContainer.innerHTML = '';
        
        // Create panel element
        const panelElement = document.createElement('div');
        panelElement.className = 'panel glitch-in';
        
        // Create image element
        const imageElement = document.createElement('img');
        imageElement.className = 'panel-image';
        imageElement.src = variant.image;
        imageElement.alt = variant.caption || 'Comic panel';

        // Handle image load error with inprogress.webp fallback
        imageElement.onerror = () => {
            // First try the inprogress.webp fallback
            if (imageElement.src !== 'img/inprogress.webp') {
                imageElement.src = 'img/inprogress.webp';
            } else {
                // If inprogress.webp also fails, use generated placeholder
                imageElement.src = this.createPlaceholderImage(variant);
            }
        };
        
        panelElement.appendChild(imageElement);
        
        // Create text container for dialogue only
        if (variant.dialogue) {
            const textContainer = document.createElement('div');
            textContainer.className = 'panel-text';

            const dialogueElement = document.createElement('div');
            dialogueElement.className = 'panel-dialogue';

            let dialogueText = variant.dialogue;
            if (variant.speaker) {
                dialogueText = `${variant.speaker}: "${dialogueText}"`;
            }
            if (variant.response) {
                dialogueText += `\n\n${variant.responseBy}: "${variant.response}"`;
            }

            dialogueElement.textContent = dialogueText;
            textContainer.appendChild(dialogueElement);
            panelElement.appendChild(textContainer);
        }

        // Create hover caption for image
        if (variant.caption) {
            const captionElement = document.createElement('div');
            captionElement.className = 'panel-caption-hover';
            captionElement.textContent = variant.caption;
            captionElement.style.display = 'none'; // Hidden by default

            // Add hover events to image
            imageElement.addEventListener('mouseenter', () => {
                captionElement.style.display = 'block';
            });

            imageElement.addEventListener('mouseleave', () => {
                captionElement.style.display = 'none';
            });

            panelElement.appendChild(captionElement);
        }
        
        this.panelContainer.appendChild(panelElement);
        
        // Update UI indicators
        this.updatePanelInfo(panel, variant);
    }
    
    createPlaceholderImage(variant) {
        // Create a data URL for a placeholder image with text
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Dark cyberpunk background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Neon border
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('IMAGE NOT FOUND', canvas.width / 2, canvas.height / 2 - 60);

        ctx.font = '16px Rajdhani, sans-serif';
        ctx.fillStyle = '#ff0080';
        ctx.fillText('Missing: ' + variant.image, canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = '14px Rajdhani, sans-serif';
        ctx.fillStyle = '#cccccc';
        const lines = this.wrapText(ctx, variant.caption || 'Panel description unavailable', canvas.width - 40);
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 20 + (index * 20));
        });
        
        return canvas.toDataURL();
    }
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    updatePanelInfo(panel, variant) {
        this.panelCounter.textContent = `Panel ${panel.number} of ${this.comicData.panels.length}`;
        
        let realityText = 'Reality: ';
        if (variant.reality === 'SHARED') {
            realityText += 'Convergence';
        } else if (variant.reality) {
            realityText += variant.reality;
        } else {
            realityText += '?';
        }
        this.realityIndicator.textContent = realityText;
    }
    
    updateNavigation() {
        // Update previous button
        this.prevBtn.disabled = this.currentPanelIndex <= 0;
        
        // Update next button
        this.nextBtn.disabled = this.currentPanelIndex >= this.comicData.panels.length - 1;
        
        // Update button text based on context
        if (this.currentPanelIndex >= this.comicData.panels.length - 1) {
            this.nextBtn.querySelector('.btn-text').textContent = 'End';
            this.nextBtn.querySelector('.btn-subtext').textContent = 'Story Complete';
        } else {
            this.nextBtn.querySelector('.btn-text').textContent = 'Next';
            this.nextBtn.querySelector('.btn-subtext').textContent = 'Continue';
        }
    }
    
    showError(message) {
        this.panelContainer.innerHTML = `
            <div class="panel">
                <div class="panel-text">
                    <div class="panel-dialogue" style="color: #ff0080;">
                        Error: ${message}
                    </div>
                    <div class="panel-caption">
                        Please check that all files are in the correct location.
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the comic when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ComicEngine();
});
