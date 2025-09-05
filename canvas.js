// ===== CANVAS CONTROLLER =====
class CanvasController {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('canvas');
        this.isDragging = false;
        this.isResizing = false;
        this.snapTolerance = 10; // pixels
        this.gridSize = 20; // pixels
        
        this.init();
    }
    
    init() {
        this.setupCanvasEvents();
        this.setupRulers();
        this.updateCanvasDimensions();
    }
    
    setupCanvasEvents() {
        // Mouse events for better control
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Context menu for additional options
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    setupRulers() {
        this.updateRulerMarks();
        
        // Update rulers when canvas size changes
        const resizeObserver = new ResizeObserver(() => {
            this.updateRulerMarks();
            this.updateCanvasDimensions();
        });
        
        resizeObserver.observe(this.canvas);
    }
    
    updateRulerMarks() {
        const horizontalRuler = document.querySelector('.ruler-horizontal');
        const verticalRuler = document.querySelector('.ruler-vertical');
        
        if (!horizontalRuler || !verticalRuler) return;
        
        // Clear existing marks
        horizontalRuler.innerHTML = '';
        verticalRuler.innerHTML = '';
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width - 40; // subtract padding
        const canvasHeight = canvasRect.height - 40; // subtract padding
        
        // Create horizontal ruler marks (columns)
        for (let i = 0; i <= 12; i++) {
            const mark = document.createElement('div');
            mark.className = 'ruler-mark';
            mark.style.position = 'absolute';
            mark.style.left = `${20 + (i * canvasWidth / 12)}px`;
            mark.style.top = '0';
            mark.style.width = '1px';
            mark.style.height = '20px';
            mark.style.backgroundColor = 'rgba(0, 216, 255, 0.5)';
            mark.style.fontSize = '10px';
            mark.style.color = 'var(--secondary)';
            
            if (i > 0 && i <= 12) {
                const label = document.createElement('span');
                label.textContent = i;
                label.style.position = 'absolute';
                label.style.left = '-5px';
                label.style.top = '2px';
                label.style.fontSize = '9px';
                mark.appendChild(label);
            }
            
            horizontalRuler.appendChild(mark);
        }
        
        // Create vertical ruler marks (rows)
        for (let i = 0; i <= 8; i++) {
            const mark = document.createElement('div');
            mark.className = 'ruler-mark';
            mark.style.position = 'absolute';
            mark.style.left = '0';
            mark.style.top = `${20 + (i * canvasHeight / 8)}px`;
            mark.style.width = '20px';
            mark.style.height = '1px';
            mark.style.backgroundColor = 'rgba(0, 216, 255, 0.5)';
            
            if (i > 0 && i <= 8) {
                const label = document.createElement('span');
                label.textContent = i;
                label.style.position = 'absolute';
                label.style.left = '2px';
                label.style.top = '-8px';
                label.style.fontSize = '9px';
                label.style.color = 'var(--secondary)';
                mark.appendChild(label);
            }
            
            verticalRuler.appendChild(mark);
        }
    }
    
    updateCanvasDimensions() {
        const canvasRect = this.canvas.getBoundingClientRect();
        this.canvasWidth = canvasRect.width - 40;
        this.canvasHeight = canvasRect.height - 40;
        this.columnWidth = this.canvasWidth / 12;
        this.rowHeight = this.canvasHeight / 8;
    }
    
    handleMouseDown(e) {
        if (e.target.classList.contains('resize-handle')) {
            return; // Let resize handler take care of this
        }
        
        if (e.target.classList.contains('grid-box')) {
            this.startDragging(e);
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            this.updateDragPosition(e);
        }
        
        this.updateCursor(e);
        this.showSnapGuides(e);
    }
    
    handleMouseUp(e) {
        if (this.isDragging) {
            this.stopDragging(e);
        }
    }
    
    handleMouseLeave(e) {
        if (this.isDragging) {
            this.stopDragging(e);
        }
    }
    
    handleContextMenu(e) {
        e.preventDefault();
        
        if (e.target.classList.contains('grid-box')) {
            this.showContextMenu(e);
        } else if (e.target.id === 'canvas' || e.target.classList.contains('grid-overlay')) {
            this.showCanvasContextMenu(e);
        }
    }
    
    showContextMenu(e) {
        const boxElement = e.target;
        const box = this.app.boxes.find(b => b.element === boxElement);
        
        if (!box) return;
        
        const contextMenu = this.createContextMenu([
            { label: 'Duplicate', icon: 'fas fa-copy', action: () => this.app.duplicateBox(box) },
            { label: 'Delete', icon: 'fas fa-trash', action: () => this.app.deleteSelectedBox() },
            { label: 'Send to Back', icon: 'fas fa-layer-group', action: () => this.sendToBack(box) },
            { label: 'Bring to Front', icon: 'fas fa-layer-group', action: () => this.bringToFront(box) },
        ]);
        
        this.showContextMenuAt(contextMenu, e.clientX, e.clientY);
        this.app.selectBox(box);
    }
    
    showCanvasContextMenu(e) {
        const contextMenu = this.createContextMenu([
            { label: 'Add Box', icon: 'fas fa-plus', action: () => this.app.addBox() },
            { label: 'Paste', icon: 'fas fa-paste', action: () => this.paste(), disabled: !this.clipboard },
            { label: 'Clear All', icon: 'fas fa-trash', action: () => this.app.clearAll() },
            { label: 'Toggle Grid', icon: 'fas fa-border-all', action: () => this.app.toggleGrid() },
        ]);
        
        this.showContextMenuAt(contextMenu, e.clientX, e.clientY);
    }
    
    createContextMenu(items) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            background: rgba(30, 42, 120, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 12px;
            padding: 8px 0;
            min-width: 160px;
            box-shadow: var(--shadow-xl);
            z-index: 9999;
            opacity: 0;
            transform: scale(0.95);
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.style.cssText = `
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                color: ${item.disabled ? 'rgba(253, 253, 253, 0.4)' : 'var(--accent)'};
                font-size: 13px;
                transition: background-color 0.15s ease;
                pointer-events: ${item.disabled ? 'none' : 'auto'};
            `;
            
            menuItem.innerHTML = `
                <i class="${item.icon}" style="width: 14px; color: var(--secondary);"></i>
                <span>${item.label}</span>
            `;
            
            if (!item.disabled) {
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.backgroundColor = 'rgba(0, 216, 255, 0.1)';
                });
                
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.backgroundColor = 'transparent';
                });
                
                menuItem.addEventListener('click', () => {
                    item.action();
                    this.hideContextMenu();
                });
            }
            
            menu.appendChild(menuItem);
        });
        
        return menu;
    }
    
    showContextMenuAt(menu, x, y) {
        // Hide existing context menu
        this.hideContextMenu();
        
        document.body.appendChild(menu);
        
        // Position the menu
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = x;
        let top = y;
        
        // Adjust position if menu goes outside viewport
        if (left + menuRect.width > viewportWidth) {
            left = x - menuRect.width;
        }
        
        if (top + menuRect.height > viewportHeight) {
            top = y - menuRect.height;
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        
        // Show menu with animation
        requestAnimationFrame(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
        });
        
        // Hide menu on outside click
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
            document.addEventListener('contextmenu', this.hideContextMenu.bind(this), { once: true });
        }, 100);
        
        this.currentContextMenu = menu;
    }
    
    hideContextMenu() {
        if (this.currentContextMenu) {
            this.currentContextMenu.style.opacity = '0';
            this.currentContextMenu.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                if (this.currentContextMenu && this.currentContextMenu.parentNode) {
                    this.currentContextMenu.parentNode.removeChild(this.currentContextMenu);
                }
                this.currentContextMenu = null;
            }, 150);
        }
    }
    
    startDragging(e) {
        const boxElement = e.target.closest('.grid-box');
        const box = this.app.boxes.find(b => b.element === boxElement);
        
        if (!box) return;
        
        this.isDragging = true;
        this.draggedBox = box;
        this.dragStartPos = { x: e.clientX, y: e.clientY };
        this.dragStartGrid = { column: box.gridColumn, row: box.gridRow };
        
        boxElement.style.zIndex = '1000';
        boxElement.style.transition = 'none';
        
        this.app.selectBox(box);
        this.canvas.style.cursor = 'grabbing';
    }
    
    updateDragPosition(e) {
        if (!this.isDragging || !this.draggedBox) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = e.clientX - canvasRect.left - 20; // Subtract canvas padding
        const y = e.clientY - canvasRect.top - 20;
        
        // Calculate grid position
        const column = Math.max(1, Math.min(12, Math.round(x / this.columnWidth) + 1));
        const row = Math.max(1, Math.min(8, Math.round(y / this.rowHeight) + 1));
        
        // Check if position changed
        if (column !== this.draggedBox.gridColumn || row !== this.draggedBox.gridRow) {
            // Validate the new position doesn't exceed grid bounds
            const maxColumn = 12 - this.draggedBox.gridColumnSpan + 1;
            const maxRow = 8 - this.draggedBox.gridRowSpan + 1;
            
            this.draggedBox.gridColumn = Math.min(column, maxColumn);
            this.draggedBox.gridRow = Math.min(row, maxRow);
            
            this.app.updateBoxStyle(this.draggedBox);
            this.app.updateInspector();
            this.showSnapIndicators();
        }
    }
    
    stopDragging(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        if (this.draggedBox) {
            this.draggedBox.element.style.zIndex = '';
            this.draggedBox.element.style.transition = '';
            this.draggedBox = null;
        }
        
        this.canvas.style.cursor = '';
        this.hideSnapIndicators();
        this.app.updateCodePreview();
        this.app.saveState();
    }
    
    showSnapIndicators() {
        if (!this.draggedBox) return;
        
        // Remove existing indicators
        this.hideSnapIndicators();
        
        const indicators = [];
        
        // Show column indicators
        const columnStart = (this.draggedBox.gridColumn - 1) * this.columnWidth + 20;
        const columnEnd = columnStart + (this.draggedBox.gridColumnSpan * this.columnWidth);
        
        const colIndicator = document.createElement('div');
        colIndicator.className = 'snap-indicator column-indicator';
        colIndicator.style.cssText = `
            position: absolute;
            left: ${columnStart}px;
            top: 0;
            width: ${columnEnd - columnStart}px;
            height: 100%;
            background: rgba(0, 216, 255, 0.1);
            border: 2px dashed var(--secondary);
            pointer-events: none;
            z-index: 10;
        `;
        
        // Show row indicators
        const rowStart = (this.draggedBox.gridRow - 1) * this.rowHeight + 20;
        const rowEnd = rowStart + (this.draggedBox.gridRowSpan * this.rowHeight);
        
        const rowIndicator = document.createElement('div');
        rowIndicator.className = 'snap-indicator row-indicator';
        rowIndicator.style.cssText = `
            position: absolute;
            left: 0;
            top: ${rowStart}px;
            width: 100%;
            height: ${rowEnd - rowStart}px;
            background: rgba(0, 216, 255, 0.1);
            border: 2px dashed var(--secondary);
            pointer-events: none;
            z-index: 10;
        `;
        
        this.canvas.appendChild(colIndicator);
        this.canvas.appendChild(rowIndicator);
        
        this.snapIndicators = [colIndicator, rowIndicator];
    }
    
    hideSnapIndicators() {
        if (this.snapIndicators) {
            this.snapIndicators.forEach(indicator => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            });
            this.snapIndicators = [];
        }
    }
    
    showSnapGuides(e) {
        // Only show guides when dragging or when guides are enabled
        if (!this.isDragging && !this.app.showGuides) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;
        
        // Show nearest grid line guides
        const nearestColumn = Math.round((x - 20) / this.columnWidth);
        const nearestRow = Math.round((y - 20) / this.rowHeight);
        
        if (nearestColumn >= 0 && nearestColumn <= 12) {
            this.showVerticalGuide(20 + nearestColumn * this.columnWidth);
        }
        
        if (nearestRow >= 0 && nearestRow <= 8) {
            this.showHorizontalGuide(20 + nearestRow * this.rowHeight);
        }
    }
    
    showVerticalGuide(x) {
        let guide = this.canvas.querySelector('.temp-vertical-guide');
        if (!guide) {
            guide = document.createElement('div');
            guide.className = 'temp-vertical-guide';
            guide.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: 0;
                width: 1px;
                height: 100%;
                background: var(--secondary);
                opacity: 0.6;
                pointer-events: none;
                z-index: 15;
                box-shadow: 0 0 4px rgba(0, 216, 255, 0.8);
            `;
            this.canvas.appendChild(guide);
        } else {
            guide.style.left = `${x}px`;
        }
        
        // Auto-hide after delay
        clearTimeout(this.verticalGuideTimeout);
        this.verticalGuideTimeout = setTimeout(() => {
            if (guide.parentNode) {
                guide.parentNode.removeChild(guide);
            }
        }, this.isDragging ? 0 : 1000);
    }
    
    showHorizontalGuide(y) {
        let guide = this.canvas.querySelector('.temp-horizontal-guide');
        if (!guide) {
            guide = document.createElement('div');
            guide.className = 'temp-horizontal-guide';
            guide.style.cssText = `
                position: absolute;
                left: 0;
                top: ${y}px;
                width: 100%;
                height: 1px;
                background: var(--secondary);
                opacity: 0.6;
                pointer-events: none;
                z-index: 15;
                box-shadow: 0 0 4px rgba(0, 216, 255, 0.8);
            `;
            this.canvas.appendChild(guide);
        } else {
            guide.style.top = `${y}px`;
        }
        
        // Auto-hide after delay
        clearTimeout(this.horizontalGuideTimeout);
        this.horizontalGuideTimeout = setTimeout(() => {
            if (guide.parentNode) {
                guide.parentNode.removeChild(guide);
            }
        }, this.isDragging ? 0 : 1000);
    }
    
    updateCursor(e) {
        if (this.isDragging) return;
        
        if (e.target.classList.contains('grid-box')) {
            this.canvas.style.cursor = 'grab';
        } else if (e.target.classList.contains('resize-handle')) {
            // Cursor is handled by CSS
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    
    // Touch event handlers for mobile support
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
                cancelable: true
            });
            e.target.dispatchEvent(mouseEvent);
        }
        e.preventDefault();
    }
    
    handleTouchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(mouseEvent);
        }
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(mouseEvent);
        e.preventDefault();
    }
    
    // Copy/Paste functionality
    copy(box) {
        this.clipboard = {
            gridColumn: box.gridColumn,
            gridRow: box.gridRow,
            gridColumnSpan: box.gridColumnSpan,
            gridRowSpan: box.gridRowSpan,
            backgroundColor: box.backgroundColor,
            padding: { ...box.padding },
            margin: { ...box.margin }
        };
    }
    
    paste() {
        if (!this.clipboard) return;
        
        const boxElement = this.app.createBoxElement();
        const box = {
            id: this.app.generateId(),
            element: boxElement,
            gridColumn: this.clipboard.gridColumn,
            gridRow: this.clipboard.gridRow,
            gridColumnSpan: this.clipboard.gridColumnSpan,
            gridRowSpan: this.clipboard.gridRowSpan,
            backgroundColor: this.clipboard.backgroundColor,
            padding: { ...this.clipboard.padding },
            margin: { ...this.clipboard.margin }
        };
        
        this.app.boxes.push(box);
        this.canvas.appendChild(boxElement);
        this.app.updateBoxStyle(box);
        this.app.updateCodePreview();
        this.app.saveState();
        this.app.selectBox(box);
        
        this.app.showToast('Box pasted successfully!', 'success');
    }
    
    // Z-index management
    sendToBack(box) {
        box.element.style.zIndex = '1';
        this.app.showToast('Box sent to back!', 'success');
    }
    
    bringToFront(box) {
        box.element.style.zIndex = '10';
        this.app.showToast('Box brought to front!', 'success');
    }
    
    // Grid alignment helpers
    alignToGrid(box) {
        // Snap box to nearest grid lines
        const rect = box.element.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const relativeX = rect.left - canvasRect.left - 20;
        const relativeY = rect.top - canvasRect.top - 20;
        
        const nearestColumn = Math.round(relativeX / this.columnWidth) + 1;
        const nearestRow = Math.round(relativeY / this.rowHeight) + 1;
        
        box.gridColumn = Math.max(1, Math.min(12, nearestColumn));
        box.gridRow = Math.max(1, Math.min(8, nearestRow));
        
        this.app.updateBoxStyle(box);
        this.app.updateInspector();
    }
    
    // Performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Cleanup
    destroy() {
        this.hideContextMenu();
        this.hideSnapIndicators();
        
        // Remove temporary guides
        const tempGuides = this.canvas.querySelectorAll('.temp-vertical-guide, .temp-horizontal-guide');
        tempGuides.forEach(guide => guide.remove());
        
        // Clear timeouts
        clearTimeout(this.verticalGuideTimeout);
        clearTimeout(this.horizontalGuideTimeout);
    }
}

// Initialize canvas controller when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.flexifyApp) {
        window.flexifyApp.canvasController = new CanvasController(window.flexifyApp);
    }
});
    