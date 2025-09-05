// ===== FLEXIFY MAIN APP =====
class FlexifyApp {
    constructor() {
        this.boxes = [];
        this.selectedBox = null;
        this.history = [];
        this.historyIndex = -1;
        this.dragData = null;
        this.resizeData = null;
        this.currentViewport = 'desktop';
        this.showGrid = false;
        this.showGuides = false;
        this.guides = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.updateCodePreview();
        this.saveState();
        
        // Check if onboarding should be shown
        if (!localStorage.getItem('flexify_onboarding_completed')) {
            setTimeout(() => {
                document.getElementById('onboarding').classList.add('active');
            }, 500);
        }
    }
    
    setupEventListeners() {
        // Navbar controls
        document.querySelector('.add-box-btn').addEventListener('click', () => this.addBox());
        document.querySelector('.clear-btn').addEventListener('click', () => this.clearAll());
        document.querySelector('.toggle-grid').addEventListener('click', () => this.toggleGrid());
        document.querySelector('.toggle-guides').addEventListener('click', () => this.toggleGuides());
        document.querySelector('.undo-btn').addEventListener('click', () => this.undo());
        document.querySelector('.redo-btn').addEventListener('click', () => this.redo());
        document.querySelector('.save-layout').addEventListener('click', () => this.saveLayout());
        document.querySelector('.load-layout').addEventListener('click', () => this.loadLayout());
        document.querySelector('#load-layout').addEventListener('change', (e) => this.handleLoadFile(e));
        
        // Viewport switcher
        document.querySelectorAll('.viewport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewport = e.currentTarget.dataset.viewport;
                this.switchViewport(viewport);
            });
        });
        
        // Code tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.currentTarget.dataset.tab;
                this.switchCodeTab(tabType);
            });
        });
        
        // Canvas events
        const canvas = document.getElementById('canvas');
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        canvas.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Prevent default drag behavior on images and other elements
        document.addEventListener('dragstart', (e) => {
            if (!e.target.classList.contains('grid-box')) {
                e.preventDefault();
            }
        });
    }
    
    setupCanvas() {
        const canvas = document.getElementById('canvas');
        canvas.classList.add(this.currentViewport);
        this.updateCanvasSize();
    }
    
    addBox() {
        const canvas = document.getElementById('canvas');
        const boxElement = this.createBoxElement();
        
        // Find the next available grid position
        const gridPos = this.findAvailableGridPosition();
        
        const box = {
            id: this.generateId(),
            element: boxElement,
            gridColumn: gridPos.column,
            gridRow: gridPos.row,
            gridColumnSpan: 1,
            gridRowSpan: 1,
            backgroundColor: '#00D8FF',
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        };
        
        this.boxes.push(box);
        canvas.appendChild(boxElement);
        
        this.updateBoxStyle(box);
        this.updateCodePreview();
        this.saveState();
        
        // Auto-select the new box
        this.selectBox(box);
        
        this.showToast('Box added successfully!', 'success');
    }
    
    createBoxElement() {
        const box = document.createElement('div');
        box.className = 'grid-box';
        box.draggable = true;
        
        // Add resize handles
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(handle => {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = `resize-handle resize-${handle}`;
            box.appendChild(resizeHandle);
        });
        
        // Add box number
        const boxNumber = document.createElement('span');
        boxNumber.className = 'box-number';
        boxNumber.textContent = `Box ${this.boxes.length + 1}`;
        box.appendChild(boxNumber);
        
        // Event listeners for the box
        box.addEventListener('click', (e) => this.handleBoxClick(e));
        box.addEventListener('dragstart', (e) => this.handleDragStart(e));
        box.addEventListener('dragend', (e) => this.handleDragEnd(e));
        
        // Resize handle events
        box.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => this.handleResizeStart(e));
        });
        
        return box;
    }
    
    findAvailableGridPosition() {
        const gridColumns = 12;
        const gridRows = 8;
        
        for (let row = 1; row <= gridRows; row++) {
            for (let col = 1; col <= gridColumns; col++) {
                if (!this.isPositionOccupied(col, row)) {
                    return { column: col, row: row };
                }
            }
        }
        
        // If no position found, return the first position
        return { column: 1, row: 1 };
    }
    
    isPositionOccupied(column, row) {
        return this.boxes.some(box => {
            const boxEndCol = box.gridColumn + box.gridColumnSpan - 1;
            const boxEndRow = box.gridRow + box.gridRowSpan - 1;
            
            return column >= box.gridColumn && column <= boxEndCol &&
                   row >= box.gridRow && row <= boxEndRow;
        });
    }
    
    updateBoxStyle(box) {
        const element = box.element;
        
        element.style.gridColumn = `${box.gridColumn} / span ${box.gridColumnSpan}`;
        element.style.gridRow = `${box.gridRow} / span ${box.gridRowSpan}`;
        element.style.backgroundColor = box.backgroundColor;
        element.style.padding = `${box.padding.top}px ${box.padding.right}px ${box.padding.bottom}px ${box.padding.left}px`;
        element.style.margin = `${box.margin.top}px ${box.margin.right}px ${box.margin.bottom}px ${box.margin.left}px`;
    }
    
    selectBox(box) {
        // Remove selection from all boxes
        this.boxes.forEach(b => b.element.classList.remove('selected'));
        document.querySelector('.no-selection').style.display = 'flex';
        document.querySelector('.box-inspector').style.display = 'none';
        
        if (box) {
            box.element.classList.add('selected');
            this.selectedBox = box;
            this.updateInspector();
            
            document.querySelector('.no-selection').style.display = 'none';
            document.querySelector('.box-inspector').style.display = 'block';
        } else {
            this.selectedBox = null;
        }
    }
    
    updateInspector() {
        if (!this.selectedBox) return;
        
        const box = this.selectedBox;
        
        document.getElementById('grid-column').value = box.gridColumn;
        document.getElementById('grid-row').value = box.gridRow;
        document.getElementById('grid-column-span').value = box.gridColumnSpan;
        document.getElementById('grid-row-span').value = box.gridRowSpan;
        document.getElementById('bg-color').value = this.rgbToHex(box.backgroundColor);
        document.getElementById('padding-top').value = box.padding.top;
        document.getElementById('padding-right').value = box.padding.right;
        document.getElementById('padding-bottom').value = box.padding.bottom;
        document.getElementById('padding-left').value = box.padding.left;
        document.getElementById('margin-top').value = box.margin.top;
        document.getElementById('margin-right').value = box.margin.right;
        document.getElementById('margin-bottom').value = box.margin.bottom;
        document.getElementById('margin-left').value = box.margin.left;
        
        // Add inspector change listeners
        this.setupInspectorListeners();
    }
    
    setupInspectorListeners() {
        const inputs = [
            'grid-column', 'grid-row', 'grid-column-span', 'grid-row-span',
            'bg-color', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
        ];
        
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.removeEventListener('input', this.handleInspectorChange);
                input.addEventListener('input', (e) => this.handleInspectorChange(e));
            }
        });
        
        document.querySelector('.delete-box-btn').removeEventListener('click', this.deleteSelectedBox);
        document.querySelector('.delete-box-btn').addEventListener('click', () => this.deleteSelectedBox());
    }
    
    handleInspectorChange(e) {
        if (!this.selectedBox) return;
        
        const box = this.selectedBox;
        const input = e.target;
        const value = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
        
        switch (input.id) {
            case 'grid-column':
                box.gridColumn = Math.max(1, Math.min(12, value));
                break;
            case 'grid-row':
                box.gridRow = Math.max(1, Math.min(8, value));
                break;
            case 'grid-column-span':
                box.gridColumnSpan = Math.max(1, Math.min(12 - box.gridColumn + 1, value));
                break;
            case 'grid-row-span':
                box.gridRowSpan = Math.max(1, Math.min(8 - box.gridRow + 1, value));
                break;
            case 'bg-color':
                box.backgroundColor = value;
                break;
            case 'padding-top':
                box.padding.top = value;
                break;
            case 'padding-right':
                box.padding.right = value;
                break;
            case 'padding-bottom':
                box.padding.bottom = value;
                break;
            case 'padding-left':
                box.padding.left = value;
                break;
            case 'margin-top':
                box.margin.top = value;
                break;
            case 'margin-right':
                box.margin.right = value;
                break;
            case 'margin-bottom':
                box.margin.bottom = value;
                break;
            case 'margin-left':
                box.margin.left = value;
                break;
        }
        
        this.updateBoxStyle(box);
        this.updateCodePreview();
        this.saveState();
    }
    
    deleteSelectedBox() {
        if (!this.selectedBox) return;
        
        const boxIndex = this.boxes.indexOf(this.selectedBox);
        if (boxIndex > -1) {
            this.selectedBox.element.remove();
            this.boxes.splice(boxIndex, 1);
            this.selectedBox = null;
            
            this.selectBox(null);
            this.updateCodePreview();
            this.saveState();
            
            this.showToast('Box deleted successfully!', 'success');
        }
    }
    
    clearAll() {
        if (this.boxes.length === 0) return;
        
        if (confirm('Are you sure you want to clear all boxes? This action cannot be undone.')) {
            this.boxes.forEach(box => box.element.remove());
            this.boxes = [];
            this.selectedBox = null;
            this.selectBox(null);
            this.updateCodePreview();
            this.saveState();
            
            this.showToast('All boxes cleared!', 'success');
        }
    }
    
    handleBoxClick(e) {
        e.stopPropagation();
        const boxElement = e.currentTarget;
        const box = this.boxes.find(b => b.element === boxElement);
        this.selectBox(box);
    }
    
    handleCanvasClick(e) {
        if (e.target.id === 'canvas' || e.target.classList.contains('grid-overlay')) {
            this.selectBox(null);
        }
    }
    
    handleDragStart(e) {
        const boxElement = e.currentTarget;
        const box = this.boxes.find(b => b.element === boxElement);
        
        this.dragData = {
            box: box,
            startX: e.clientX,
            startY: e.clientY,
            startColumn: box.gridColumn,
            startRow: box.gridRow
        };
        
        boxElement.classList.add('dragging');
        this.selectBox(box);
    }
    
    handleDragEnd(e) {
        if (this.dragData) {
            this.dragData.box.element.classList.remove('dragging');
            this.dragData = null;
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        if (this.dragData) {
            const canvas = document.getElementById('canvas');
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const columnWidth = (canvas.clientWidth - 40) / 12; // 40px total padding
            const rowHeight = (canvas.clientHeight - 40) / 8;
            
            const column = Math.max(1, Math.min(12, Math.floor((x - 20) / columnWidth) + 1));
            const row = Math.max(1, Math.min(8, Math.floor((y - 20) / rowHeight) + 1));
            
            if (column !== this.dragData.box.gridColumn || row !== this.dragData.box.gridRow) {
                this.dragData.box.gridColumn = column;
                this.dragData.box.gridRow = row;
                this.updateBoxStyle(this.dragData.box);
                this.updateInspector();
            }
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        if (this.dragData) {
            this.updateCodePreview();
            this.saveState();
        }
    }
    
    handleResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const handle = e.currentTarget;
        const boxElement = handle.parentElement;
        const box = this.boxes.find(b => b.element === boxElement);
        
        this.resizeData = {
            box: box,
            startX: e.clientX,
            startY: e.clientY,
            startColumnSpan: box.gridColumnSpan,
            startRowSpan: box.gridRowSpan,
            handle: handle.classList[1] // resize-nw, resize-ne, etc.
        };
        
        this.selectBox(box);
        
        const handleMouseMove = (e) => this.handleResize(e);
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            this.resizeData = null;
            this.updateCodePreview();
            this.saveState();
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    handleResize(e) {
        if (!this.resizeData) return;
        
        const deltaX = e.clientX - this.resizeData.startX;
        const deltaY = e.clientY - this.resizeData.startY;
        
        const canvas = document.getElementById('canvas');
        const columnWidth = (canvas.clientWidth - 40) / 12;
        const rowHeight = (canvas.clientHeight - 40) / 8;
        
        const columnsChanged = Math.round(deltaX / columnWidth);
        const rowsChanged = Math.round(deltaY / rowHeight);
        
        const box = this.resizeData.box;
        const handle = this.resizeData.handle;
        
        if (handle.includes('se')) {
            box.gridColumnSpan = Math.max(1, Math.min(12 - box.gridColumn + 1, this.resizeData.startColumnSpan + columnsChanged));
            box.gridRowSpan = Math.max(1, Math.min(8 - box.gridRow + 1, this.resizeData.startRowSpan + rowsChanged));
        } else if (handle.includes('sw')) {
            const newColumnSpan = Math.max(1, this.resizeData.startColumnSpan - columnsChanged);
            const maxColumn = Math.min(12, box.gridColumn + box.gridColumnSpan - 1);
            box.gridColumn = Math.max(1, maxColumn - newColumnSpan + 1);
            box.gridColumnSpan = newColumnSpan;
            box.gridRowSpan = Math.max(1, Math.min(8 - box.gridRow + 1, this.resizeData.startRowSpan + rowsChanged));
        } else if (handle.includes('ne')) {
            box.gridColumnSpan = Math.max(1, Math.min(12 - box.gridColumn + 1, this.resizeData.startColumnSpan + columnsChanged));
            const newRowSpan = Math.max(1, this.resizeData.startRowSpan - rowsChanged);
            const maxRow = Math.min(8, box.gridRow + box.gridRowSpan - 1);
            box.gridRow = Math.max(1, maxRow - newRowSpan + 1);
            box.gridRowSpan = newRowSpan;
        } else if (handle.includes('nw')) {
            const newColumnSpan = Math.max(1, this.resizeData.startColumnSpan - columnsChanged);
            const maxColumn = Math.min(12, box.gridColumn + box.gridColumnSpan - 1);
            box.gridColumn = Math.max(1, maxColumn - newColumnSpan + 1);
            box.gridColumnSpan = newColumnSpan;
            
            const newRowSpan = Math.max(1, this.resizeData.startRowSpan - rowsChanged);
            const maxRow = Math.min(8, box.gridRow + box.gridRowSpan - 1);
            box.gridRow = Math.max(1, maxRow - newRowSpan + 1);
            box.gridRowSpan = newRowSpan;
        }
        
        this.updateBoxStyle(box);
        this.updateInspector();
    }
    
    switchViewport(viewport) {
        document.querySelectorAll('.viewport-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-viewport="${viewport}"]`).classList.add('active');
        
        const canvas = document.getElementById('canvas');
        canvas.classList.remove('desktop', 'tablet', 'mobile');
        canvas.classList.add(viewport);
        
        this.currentViewport = viewport;
        this.updateCanvasSize();
    }
    
    updateCanvasSize() {
        const canvas = document.getElementById('canvas');
        const wrapper = canvas.parentElement;
        
        // Smooth transition for canvas size changes
        canvas.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            canvas.style.transition = '';
        }, 500);
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        const canvas = document.getElementById('canvas');
        
        if (this.showGrid) {
            canvas.classList.add('show-grid');
            document.querySelector('.toggle-grid').classList.add('active');
        } else {
            canvas.classList.remove('show-grid');
            document.querySelector('.toggle-grid').classList.remove('active');
        }
    }
    
    toggleGuides() {
        this.showGuides = !this.showGuides;
        const guidesContainer = document.querySelector('.guides-container');
        
        if (this.showGuides) {
            this.createGuides();
            document.querySelector('.toggle-guides').classList.add('active');
        } else {
            guidesContainer.innerHTML = '';
            document.querySelector('.toggle-guides').classList.remove('active');
        }
    }
    
    createGuides() {
        const guidesContainer = document.querySelector('.guides-container');
        guidesContainer.innerHTML = '';
        
        // Create horizontal guides
        for (let i = 1; i < 8; i++) {
            const guide = document.createElement('div');
            guide.className = 'guide-line horizontal visible';
            guide.style.top = `${(i / 8) * 100}%`;
            guidesContainer.appendChild(guide);
        }
        
        // Create vertical guides
        for (let i = 1; i < 12; i++) {
            const guide = document.createElement('div');
            guide.className = 'guide-line vertical visible';
            guide.style.left = `${(i / 12) * 100}%`;
            guidesContainer.appendChild(guide);
        }
    }
    
    switchCodeTab(tabType) {
        document.querySelectorAll('.code-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
        
        document.querySelectorAll('.code-block').forEach(block => block.classList.remove('active'));
        document.querySelector(`.${tabType}-code`).classList.add('active');
    }
    
    updateCodePreview() {
        const htmlCode = this.generateHTML();
        const cssCode = this.generateCSS();
        
        document.getElementById('html-preview').textContent = htmlCode;
        document.getElementById('css-preview').textContent = cssCode;
    }
    
    generateHTML() {
        const canvas = document.getElementById('canvas');
        const viewportClass = this.currentViewport;
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexify Generated Layout</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="grid-container ${viewportClass}">`;
        
        this.boxes.forEach((box, index) => {
            html += `
        <div class="grid-item item-${index + 1}">
            <span>Box ${index + 1}</span>
        </div>`;
        });
        
        html += `
    </div>
</body>
</html>`;
        
        return html;
    }
    
    generateCSS() {
        let css = `.grid-container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(8, 1fr);
    gap: 16px;
    padding: 20px;
    min-height: 100vh;
    background-color: #FAFAFA;
}

.grid-container.desktop {
    width: 1200px;
    height: 800px;
    margin: 0 auto;
}

.grid-container.tablet {
    width: 768px;
    height: 1024px;
    margin: 0 auto;
}

.grid-container.mobile {
    width: 375px;
    height: 667px;
    margin: 0 auto;
}

.grid-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

`;
        
        this.boxes.forEach((box, index) => {
            const itemClass = `.item-${index + 1}`;
            css += `${itemClass} {
    grid-column: ${box.gridColumn} / span ${box.gridColumnSpan};
    grid-row: ${box.gridRow} / span ${box.gridRowSpan};
    background-color: ${box.backgroundColor};
    padding: ${box.padding.top}px ${box.padding.right}px ${box.padding.bottom}px ${box.padding.left}px;
    margin: ${box.margin.top}px ${box.margin.right}px ${box.margin.bottom}px ${box.margin.left}px;
    color: ${this.getContrastColor(box.backgroundColor)};
}

`;
        });
        
        return css;
    }
    
    getContrastColor(backgroundColor) {
        // Convert hex to RGB
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        
        const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        
        return rgb;
    }
    
    saveState() {
        const state = {
            boxes: this.boxes.map(box => ({
                id: box.id,
                gridColumn: box.gridColumn,
                gridRow: box.gridRow,
                gridColumnSpan: box.gridColumnSpan,
                gridRowSpan: box.gridRowSpan,
                backgroundColor: box.backgroundColor,
                padding: { ...box.padding },
                margin: { ...box.margin }
            })),
            viewport: this.currentViewport,
            showGrid: this.showGrid,
            showGuides: this.showGuides
        };
        
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.stringify(state));
        this.historyIndex++;
        
        // Limit history to 50 states
        if (this.history.length > 50) {
            this.history = this.history.slice(-50);
            this.historyIndex = 49;
        }
        
        this.updateHistoryButtons();
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.updateHistoryButtons();
            this.showToast('Undo successful!', 'success');
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.updateHistoryButtons();
            this.showToast('Redo successful!', 'success');
        }
    }
    
    restoreState(stateStr) {
        const state = JSON.parse(stateStr);
        
        // Clear current boxes
        this.boxes.forEach(box => box.element.remove());
        this.boxes = [];
        this.selectedBox = null;
        
        // Restore boxes
        state.boxes.forEach(boxData => {
            const boxElement = this.createBoxElement();
            const box = {
                id: boxData.id,
                element: boxElement,
                gridColumn: boxData.gridColumn,
                gridRow: boxData.gridRow,
                gridColumnSpan: boxData.gridColumnSpan,
                gridRowSpan: boxData.gridRowSpan,
                backgroundColor: boxData.backgroundColor,
                padding: { ...boxData.padding },
                margin: { ...boxData.margin }
            };
            
            this.boxes.push(box);
            document.getElementById('canvas').appendChild(boxElement);
            this.updateBoxStyle(box);
        });
        
        // Restore viewport
        this.switchViewport(state.viewport);
        
        // Restore grid and guides
        if (state.showGrid !== this.showGrid) this.toggleGrid();
        if (state.showGuides !== this.showGuides) this.toggleGuides();
        
        this.selectBox(null);
        this.updateCodePreview();
    }
    
    updateHistoryButtons() {
        const undoBtn = document.querySelector('.undo-btn');
        const redoBtn = document.querySelector('.redo-btn');
        
        if (this.historyIndex <= 0) {
            undoBtn.style.opacity = '0.5';
            undoBtn.style.pointerEvents = 'none';
        } else {
            undoBtn.style.opacity = '1';
            undoBtn.style.pointerEvents = 'auto';
        }
        
        if (this.historyIndex >= this.history.length - 1) {
            redoBtn.style.opacity = '0.5';
            redoBtn.style.pointerEvents = 'none';
        } else {
            redoBtn.style.opacity = '1';
            redoBtn.style.pointerEvents = 'auto';
        }
    }
    
    saveLayout() {
        const state = {
            boxes: this.boxes.map(box => ({
                id: box.id,
                gridColumn: box.gridColumn,
                gridRow: box.gridRow,
                gridColumnSpan: box.gridColumnSpan,
                gridRowSpan: box.gridRowSpan,
                backgroundColor: box.backgroundColor,
                padding: { ...box.padding },
                margin: { ...box.margin }
            })),
            viewport: this.currentViewport,
            showGrid: this.showGrid,
            showGuides: this.showGuides,
            metadata: {
                name: 'Flexify Layout',
                created: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flexify-layout-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Layout saved successfully!', 'success');
    }
    
    loadLayout() {
        document.getElementById('load-layout').click();
    }
    
    handleLoadFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                this.restoreState(JSON.stringify(state));
                this.saveState(); // Add to history
                this.showToast('Layout loaded successfully!', 'success');
            } catch (error) {
                this.showToast('Error loading layout file!', 'error');
                console.error('Error loading layout:', error);
            }
        };
        reader.readAsText(file);
    }
    
    handleKeyboard(e) {
        // Prevent shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveLayout();
                    break;
                case 'o':
                    e.preventDefault();
                    this.loadLayout();
                    break;
                case 'd':
                    e.preventDefault();
                    if (this.selectedBox) {
                        this.duplicateBox(this.selectedBox);
                    }
                    break;
            }
        }
        
        // Delete selected box
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.selectedBox) {
                e.preventDefault();
                this.deleteSelectedBox();
            }
        }
        
        // Add new box
        if (e.key === 'a' || e.key === 'A') {
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.addBox();
            }
        }
    }
    
    duplicateBox(box) {
        const newBox = {
            id: this.generateId(),
            element: this.createBoxElement(),
            gridColumn: Math.min(12, box.gridColumn + 1),
            gridRow: Math.min(8, box.gridRow + 1),
            gridColumnSpan: box.gridColumnSpan,
            gridRowSpan: box.gridRowSpan,
            backgroundColor: box.backgroundColor,
            padding: { ...box.padding },
            margin: { ...box.margin }
        };
        
        this.boxes.push(newBox);
        document.getElementById('canvas').appendChild(newBox.element);
        this.updateBoxStyle(newBox);
        this.updateCodePreview();
        this.saveState();
        this.selectBox(newBox);
        
        this.showToast('Box duplicated successfully!', 'success');
    }
    
    generateId() {
        return 'box_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.flexifyApp = new FlexifyApp();
});