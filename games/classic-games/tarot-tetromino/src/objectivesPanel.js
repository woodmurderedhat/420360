/**
 * Objectives Panel for Tarot Tetromino
 * This file handles the floating objectives panel that shows current game goals.
 */

// Create and initialize the objectives panel
function createObjectivesPanel() {
    // Create panel if it doesn't exist
    let panel = document.getElementById('objectives-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'objectives-panel';
        panel.className = 'objectives-panel';
        document.body.appendChild(panel);
    }

    // Set initial content
    updateObjectivesPanel();

    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-objectives';
    toggleButton.className = 'toggle-objectives-btn';
    toggleButton.innerHTML = '<span class="icon">📋</span>';
    toggleButton.setAttribute('aria-label', 'Toggle Objectives Panel');
    toggleButton.setAttribute('title', 'Toggle Objectives Panel');
    document.body.appendChild(toggleButton);

    // Toggle panel visibility on button click
    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('expanded');
        toggleButton.classList.toggle('active');
    });

    // Make panel draggable
    makeDraggable(panel);
}

// Update the objectives panel content
function updateObjectivesPanel() {
    const panel = document.getElementById('objectives-panel');
    if (!panel) return;

    // Calculate lines needed to level up
    const linesNeeded = TarotTetris.linesToLevelUp - TarotTetris.linesClearedThisLevel;
    const progressPercent = (TarotTetris.linesClearedThisLevel / TarotTetris.linesToLevelUp) * 100;

    // Update panel content
    panel.innerHTML = `
        <div class="panel-header">
            <h3>Current Objectives</h3>
            <button class="close-panel" aria-label="Close Objectives Panel">×</button>
        </div>
        <div class="panel-content">
            <div class="objective">
                <div class="objective-header">
                    <span class="objective-icon">🧩</span>
                    <span class="objective-title">Clear Lines</span>
                </div>
                <div class="objective-details">
                    <div class="objective-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">${TarotTetris.linesClearedThisLevel}/${TarotTetris.linesToLevelUp}</div>
                    </div>
                    <div class="objective-description">Clear ${linesNeeded} more line${linesNeeded !== 1 ? 's' : ''} to level up</div>
                </div>
            </div>
            <div class="objective">
                <div class="objective-header">
                    <span class="objective-icon">⬆️</span>
                    <span class="objective-title">Current Level</span>
                </div>
                <div class="objective-details">
                    <div class="level-display">${TarotTetris.level}</div>
                    <div class="objective-description">Next level: ${TarotTetris.level + 1}</div>
                </div>
            </div>
            <div class="objective">
                <div class="objective-header">
                    <span class="objective-icon">🏆</span>
                    <span class="objective-title">Score</span>
                </div>
                <div class="objective-details">
                    <div class="score-display">${TarotTetris.score}</div>
                    <div class="objective-description">Keep playing to increase your score!</div>
                </div>
            </div>
        </div>
    `;

    // Add close button event listener
    const closeButton = panel.querySelector('.close-panel');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            panel.classList.remove('expanded');
            const toggleButton = document.getElementById('toggle-objectives');
            if (toggleButton) {
                toggleButton.classList.remove('active');
            }
        });
    }
}

// Make an element draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Get the header element to use as the drag handle
    const header = element.querySelector('.panel-header');
    if (header) {
        header.onmousedown = dragMouseDown;
        header.style.cursor = 'move';
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Export functions to global scope
window.createObjectivesPanel = createObjectivesPanel;
window.updateObjectivesPanel = updateObjectivesPanel;
