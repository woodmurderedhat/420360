/**
 * ui-lazy-loader.js - Lazy loading for UI components in the Generative Art Studio
 * Handles deferred initialization of UI components to improve startup performance
 */

// Track initialized components
const initializedComponents = new Set();

// Track section expansion state
const expandedSections = new Map();

/**
 * Initialize a component if it hasn't been initialized yet
 * @param {string} componentId - The ID of the component to initialize
 * @param {Function} initFunction - The function to call to initialize the component
 * @param {Array} args - Arguments to pass to the init function
 * @returns {boolean} Whether the component was initialized in this call
 */
function initializeComponent(componentId, initFunction, ...args) {
    if (initializedComponents.has(componentId)) {
        return false;
    }
    
    try {
        initFunction(...args);
        initializedComponents.add(componentId);
        return true;
    } catch (error) {
        console.error(`Error initializing component ${componentId}:`, error);
        return false;
    }
}

/**
 * Check if a component has been initialized
 * @param {string} componentId - The ID of the component to check
 * @returns {boolean} Whether the component has been initialized
 */
function isComponentInitialized(componentId) {
    return initializedComponents.has(componentId);
}

/**
 * Reset a component's initialization state
 * @param {string} componentId - The ID of the component to reset
 */
function resetComponent(componentId) {
    initializedComponents.delete(componentId);
}

/**
 * Make a section expandable with lazy loading
 * @param {string} sectionId - The ID of the section element
 * @param {string} headerId - The ID of the header element that toggles the section
 * @param {string} contentId - The ID of the content element to show/hide
 * @param {Function} initFunction - Function to call when the section is first expanded
 * @param {Array} args - Arguments to pass to the init function
 */
function makeExpandableSection(sectionId, headerId, contentId, initFunction = null, ...args) {
    const section = document.getElementById(sectionId);
    const header = document.getElementById(headerId);
    const content = document.getElementById(contentId);
    
    if (!section || !header || !content) {
        console.error(`Could not find elements for expandable section ${sectionId}`);
        return;
    }
    
    // Set initial state
    const isInitiallyExpanded = localStorage.getItem(`section_${sectionId}_expanded`) === 'true';
    expandedSections.set(sectionId, isInitiallyExpanded);
    
    // Set initial visibility
    content.style.display = isInitiallyExpanded ? 'block' : 'none';
    header.classList.toggle('expanded', isInitiallyExpanded);
    
    // Initialize if initially expanded and has init function
    if (isInitiallyExpanded && initFunction && !isComponentInitialized(sectionId)) {
        initFunction(...args);
        initializedComponents.add(sectionId);
    }
    
    // Add click handler to header
    header.addEventListener('click', () => {
        const isExpanded = expandedSections.get(sectionId);
        const newExpandedState = !isExpanded;
        
        // Toggle visibility
        content.style.display = newExpandedState ? 'block' : 'none';
        header.classList.toggle('expanded', newExpandedState);
        
        // Save state
        expandedSections.set(sectionId, newExpandedState);
        localStorage.setItem(`section_${sectionId}_expanded`, newExpandedState);
        
        // Initialize if expanding and has init function
        if (newExpandedState && initFunction && !isComponentInitialized(sectionId)) {
            initFunction(...args);
            initializedComponents.add(sectionId);
        }
    });
}

/**
 * Convert existing control sections to expandable sections
 * @param {Object} state - The application state
 */
function setupLazyLoadingSections(state) {
    // Get all control sections
    const controlSections = document.querySelectorAll('.control-section');
    
    // Process each section
    controlSections.forEach(section => {
        // Skip if already processed
        if (section.classList.contains('expandable-processed')) {
            return;
        }
        
        // Get or create section ID
        const sectionId = section.id || `section_${Math.random().toString(36).substr(2, 9)}`;
        if (!section.id) {
            section.id = sectionId;
        }
        
        // Get or create header
        let header = section.querySelector('h3');
        if (!header) {
            // If no header, create one with the section's first child text
            const headerText = section.firstChild && section.firstChild.nodeType === Node.TEXT_NODE
                ? section.firstChild.textContent.trim()
                : 'Section';
            
            header = document.createElement('h3');
            header.textContent = headerText;
            section.insertBefore(header, section.firstChild);
        }
        
        // Set header ID
        const headerId = `${sectionId}_header`;
        header.id = headerId;
        
        // Create content wrapper if needed
        let content = section.querySelector('.section-content');
        if (!content) {
            // Move all children except header into content div
            content = document.createElement('div');
            content.className = 'section-content';
            const contentId = `${sectionId}_content`;
            content.id = contentId;
            
            // Move all children except header into content
            Array.from(section.children).forEach(child => {
                if (child !== header) {
                    content.appendChild(child);
                }
            });
            
            section.appendChild(content);
        }
        
        // Determine initialization function based on section content
        let initFunction = null;
        
        // Advanced controls section
        if (section.querySelector('#colorShiftAmount') || section.querySelector('#blendModeSelector')) {
            initFunction = initializeAdvancedControls;
        }
        // Layer controls section
        else if (section.querySelector('#voronoiOpacity') || section.querySelector('#organicSplattersOpacity')) {
            initFunction = initializeLayerControls;
        }
        // Animation controls section
        else if (section.querySelector('#animationToggle') || section.querySelector('#animationSpeed')) {
            initFunction = initializeAnimationControls;
        }
        
        // Make section expandable
        makeExpandableSection(sectionId, headerId, content.id, initFunction, state);
        
        // Mark as processed
        section.classList.add('expandable-processed');
        
        // Add expand/collapse indicator
        header.classList.add('expandable-header');
    });
    
    // Add CSS for expandable sections
    addExpandableSectionStyles();
}

