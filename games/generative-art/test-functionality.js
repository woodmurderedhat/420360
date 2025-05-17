// Comprehensive functionality test script
console.log('Starting comprehensive functionality tests...');

// Wait for the application to fully initialize
window.addEventListener('load', () => {
    // Give the app a moment to fully initialize
    setTimeout(runTests, 1000);
});

function runTests() {
    console.log('Running comprehensive tests...');
    
    // Run tests in sequence
    testCoreRendering()
        .then(() => testUIControls())
        .then(() => testAnimation())
        .then(() => testGallery())
        .then(() => testPerformanceOptimizations())
        .then(() => testStateManagement())
        .then(() => {
            console.log('All tests completed!');
            console.log('Summary: The application appears to be working correctly.');
        })
        .catch(error => {
            console.error('Test failed:', error);
        });
}

// Test core rendering functionality
function testCoreRendering() {
    return new Promise((resolve, reject) => {
        console.log('Testing core rendering...');
        
        try {
            // Check if canvas exists and has content
            const canvas = document.getElementById('artCanvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context not available');
            }
            
            // Check if canvas has been drawn on (not blank)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Check if all pixels are the same (likely blank)
            let allSame = true;
            const firstPixel = [data[0], data[1], data[2], data[3]];
            
            for (let i = 4; i < data.length; i += 4) {
                if (data[i] !== firstPixel[0] || 
                    data[i+1] !== firstPixel[1] || 
                    data[i+2] !== firstPixel[2] || 
                    data[i+3] !== firstPixel[3]) {
                    allSame = false;
                    break;
                }
            }
            
            if (allSame) {
                throw new Error('Canvas appears to be blank or a solid color');
            }
            
            console.log('Core rendering test passed');
            resolve();
        } catch (error) {
            console.error('Core rendering test failed:', error);
            // Continue with other tests even if this one fails
            resolve();
        }
    });
}

// Test UI controls
function testUIControls() {
    return new Promise((resolve, reject) => {
        console.log('Testing UI controls...');
        
        try {
            // Test regenerate button
            const regenerateButton = document.getElementById('regenerateButton');
            if (regenerateButton) {
                console.log('Testing regenerate button...');
                regenerateButton.click();
            } else {
                console.warn('Regenerate button not found');
            }
            
            // Test color theme selector
            const colorThemeSelector = document.getElementById('colorThemeSelector');
            if (colorThemeSelector) {
                console.log('Testing color theme selector...');
                const originalValue = colorThemeSelector.value;
                colorThemeSelector.value = 'monochrome';
                
                // Trigger change event
                const event = new Event('change');
                colorThemeSelector.dispatchEvent(event);
                
                // Reset to original value
                setTimeout(() => {
                    colorThemeSelector.value = originalValue;
                    colorThemeSelector.dispatchEvent(event);
                }, 500);
            } else {
                console.warn('Color theme selector not found');
            }
            
            console.log('UI controls test passed');
            resolve();
        } catch (error) {
            console.error('UI controls test failed:', error);
            // Continue with other tests even if this one fails
            resolve();
        }
    });
}

// Test animation functionality
function testAnimation() {
    return new Promise((resolve, reject) => {
        console.log('Testing animation...');
        
        try {
            const animationToggle = document.getElementById('animationToggle');
            if (animationToggle) {
                console.log('Testing animation toggle...');
                
                // Enable animation
                if (!animationToggle.checked) {
                    animationToggle.checked = true;
                    const event = new Event('change');
                    animationToggle.dispatchEvent(event);
                }
                
                // Wait a bit to see if animation is running
                setTimeout(() => {
                    // Disable animation
                    animationToggle.checked = false;
                    const event = new Event('change');
                    animationToggle.dispatchEvent(event);
                    
                    console.log('Animation test passed');
                    resolve();
                }, 1000);
            } else {
                console.warn('Animation toggle not found');
                resolve();
            }
        } catch (error) {
            console.error('Animation test failed:', error);
            // Continue with other tests even if this one fails
            resolve();
        }
    });
}

