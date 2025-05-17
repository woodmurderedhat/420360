// Simple script to check for JavaScript errors
console.log('Testing for JavaScript errors...');

// Function to check if all required modules are loaded
function checkModules() {
    const requiredModules = [
        'main.js',
        'styles.js',
        'styles-default.js',
        'animation.js',
        'palette.js',
        'state.js',
        'ui/index.js',
        'worker-manager.js',
        'webgl-renderer.js',
        'gallery.js',
        'history.js',
        'error-service.js'
    ];
    
    const missingModules = [];
    
    requiredModules.forEach(module => {
        const script = document.querySelector(`script[src*="${module}"]`);
        if (!script) {
            missingModules.push(module);
        }
    });
    
    if (missingModules.length > 0) {
        console.error('Missing modules:', missingModules);
        return false;
    }
    
    console.log('All required modules are loaded');
    return true;
}

// Function to check if canvas is initialized
function checkCanvas() {
    const canvas = document.getElementById('artCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return false;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not available');
        return false;
    }
    
    console.log('Canvas is initialized');
    return true;
}

// Function to check UI controls
function checkUIControls() {
    const controlsPanel = document.getElementById('controlsPanel');
    if (!controlsPanel) {
        console.error('Controls panel not found');
        return false;
    }
    
    const requiredControls = [
        'numShapes',
        'lineWidth',
        'backgroundColorPicker',
        'colorThemeSelector',
        'voronoiOpacity',
        'animationToggle',
        'regenerateButton',
        'exportButton'
    ];
    
    const missingControls = [];
    
    requiredControls.forEach(control => {
        const element = document.getElementById(control);
        if (!element) {
            missingControls.push(control);
        }
    });
    
    if (missingControls.length > 0) {
        console.error('Missing UI controls:', missingControls);
        return false;
    }
    
    console.log('All UI controls are present');
    return true;
}

// Run tests
window.addEventListener('load', () => {
    console.log('Running tests...');
    
    const modulesOK = checkModules();
    const canvasOK = checkCanvas();
    const uiOK = checkUIControls();
    
    if (modulesOK && canvasOK && uiOK) {
        console.log('All tests passed! The application appears to be working correctly.');
    } else {
        console.error('Some tests failed. Please check the console for details.');
    }
});