/**
 * Initialize advanced controls
 * @param {Object} state - The application state
 */
function initializeAdvancedControls(state) {
    console.log('Initializing advanced controls');
    
    // Get advanced control elements
    const blendModeSelector = document.getElementById('blendModeSelector');
    const colorShiftAmountInput = document.getElementById('colorShiftAmount');
    const scaleAmountInput = document.getElementById('scaleAmount');
    const rotationAmountInput = document.getElementById('rotationAmount');
    
    // Set initial values from state
    if (blendModeSelector) {
        blendModeSelector.value = state.blendMode || 'source-over';
    }
    
    if (colorShiftAmountInput) {
        colorShiftAmountInput.value = state.colorShiftAmount || 0;
        const display = document.getElementById('colorShiftAmountValue');
        if (display) display.textContent = colorShiftAmountInput.value;
    }
    
    if (scaleAmountInput) {
        scaleAmountInput.value = state.scaleAmount || 1;
        const display = document.getElementById('scaleAmountValue');
        if (display) display.textContent = scaleAmountInput.value;
    }
    
    if (rotationAmountInput) {
        rotationAmountInput.value = state.rotationAmount || 0;
        const display = document.getElementById('rotationAmountValue');
        if (display) display.textContent = rotationAmountInput.value;
    }
}

/**
 * Initialize layer controls
 * @param {Object} state - The application state
 */
function initializeLayerControls(state) {
    console.log('Initializing layer controls');
    
    // Initialize layer opacity controls
    const opacityControls = [
        { id: 'voronoiOpacity', stateKey: 'voronoiOpacity' },
        { id: 'organicSplattersOpacity', stateKey: 'organicSplattersOpacity' },
        { id: 'neonWavesOpacity', stateKey: 'neonWavesOpacity' },
        { id: 'fractalLinesOpacity', stateKey: 'fractalLinesOpacity' },
        { id: 'geometricGridOpacity', stateKey: 'geometricGridOpacity' },
        { id: 'particleSwarmOpacity', stateKey: 'particleSwarmOpacity' },
        { id: 'organicNoiseOpacity', stateKey: 'organicNoiseOpacity' },
        { id: 'glitchMosaicOpacity', stateKey: 'glitchMosaicOpacity' },
        { id: 'pixelSortOpacity', stateKey: 'pixelSortOpacity' },
        { id: 'gradientOverlayOpacity', stateKey: 'gradientOverlayOpacity' },
        { id: 'dotMatrixOpacity', stateKey: 'dotMatrixOpacity' },
        { id: 'textureOverlayOpacity', stateKey: 'textureOverlayOpacity' },
        { id: 'symmetricalPatternsOpacity', stateKey: 'symmetricalPatternsOpacity' },
        { id: 'flowingLinesOpacity', stateKey: 'flowingLinesOpacity' }
    ];
    
    opacityControls.forEach(control => {
        const input = document.getElementById(control.id);
        if (input && state[control.stateKey] !== undefined) {
            input.value = state[control.stateKey];
            const display = document.getElementById(`${control.id}Value`);
            if (display) display.textContent = input.value;
        }
    });
}

/**
 * Initialize animation controls
 * @param {Object} state - The application state
 */
function initializeAnimationControls(state) {
    console.log('Initializing animation controls');
    
    // Get animation control elements
    const animationToggle = document.getElementById('animationToggle');
    const animationSpeedInput = document.getElementById('animationSpeed');
    const interactiveToggle = document.getElementById('interactiveToggle');
    const adaptiveQualityToggle = document.getElementById('adaptiveQualityToggle');
    
    // Set initial values from state
    if (animationToggle) {
        animationToggle.checked = state.animationEnabled || false;
        
        // Enable/disable speed slider based on toggle
        if (animationSpeedInput) {
            animationSpeedInput.disabled = !animationToggle.checked;
        }
    }
    
    if (animationSpeedInput) {
        animationSpeedInput.value = state.animationSpeed || 50;
        const display = document.getElementById('animationSpeedValue');
        if (display) display.textContent = animationSpeedInput.value;
    }
    
    if (interactiveToggle) {
        interactiveToggle.checked = state.interactiveMode || false;
    }
    
    if (adaptiveQualityToggle) {
        adaptiveQualityToggle.checked = state.adaptiveQuality !== undefined ? state.adaptiveQuality : true;
    }
}

/**
 * Add CSS styles for expandable sections
 */
function addExpandableSectionStyles() {
    // Check if styles already exist
    if (document.getElementById('expandable-section-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'expandable-section-styles';
    style.textContent = `
        .expandable-header {
            cursor: pointer;
            position: relative;
            padding-right: 20px;
            user-select: none;
        }
        
        .expandable-header::after {
            content: '▼';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
            transition: transform 0.2s ease;
            font-size: 0.8em;
        }
        
        .expandable-header.expanded::after {
            transform: translateY(-50%) rotate(0);
        }
        
        .section-content {
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
    `;
    
    document.head.appendChild(style);
}

// Export functions
export {
    initializeComponent,
    isComponentInitialized,
    resetComponent,
    makeExpandableSection,
    setupLazyLoadingSections
};
