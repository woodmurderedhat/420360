// js/PanelManager.js
// Enables drag and resize for all .draggable-panel and .resizable-panel elements

function makePanelsDraggableAndResizable() {
    const panels = document.querySelectorAll('.draggable-panel');
    panels.forEach(panel => {
        // Drag logic
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        let startX = 0, startY = 0;

        panel.addEventListener('mousedown', function(e) {
            // Only drag if not clicking on a button or input
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            offsetX = startX - rect.left;
            offsetY = startY - rect.top;
            panel.style.zIndex = 1000;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                panel.style.zIndex = 10;
                document.body.style.userSelect = '';
            }
        });

        // Initial position (stacked)
        if (!panel.style.left) panel.style.left = (40 + Math.random() * 200) + 'px';
        if (!panel.style.top) panel.style.top = (120 + Math.random() * 120) + 'px';
    });
}

// Call on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makePanelsDraggableAndResizable);
} else {
    makePanelsDraggableAndResizable();
}

export default makePanelsDraggableAndResizable;