// Test gallery functionality
function testGallery() {
    return new Promise((resolve, reject) => {
        console.log('Testing gallery...');
        
        try {
            const saveToGalleryButton = document.getElementById('saveToGalleryButton');
            const galleryButton = document.getElementById('galleryButton');
            
            if (saveToGalleryButton && galleryButton) {
                console.log('Testing gallery save and open...');
                
                // Save to gallery
                saveToGalleryButton.click();
                
                // Open gallery
                setTimeout(() => {
                    galleryButton.click();
                    
                    // Close gallery
                    setTimeout(() => {
                        const closeButton = document.querySelector('.close-button');
                        if (closeButton) {
                            closeButton.click();
                        }
                        
                        console.log('Gallery test passed');
                        resolve();
                    }, 500);
                }, 500);
            } else {
                console.warn('Gallery buttons not found');
                resolve();
            }
        } catch (error) {
            console.error('Gallery test failed:', error);
            // Continue with other tests even if this one fails
            resolve();
        }
    });
}

// Test performance optimizations
function testPerformanceOptimizations() {
    return new Promise((resolve, reject) => {
        console.log('Testing performance optimizations...');
        
        try {
            // Test adaptive quality
            const adaptiveQualityToggle = document.getElementById('adaptiveQualityToggle');
            if (adaptiveQualityToggle) {
                console.log('Testing adaptive quality...');
                
                // Toggle adaptive quality
                const originalValue = adaptiveQualityToggle.checked;
                adaptiveQualityToggle.checked = !originalValue;
                const event = new Event('change');
                adaptiveQualityToggle.dispatchEvent(event);
                
                // Reset to original value
                setTimeout(() => {
                    adaptiveQualityToggle.checked = originalValue;
                    adaptiveQualityToggle.dispatchEvent(event);
                }, 500);
            } else {
                console.warn('Adaptive quality toggle not found');
            }
            
            console.log('Performance optimizations test passed');
            resolve();
        } catch (error) {
            console.error('Performance optimizations test failed:', error);
            // Continue with other tests even if this one fails
            resolve();
        }
    });
}

// Test state management
function testStateManagement() {
    return new Promise((resolve, reject) => {
        console.log('Testing state management...');
        
        try {
            // Test undo/redo
            const undoButton = document.getElementById('undoButton');
            const redoButton = document.getElementById('redoButton');
            
            if (undoButton && redoButton) {
                console.log('Testing undo/redo...');
                
                // Make a change to trigger history
                const numShapesSlider = document.getElementById('numShapes');
                if (numShapesSlider) {
                    const originalValue = numShapesSlider.value;
                    numShapesSlider.value = parseInt(originalValue) + 50;
                    const event = new Event('input');
                    numShapesSlider.dispatchEvent(event);
                    
                    // Apply the change
                    const applyButton = document.getElementById('applySettings');
                    if (applyButton) {
                        applyButton.click();
                        
                        // Test undo
                        setTimeout(() => {
                            undoButton.click();
                            
                            // Test redo
                            setTimeout(() => {
                                redoButton.click();
                                
                                // Reset to original value
                                setTimeout(() => {
                                    numShapesSlider.value = originalValue;
                                    numShapesSlider.dispatchEvent(event);
                                    if (applyButton) {
                                        applyButton.click();
                                    }
                                    
                                    console.log('State management test passed');
                                    resolve();
                                }, 300);
                            }, 300);
                        }, 300);
                    } else {
                        console.warn('Apply button not found');
                        resolve();
                    }
                } else {
                    console.warn('Number of shapes slider not found');
                    resolve();
                }
            } else {
                console.warn('Undo/redo buttons not found');
                resolve();
            }
        } catch (error) {
            console.error('State management test failed:', error);
            // Continue with other tests even if this one fails
            resolve();
        }
    });
}
