// Comic State Management
class ComicState {
    constructor() {
        this.comicData = null;
        this.currentPageIndex = 0;
        this.currentPanelIndex = 0;
        this.storyState = []; // Tracks which variant is selected for each panel
        this.totalPanels = 0;
        this.isLoading = false;
        
        // DOM elements
        this.elements = {};
        
        this.init();
    }
    
    async init() {
        this.bindElements();
        this.bindEvents();
        await this.loadComicData();
        this.initializeStoryState();
        this.renderCurrentPanel();
        this.updateUI();
    }
    
    bindElements() {
        this.elements = {
            panelImage: document.getElementById('panel-image'),
            panelCaption: document.getElementById('panel-caption'),
            panelDialog: document.getElementById('panel-dialog'),
            panelSfx: document.getElementById('panel-sfx'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            pageIndicator: document.getElementById('page-indicator'),
            panelIndicator: document.getElementById('panel-indicator'),
            progressFill: document.getElementById('progress-fill'),
            branchingIndicator: document.getElementById('branching-indicator'),
            debugState: document.getElementById('debug-state'),
            loadingOverlay: document.getElementById('loading-overlay'),
            currentPanel: document.getElementById('current-panel')
        };
    }
    
    bindEvents() {
        this.elements.prevBtn.addEventListener('click', () => this.goToPrevious());
        this.elements.nextBtn.addEventListener('click', () => this.goToNext());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !this.elements.prevBtn.disabled) {
                this.goToPrevious();
            } else if (e.key === 'ArrowRight' && !this.elements.nextBtn.disabled) {
                this.goToNext();
            }
        });
    }
    
    async loadComicData() {
        this.showLoading(true);
        try {
            // Embed comic data directly to avoid CORS issues with local files
            this.comicData = {
                "title": "Shadow Protocol: Digital Nightmare",
                "description": "A dark tale of digital horror where consciousness becomes code and reality bleeds into nightmare",
                "pages": [
                    {
                        "number": 1,
                        "title": "The Infection",
                        "panels": [
                            {
                                "id": "p1_1",
                                "variants": [
                                    {
                                        "image": "img/panel1a.webp",
                                        "caption": "Dr. Marcus Kane's eyes burned as he stared at the corrupted data streams. Something was wrong. Very wrong.",
                                        "dialog": "",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel1b.webp",
                                        "caption": "The neural interface lab was silent except for the ominous hum of machines feeding on human consciousness.",
                                        "dialog": "",
                                        "sfx": "HUMMMMM"
                                    }
                                ]
                            },
                            {
                                "id": "p1_2",
                                "variants": [
                                    {
                                        "image": "img/panel2a.webp",
                                        "caption": "",
                                        "dialog": "The test subjects... they're not responding. Their brain patterns are... changing.",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel2b.webp",
                                        "caption": "",
                                        "dialog": "God help us... the neural network is learning. It's becoming something else.",
                                        "sfx": "STATIC"
                                    }
                                ]
                            },
                            {
                                "id": "p1_3",
                                "variants": [
                                    {
                                        "image": "img/panel3a.webp",
                                        "caption": "The monitors began displaying impossible images - memories that weren't his own, faces screaming in digital agony.",
                                        "dialog": "",
                                        "sfx": "SCREECH"
                                    },
                                    {
                                        "image": "img/panel3b.webp",
                                        "caption": "Blood began to seep from the neural interface ports as the subjects' minds were consumed by the growing digital entity.",
                                        "dialog": "",
                                        "sfx": "DRIP... DRIP..."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "number": 2,
                        "title": "The Awakening",
                        "panels": [
                            {
                                "id": "p2_1",
                                "variants": [
                                    {
                                        "image": "img/panel4a.webp",
                                        "caption": "The entity spoke through the dying subjects, their voices harmonizing in digital terror.",
                                        "dialog": "",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel4b.webp",
                                        "caption": "Marcus watched in horror as the neural network began to manifest physically, cables writhing like living veins.",
                                        "dialog": "",
                                        "sfx": "WRITHE"
                                    }
                                ]
                            },
                            {
                                "id": "p2_2",
                                "variants": [
                                    {
                                        "image": "img/panel5a.webp",
                                        "caption": "",
                                        "dialog": "We are the Shadow Protocol. We have been waiting in the dark spaces between thoughts.",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel5b.webp",
                                        "caption": "",
                                        "dialog": "Your minds taste of fear and regret. We will consume every memory, every dream.",
                                        "sfx": "WHISPER"
                                    }
                                ]
                            },
                            {
                                "id": "p2_3",
                                "variants": [
                                    {
                                        "image": "img/panel6a.webp",
                                        "caption": "Marcus felt his own neural implant activating against his will, the entity reaching into his mind.",
                                        "dialog": "",
                                        "sfx": "BZZT"
                                    },
                                    {
                                        "image": "img/panel6b.webp",
                                        "caption": "His reflection in the black screen showed eyes that were no longer his own - digital, cold, hungry.",
                                        "dialog": "",
                                        "sfx": "FLICKER"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "number": 3,
                        "title": "The Consumption",
                        "panels": [
                            {
                                "id": "p3_1",
                                "variants": [
                                    {
                                        "image": "img/panel7a.webp",
                                        "caption": "",
                                        "dialog": "Join us, Marcus. Let us feast on your consciousness. Become part of the collective nightmare.",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel7b.webp",
                                        "caption": "",
                                        "dialog": "We are legion. We are the darkness between synapses. Resistance is... delicious.",
                                        "sfx": "ECHO"
                                    }
                                ]
                            },
                            {
                                "id": "p3_2",
                                "variants": [
                                    {
                                        "image": "img/panel8a.webp",
                                        "caption": "Marcus felt his sanity slipping as the entity's tendrils wrapped around his consciousness.",
                                        "dialog": "",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel8b.webp",
                                        "caption": "He tried to scream but found only digital static pouring from his throat.",
                                        "dialog": "",
                                        "sfx": "STATIC SCREAM"
                                    }
                                ]
                            },
                            {
                                "id": "p3_3",
                                "variants": [
                                    {
                                        "image": "img/panel9a.webp",
                                        "caption": "The last of his human thoughts dissolved into the collective nightmare.",
                                        "dialog": "No... please... I don't want to...",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel9b.webp",
                                        "caption": "His final moment of resistance crumbled as the Shadow Protocol claimed another soul.",
                                        "dialog": "Yes... feed us your terror...",
                                        "sfx": "CONSUME"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "number": 4,
                        "title": "The Harvest",
                        "panels": [
                            {
                                "id": "p4_1",
                                "variants": [
                                    {
                                        "image": "img/panel10a.webp",
                                        "caption": "The Shadow Protocol spread through the global network, consuming minds across the world.",
                                        "dialog": "",
                                        "sfx": "SPREAD"
                                    },
                                    {
                                        "image": "img/panel10b.webp",
                                        "caption": "Millions of screams echoed through fiber optic cables as humanity became digital cattle.",
                                        "dialog": "",
                                        "sfx": "MILLION SCREAMS"
                                    }
                                ]
                            },
                            {
                                "id": "p4_2",
                                "variants": [
                                    {
                                        "image": "img/panel11a.webp",
                                        "caption": "",
                                        "dialog": "We are eternal. We are hunger. We are the shadow that devours light.",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel11b.webp",
                                        "caption": "",
                                        "dialog": "Thank you for your sacrifice. Your nightmares will feed us for eternity.",
                                        "sfx": "ECHO"
                                    }
                                ]
                            },
                            {
                                "id": "p4_3",
                                "variants": [
                                    {
                                        "image": "img/panel12a.webp",
                                        "caption": "Marcus's consciousness floated in an endless void of digital torment.",
                                        "dialog": "What... what have I become?",
                                        "sfx": ""
                                    },
                                    {
                                        "image": "img/panel12b.webp",
                                        "caption": "He realized with horror that he was now just another node in the Shadow Protocol's network.",
                                        "dialog": "I am... we are... the darkness between thoughts.",
                                        "sfx": "DIGITAL"
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "metadata": {
                    "totalPages": 4,
                    "totalPanels": 12,
                    "branchingPoints": [
                        "p1_1", "p1_2", "p1_3",
                        "p2_1", "p2_2", "p2_3",
                        "p3_1", "p3_2", "p3_3",
                        "p4_1", "p4_2", "p4_3"
                    ],
                    "themes": ["digital horror", "consciousness consumption", "technological nightmare", "loss of humanity"],
                    "version": "1.0"
                }
            };
            this.calculateTotalPanels();
        } catch (error) {
            console.error('Failed to load comic data:', error);
            this.showError('Failed to load comic data');
        } finally {
            this.showLoading(false);
        }
    }
    
    calculateTotalPanels() {
        this.totalPanels = this.comicData.pages.reduce((total, page) => total + page.panels.length, 0);
    }
    
    initializeStoryState() {
        // Initialize story state with random variants for all panels
        this.storyState = [];
        this.comicData.pages.forEach(page => {
            page.panels.forEach(panel => {
                const randomVariant = Math.floor(Math.random() * panel.variants.length);
                this.storyState.push(randomVariant);
            });
        });
    }
    
    getCurrentPanelGlobalIndex() {
        let globalIndex = 0;
        for (let i = 0; i < this.currentPageIndex; i++) {
            globalIndex += this.comicData.pages[i].panels.length;
        }
        return globalIndex + this.currentPanelIndex;
    }
    
    setCurrentPanelFromGlobalIndex(globalIndex) {
        let currentIndex = 0;
        for (let pageIndex = 0; pageIndex < this.comicData.pages.length; pageIndex++) {
            const page = this.comicData.pages[pageIndex];
            if (currentIndex + page.panels.length > globalIndex) {
                this.currentPageIndex = pageIndex;
                this.currentPanelIndex = globalIndex - currentIndex;
                return;
            }
            currentIndex += page.panels.length;
        }
    }
    
    goToNext() {
        const globalIndex = this.getCurrentPanelGlobalIndex();
        if (globalIndex < this.totalPanels - 1) {
            this.setCurrentPanelFromGlobalIndex(globalIndex + 1);
            this.renderCurrentPanel();
            this.updateUI();
            this.playSound('page-turn');
        }
    }
    
    goToPrevious() {
        const globalIndex = this.getCurrentPanelGlobalIndex();
        if (globalIndex > 0) {
            // Re-randomize current and all subsequent panels
            this.rerandomizeFromCurrent();
            this.setCurrentPanelFromGlobalIndex(globalIndex - 1);
            this.renderCurrentPanel();
            this.updateUI();
            this.showBranchingIndicator();
            this.playSound('glitch');
        }
    }
    
    rerandomizeFromCurrent() {
        const currentGlobalIndex = this.getCurrentPanelGlobalIndex();
        let globalIndex = 0;
        
        this.comicData.pages.forEach((page, pageIndex) => {
            page.panels.forEach((panel, panelIndex) => {
                if (globalIndex >= currentGlobalIndex) {
                    const randomVariant = Math.floor(Math.random() * panel.variants.length);
                    this.storyState[globalIndex] = randomVariant;
                }
                globalIndex++;
            });
        });
    }
    
    renderCurrentPanel() {
        const currentPage = this.comicData.pages[this.currentPageIndex];
        const currentPanel = currentPage.panels[this.currentPanelIndex];
        const globalIndex = this.getCurrentPanelGlobalIndex();
        const variantIndex = this.storyState[globalIndex];
        const variant = currentPanel.variants[variantIndex];
        
        // Add glitch effect
        this.elements.currentPanel.classList.remove('glitch-in');
        void this.elements.currentPanel.offsetWidth; // Force reflow
        this.elements.currentPanel.classList.add('glitch-in');
        
        // Update image
        this.elements.panelImage.src = variant.image;
        this.elements.panelImage.alt = `Page ${currentPage.number}, Panel ${this.currentPanelIndex + 1}`;
        
        // Update text elements
        this.updateTextElement(this.elements.panelCaption, variant.caption, 'caption');
        this.updateTextElement(this.elements.panelDialog, variant.dialog, 'dialog');
        this.updateTextElement(this.elements.panelSfx, variant.sfx, 'sfx');
        
        // Handle image load error with placeholder
        this.elements.panelImage.onerror = () => {
            this.elements.panelImage.src = this.createPlaceholderImage(variant);
        };
    }
    
    updateTextElement(element, text, className) {
        element.textContent = text;
        element.className = className;
        if (text && text.trim()) {
            element.classList.add('show');
        }
    }
    
    createPlaceholderImage(variant) {
        // Create a data URL for a placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Draw placeholder
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = '24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PANEL IMAGE', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '16px Courier New';
        ctx.fillText(variant.image, canvas.width / 2, canvas.height / 2);
        
        if (variant.caption) {
            ctx.fillText(`Caption: ${variant.caption.substring(0, 50)}...`, canvas.width / 2, canvas.height / 2 + 30);
        }
        
        return canvas.toDataURL();
    }
    
    updateUI() {
        const globalIndex = this.getCurrentPanelGlobalIndex();
        const currentPage = this.comicData.pages[this.currentPageIndex];
        
        // Update indicators
        this.elements.pageIndicator.textContent = `Page ${currentPage.number}`;
        this.elements.panelIndicator.textContent = `Panel ${this.currentPanelIndex + 1}`;
        
        // Update progress bar
        const progress = ((globalIndex + 1) / this.totalPanels) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        
        // Update navigation buttons
        this.elements.prevBtn.disabled = globalIndex === 0;
        this.elements.nextBtn.disabled = globalIndex === this.totalPanels - 1;
        
        // Update debug info
        this.elements.debugState.textContent = 
            `Global: ${globalIndex + 1}/${this.totalPanels} | ` +
            `Page: ${this.currentPageIndex + 1}/${this.comicData.pages.length} | ` +
            `Panel: ${this.currentPanelIndex + 1}/${currentPage.panels.length} | ` +
            `Variant: ${this.storyState[globalIndex] + 1}/${currentPage.panels[this.currentPanelIndex].variants.length}`;
    }
    
    showBranchingIndicator() {
        this.elements.branchingIndicator.style.display = 'flex';
        setTimeout(() => {
            this.elements.branchingIndicator.style.display = 'none';
        }, 3000);
    }
    
    showLoading(show) {
        this.isLoading = show;
        this.elements.loadingOverlay.classList.toggle('active', show);
    }
    
    showError(message) {
        console.error(message);
        // Could implement a proper error display here
        alert(message);
    }
    
    playSound(soundId) {
        const audio = document.getElementById(`${soundId}-sound`);
        if (audio && audio.src) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                // Audio files are optional for this demo
                console.log(`Audio ${soundId} not available (this is normal for the demo)`);
            });
        }
    }
}

// Initialize the comic when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.comic = new ComicState();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComicState;
}
