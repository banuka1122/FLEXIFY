// ===== PRESETS CONTROLLER =====
class PresetsController {
    constructor(app) {
        this.app = app;
        this.presets = this.getBuiltinPresets();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadCustomPresets();
    }
    
    setupEventListeners() {
        // Preset menu items
        document.querySelectorAll('.preset-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const presetType = e.currentTarget.dataset.preset;
                this.loadPreset(presetType);
                this.app.uiController.closeAllDropdowns();
            });
        });
    }
    
    getBuiltinPresets() {
        return {
            dashboard: {
                name: 'Dashboard Layout',
                description: 'Modern dashboard with header, sidebar, and main content area',
                boxes: [
                    {
                        id: 'header',
                        gridColumn: 1,
                        gridRow: 1,
                        gridColumnSpan: 12,
                        gridRowSpan: 1,
                        backgroundColor: '#1E2A78',
                        padding: { top: 20, right: 24, bottom: 20, left: 24 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'sidebar',
                        gridColumn: 1,
                        gridRow: 2,
                        gridColumnSpan: 2,
                        gridRowSpan: 7,
                        backgroundColor: '#334155',
                        padding: { top: 24, right: 20, bottom: 24, left: 20 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'main-content',
                        gridColumn: 3,
                        gridRow: 2,
                        gridColumnSpan: 7,
                        gridRowSpan: 5,
                        backgroundColor: '#FDFDFD',
                        padding: { top: 32, right: 32, bottom: 32, left: 32 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'widget-panel',
                        gridColumn: 10,
                        gridRow: 2,
                        gridColumnSpan: 3,
                        gridRowSpan: 7,
                        backgroundColor: '#00D8FF',
                        padding: { top: 24, right: 20, bottom: 24, left: 20 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'footer-content',
                        gridColumn: 3,
                        gridRow: 7,
                        gridColumnSpan: 7,
                        gridRowSpan: 2,
                        backgroundColor: '#E2E8F0',
                        padding: { top: 20, right: 32, bottom: 20, left: 32 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    }
                ],
                viewport: 'desktop'
            },
            
            gallery: {
                name: '3x3 Gallery Grid',
                description: 'Perfect for image galleries, portfolios, or product showcases',
                boxes: [
                    {
                        id: 'gallery-header',
                        gridColumn: 1,
                        gridRow: 1,
                        gridColumnSpan: 12,
                        gridRowSpan: 1,
                        backgroundColor: '#1E2A78',
                        padding: { top: 24, right: 32, bottom: 24, left: 32 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-1',
                        gridColumn: 2,
                        gridRow: 2,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#00D8FF',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-2',
                        gridColumn: 5,
                        gridRow: 2,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#0099CC',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-3',
                        gridColumn: 8,
                        gridRow: 2,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#00BFFF',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-4',
                        gridColumn: 2,
                        gridRow: 4,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#20B2AA',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-5',
                        gridColumn: 5,
                        gridRow: 4,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#48CAE4',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-6',
                        gridColumn: 8,
                        gridRow: 4,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#00CED1',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-7',
                        gridColumn: 2,
                        gridRow: 6,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#40E0D0',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-8',
                        gridColumn: 5,
                        gridRow: 6,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#00E5FF',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'gallery-item-9',
                        gridColumn: 8,
                        gridRow: 6,
                        gridColumnSpan: 3,
                        gridRowSpan: 2,
                        backgroundColor: '#87CEEB',
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    }
                ],
                viewport: 'desktop'
            },
            
            blog: {
                name: 'Blog Layout',
                description: 'Classic blog layout with header, two-column content, and footer',
                boxes: [
                    {
                        id: 'blog-header',
                        gridColumn: 1,
                        gridRow: 1,
                        gridColumnSpan: 12,
                        gridRowSpan: 1,
                        backgroundColor: '#1E2A78',
                        padding: { top: 32, right: 48, bottom: 32, left: 48 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'blog-navigation',
                        gridColumn: 1,
                        gridRow: 2,
                        gridColumnSpan: 12,
                        gridRowSpan: 1,
                        backgroundColor: '#334155',
                        padding: { top: 16, right: 48, bottom: 16, left: 48 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'main-article',
                        gridColumn: 2,
                        gridRow: 3,
                        gridColumnSpan: 8,
                        gridRowSpan: 4,
                        backgroundColor: '#FDFDFD',
                        padding: { top: 48, right: 40, bottom: 48, left: 40 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'sidebar-widgets',
                        gridColumn: 10,
                        gridRow: 3,
                        gridColumnSpan: 3,
                        gridRowSpan: 4,
                        backgroundColor: '#E2E8F0',
                        padding: { top: 32, right: 24, bottom: 32, left: 24 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    },
                    {
                        id: 'blog-footer',
                        gridColumn: 1,
                        gridRow: 7,
                        gridColumnSpan: 12,
                        gridRowSpan: 2,
                        backgroundColor: '#64748B',
                        padding: { top: 40, right: 48, bottom: 40, left: 48 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 }
                    }
                ],
                viewport: 'desktop'
            }
        };
    }
    
    loadPreset(presetType) {
        const preset = this.presets[presetType];
        if (!preset) {
            this.app.showToast('Preset not found!', 'error');
            return;
        }
        
        // Clear existing layout
        this.app.boxes.forEach(box => box.element.remove());
        this.app.boxes = [];
        this.app.selectedBox = null;
        
        // Switch to preset viewport
        this.app.switchViewport(preset.viewport);
        
        // Create boxes from preset
        preset.boxes.forEach((boxData, index) => {
            const boxElement = this.app.createBoxElement();
            
            // Update box label
            const label = boxElement.querySelector('.box-number');
            if (label) {
                label.textContent = this.getBoxLabel(boxData.id, index + 1);
            }
            
            const box = {
                id: this.app.generateId(),
                element: boxElement,
                gridColumn: boxData.gridColumn,
                gridRow: boxData.gridRow,
                gridColumnSpan: boxData.gridColumnSpan,
                gridRowSpan: boxData.gridRowSpan,
                backgroundColor: boxData.backgroundColor,
                padding: { ...boxData.padding },
                margin: { ...boxData.margin },
                presetId: boxData.id // Store original preset ID for reference
            };
            
            this.app.boxes.push(box);
            document.getElementById('canvas').appendChild(boxElement);
            this.app.updateBoxStyle(box);
        });
        
        // Update UI
        this.app.selectBox(null);
        this.app.updateCodePreview();
        this.app.saveState();
        
        // Show success message with animation
        this.showPresetLoadedMessage(preset.name);
    }
    
    getBoxLabel(presetId, fallbackIndex) {
        const labels = {
            'header': 'Header',
            'sidebar': 'Sidebar',
            'main-content': 'Main Content',
            'widget-panel': 'Widgets',
            'footer-content': 'Footer',
            'blog-header': 'Blog Header',
            'blog-navigation': 'Navigation',
            'main-article': 'Article',
            'sidebar-widgets': 'Sidebar',
            'blog-footer': 'Footer',
            'gallery-header': 'Gallery Title',
            'gallery-item-1': 'Image 1',
            'gallery-item-2': 'Image 2',
            'gallery-item-3': 'Image 3',
            'gallery-item-4': 'Image 4',
            'gallery-item-5': 'Image 5',
            'gallery-item-6': 'Image 6',
            'gallery-item-7': 'Image 7',
            'gallery-item-8': 'Image 8',
            'gallery-item-9': 'Image 9'
        };
        
        return labels[presetId] || `Box ${fallbackIndex}`;
    }
    
    showPresetLoadedMessage(presetName) {
        // Create animated notification
        const notification = document.createElement('div');
        notification.className = 'preset-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: rgba(30, 42, 120, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 16px;
            padding: 24px 32px;
            color: var(--accent);
            font-size: 16px;
            font-weight: 600;
            z-index: 9999;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 216, 255, 0.2);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                <span>${presetName} loaded successfully!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Animate out
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 2000);
        
        // Also show toast
        this.app.showToast(`${presetName} loaded!`, 'success');
    }
    
    loadCustomPresets() {
        try {
            const customPresets = JSON.parse(localStorage.getItem('flexify_custom_presets') || '{}');
            this.presets = { ...this.presets, ...customPresets };
            
            // Add custom presets to UI if any exist
            if (Object.keys(customPresets).length > 0) {
                this.addCustomPresetsToUI(customPresets);
            }
        } catch (error) {
            console.error('Error loading custom presets:', error);
        }
    }
    
    addCustomPresetsToUI(customPresets) {
        const presetMenu = document.querySelector('.preset-menu');
        if (!presetMenu) return;
        
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'preset-separator';
        separator.style.cssText = `
            height: 1px;
            background: rgba(0, 216, 255, 0.2);
            margin: 8px 12px;
        `;
        presetMenu.appendChild(separator);
        
        // Add custom preset items
        Object.entries(customPresets).forEach(([key, preset]) => {
            const item = document.createElement('div');
            item.className = 'preset-item custom-preset';
            item.dataset.preset = key;
            item.innerHTML = `
                <i class="fas fa-star"></i>
                <div>
                    <span>${preset.name}</span>
                    <small style="display: block; opacity: 0.7; font-size: 11px;">Custom</small>
                </div>
                <button class="delete-preset-btn" data-preset="${key}" style="
                    background: none;
                    border: none;
                    color: var(--error);
                    cursor: pointer;
                    padding: 4px;
                    margin-left: auto;
                    opacity: 0.6;
                    transition: opacity 0.2s ease;
                ">
                    <i class="fas fa-trash" style="font-size: 12px;"></i>
                </button>
            `;
            
            // Add event listeners
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-preset-btn')) {
                    this.loadPreset(key);
                    this.app.uiController.closeAllDropdowns();
                }
            });
            
            const deleteBtn = item.querySelector('.delete-preset-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCustomPreset(key);
            });
            
            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.opacity = '1';
            });
            
            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.opacity = '0.6';
            });
            
            presetMenu.appendChild(item);
        });
    }
    
    saveCurrentAsPreset() {
        if (this.app.boxes.length === 0) {
            this.app.showToast('No boxes to save as preset!', 'error');
            return;
        }
        
        // Show save preset modal
        this.showSavePresetModal();
    }
    
    showSavePresetModal() {
        const modal = document.createElement('div');
        modal.className = 'modal save-preset-modal active';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: rgba(30, 42, 120, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 216, 255, 0.3);
                border-radius: 20px;
                max-width: 400px;
                width: 90%;
            ">
                <div class="modal-header" style="
                    padding: 24px 24px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(0, 216, 255, 0.2);
                ">
                    <h2 style="font-size: 20px; font-weight: 600; color: var(--accent);">Save as Preset</h2>
                    <button class="modal-close" style="
                        background: transparent;
                        border: none;
                        color: var(--gray-medium);
                        font-size: 18px;
                        cursor: pointer;
                        padding: 8px;
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 24px;">
                    <form class="save-preset-form">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="preset-name" style="
                                display: block;
                                margin-bottom: 8px;
                                font-size: 14px;
                                font-weight: 600;
                                color: var(--accent);
                            ">Preset Name *</label>
                            <input type="text" id="preset-name" required style="
                                width: 100%;
                                background: rgba(253, 253, 253, 0.05);
                                border: 1px solid rgba(0, 216, 255, 0.2);
                                border-radius: 8px;
                                padding: 12px;
                                color: var(--accent);
                                font-size: 14px;
                            ">
                        </div>
                        <div class="form-group" style="margin-bottom: 24px;">
                            <label for="preset-description" style="
                                display: block;
                                margin-bottom: 8px;
                                font-size: 14px;
                                font-weight: 600;
                                color: var(--accent);
                            ">Description</label>
                            <textarea id="preset-description" rows="3" style="
                                width: 100%;
                                background: rgba(253, 253, 253, 0.05);
                                border: 1px solid rgba(0, 216, 255, 0.2);
                                border-radius: 8px;
                                padding: 12px;
                                color: var(--accent);
                                font-size: 14px;
                                resize: vertical;
                            " placeholder="Optional description for this preset..."></textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" class="cancel-btn" style="
                                background: rgba(253, 253, 253, 0.1);
                                border: 1px solid rgba(0, 216, 255, 0.2);
                                color: var(--accent);
                                padding: 12px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: all 0.2s ease;
                            ">Cancel</button>
                            <button type="submit" class="save-btn" style="
                                background: linear-gradient(135deg, var(--secondary), #0099CC);
                                border: none;
                                color: var(--dark);
                                padding: 12px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                                transition: all 0.2s ease;
                            ">Save Preset</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const form = modal.querySelector('.save-preset-form');
        const nameInput = modal.querySelector('#preset-name');
        const descInput = modal.querySelector('#preset-description');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        // Focus name input
        setTimeout(() => nameInput.focus(), 100);
        
        // Close handlers
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 200);
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = nameInput.value.trim();
            const description = descInput.value.trim();
            
            if (name) {
                this.saveCustomPreset(name, description);
                closeModal();
            }
        });
        
        // Input validation
        nameInput.addEventListener('input', () => {
            const saveBtn = modal.querySelector('.save-btn');
            saveBtn.disabled = !nameInput.value.trim();
            saveBtn.style.opacity = nameInput.value.trim() ? '1' : '0.6';
        });
    }
    
    saveCustomPreset(name, description) {
        const presetId = 'custom_' + Date.now();
        const preset = {
            name,
            description,
            created: new Date().toISOString(),
            boxes: this.app.boxes.map(box => ({
                id: box.id,
                gridColumn: box.gridColumn,
                gridRow: box.gridRow,
                gridColumnSpan: box.gridColumnSpan,
                gridRowSpan: box.gridRowSpan,
                backgroundColor: box.backgroundColor,
                padding: { ...box.padding },
                margin: { ...box.margin }
            })),
            viewport: this.app.currentViewport
        };
        
        // Save to localStorage
        const customPresets = JSON.parse(localStorage.getItem('flexify_custom_presets') || '{}');
        customPresets[presetId] = preset;
        localStorage.setItem('flexify_custom_presets', JSON.stringify(customPresets));
        
        // Add to current presets
        this.presets[presetId] = preset;
        
        // Update UI
        this.refreshPresetMenu();
        
        this.app.showToast('Preset saved successfully!', 'success');
    }
    
    deleteCustomPreset(presetId) {
        if (!confirm('Are you sure you want to delete this preset? This action cannot be undone.')) {
            return;
        }
        
        // Remove from localStorage
        const customPresets = JSON.parse(localStorage.getItem('flexify_custom_presets') || '{}');
        delete customPresets[presetId];
        localStorage.setItem('flexify_custom_presets', JSON.stringify(customPresets));
        
        // Remove from current presets
        delete this.presets[presetId];
        
        // Update UI
        this.refreshPresetMenu();
        
        this.app.showToast('Preset deleted successfully!', 'success');
    }
    
    refreshPresetMenu() {
        const presetMenu = document.querySelector('.preset-menu');
        if (!presetMenu) return;
        
        // Clear existing items
        presetMenu.innerHTML = '';
        
        // Add built-in presets
        const builtinPresets = this.getBuiltinPresets();
        Object.entries(builtinPresets).forEach(([key, preset]) => {
            const item = document.createElement('div');
            item.className = 'preset-item';
            item.dataset.preset = key;
            item.innerHTML = `
                <i class="fas fa-layer-group"></i>
                <span>${preset.name}</span>
            `;
            
            item.addEventListener('click', (e) => {
                this.loadPreset(key);
                this.app.uiController.closeAllDropdowns();
            });
            
            presetMenu.appendChild(item);
        });
        
        // Add custom presets
        const customPresets = JSON.parse(localStorage.getItem('flexify_custom_presets') || '{}');
        if (Object.keys(customPresets).length > 0) {
            this.addCustomPresetsToUI(customPresets);
        }
        
        // Add save current layout option
        const separator = document.createElement('div');
        separator.className = 'preset-separator';
        separator.style.cssText = `
            height: 1px;
            background: rgba(0, 216, 255, 0.2);
            margin: 8px 12px;
        `;
        presetMenu.appendChild(separator);
        
        const saveItem = document.createElement('div');
        saveItem.className = 'preset-item save-current';
        saveItem.innerHTML = `
            <i class="fas fa-save"></i>
            <span>Save Current Layout</span>
        `;
        
        saveItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveCurrentAsPreset();
            this.app.uiController.closeAllDropdowns();
        });
        
        presetMenu.appendChild(saveItem);
    }
    
    exportPresets() {
        const customPresets = JSON.parse(localStorage.getItem('flexify_custom_presets') || '{}');
        
        if (Object.keys(customPresets).length === 0) {
            this.app.showToast('No custom presets to export!', 'error');
            return;
        }
        
        const exportData = {
            version: '1.0.0',
            exported: new Date().toISOString(),
            presets: customPresets
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flexify-presets-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.app.showToast('Presets exported successfully!', 'success');
    }
    
    importPresets() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (!importData.presets || typeof importData.presets !== 'object') {
                        throw new Error('Invalid preset file format');
                    }
                    
                    // Merge with existing presets
                    const existingPresets = JSON.parse(localStorage.getItem('flexify_custom_presets') || '{}');
                    const mergedPresets = { ...existingPresets, ...importData.presets };
                    
                    localStorage.setItem('flexify_custom_presets', JSON.stringify(mergedPresets));
                    
                    // Update current presets
                    this.presets = { ...this.presets, ...importData.presets };
                    
                    // Refresh UI
                    this.refreshPresetMenu();
                    
                    const count = Object.keys(importData.presets).length;
                    this.app.showToast(`${count} preset(s) imported successfully!`, 'success');
                    
                } catch (error) {
                    console.error('Import error:', error);
                    this.app.showToast('Error importing presets!', 'error');
                }
            };
            
            reader.readAsText(file);
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
    
    getPresetPreview(presetType) {
        const preset = this.presets[presetType];
        if (!preset) return null;
        
        // Generate a small preview canvas
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        const cellWidth = canvas.width / 12;
        const cellHeight = canvas.height / 8;
        
        // Draw boxes
        preset.boxes.forEach(box => {
            const x = (box.gridColumn - 1) * cellWidth;
            const y = (box.gridRow - 1) * cellHeight;
            const width = box.gridColumnSpan * cellWidth;
            const height = box.gridRowSpan * cellHeight;
            
            ctx.fillStyle = box.backgroundColor;
            ctx.fillRect(x, y, width, height);
            
            // Add border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
        });
        
        return canvas.toDataURL();
    }
    
    // Initialize with enhanced preset menu
    init() {
        this.setupEventListeners();
        this.loadCustomPresets();
        this.refreshPresetMenu();
    }
}

// Initialize presets controller when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.flexifyApp) {
        window.flexifyApp.presetsController = new PresetsController(window.flexifyApp);
    }
});