// ===== UI CONTROLLER =====
class UIController {
    constructor(app) {
        this.app = app;
        this.feedbackModal = document.getElementById('feedback-modal');
        this.activeDropdown = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupTooltips();
        this.setupFeedbackForm();
        this.setupKeyboardNavigation();
        this.setupThemeToggle();
    }
    
    setupEventListeners() {
        // Dropdown toggles
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const button = dropdown.querySelector('.nav-btn');
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(dropdown);
            });
        });
        
        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
        
        // Feedback modal
        document.querySelector('.feedback-btn').addEventListener('click', () => {
            this.showFeedbackModal();
        });
        
        this.feedbackModal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideFeedbackModal());
        });
        
        this.feedbackModal.addEventListener('click', (e) => {
            if (e.target === this.feedbackModal) {
                this.hideFeedbackModal();
            }
        });
        
        // Panel resize handlers
        this.setupPanelResize();
        
        // Smooth scrolling for code preview
        this.setupSmoothScrolling();
        
        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));
    }
    
    setupTooltips() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(15, 20, 25, 0.95);
            color: var(--accent);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(5px);
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 216, 255, 0.2);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            white-space: nowrap;
        `;
        document.body.appendChild(this.tooltip);
        
        // Add tooltip listeners to all elements with title attribute
        document.querySelectorAll('[title]').forEach(element => {
            const title = element.getAttribute('title');
            element.removeAttribute('title'); // Remove default tooltip
            element.setAttribute('data-tooltip', title);
            
            element.addEventListener('mouseenter', (e) => this.showTooltip(e, title));
            element.addEventListener('mouseleave', () => this.hideTooltip());
            element.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
        });
    }
    
    showTooltip(e, text) {
        this.tooltip.textContent = text;
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(0)';
        this.updateTooltipPosition(e);
    }
    
    hideTooltip() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'translateY(5px)';
    }
    
    updateTooltipPosition(e) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const margin = 10;
        
        let left = e.clientX - tooltipRect.width / 2;
        let top = e.clientY - tooltipRect.height - margin;
        
        // Keep tooltip within viewport
        if (left < margin) left = margin;
        if (left + tooltipRect.width > window.innerWidth - margin) {
            left = window.innerWidth - tooltipRect.width - margin;
        }
        if (top < margin) top = e.clientY + margin;
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }
    
    setupFeedbackForm() {
        const form = document.getElementById('feedback-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });
    }
    
    validateInput(input) {
        const value = input.value.trim();
        const isValid = this.isInputValid(input, value);
        
        input.classList.toggle('invalid', !isValid);
        
        // Update submit button state
        this.updateSubmitButtonState();
        
        return isValid;
    }
    
    isInputValid(input, value) {
        if (input.required && !value) return false;
        
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
        
        if (input.id === 'feedback-name') {
            return value.length >= 2;
        }
        
        if (input.id === 'feedback-message') {
            return value.length >= 10;
        }
        
        return true;
    }
    
    updateSubmitButtonState() {
        const form = document.getElementById('feedback-form');
        const submitBtn = form.querySelector('.submit-btn');
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        const allValid = Array.from(inputs).every(input => 
            this.isInputValid(input, input.value.trim())
        );
        
        submitBtn.disabled = !allValid;
        submitBtn.style.opacity = allValid ? '1' : '0.6';
    }
    
    async submitFeedback() {
        const form = document.getElementById('feedback-form');
        const submitBtn = form.querySelector('.submit-btn');
        const name = document.getElementById('feedback-name').value.trim();
        const email = document.getElementById('feedback-email').value.trim();
        const message = document.getElementById('feedback-message').value.trim();
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Store feedback in localStorage (in a real app, you'd send to a server)
            const feedback = {
                id: Date.now().toString(),
                name,
                email,
                message,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                layout: {
                    boxes: this.app.boxes.length,
                    viewport: this.app.currentViewport
                }
            };
            
            // Get existing feedback
            const existingFeedback = JSON.parse(localStorage.getItem('flexify_feedback') || '[]');
            existingFeedback.push(feedback);
            
            // Keep only last 100 feedback items
            if (existingFeedback.length > 100) {
                existingFeedback.splice(0, existingFeedback.length - 100);
            }
            
            localStorage.setItem('flexify_feedback', JSON.stringify(existingFeedback));
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success
            this.app.showToast('Feedback sent successfully! Thank you!', 'success');
            this.hideFeedbackModal();
            form.reset();
            this.updateSubmitButtonState();
            
        } catch (error) {
            console.error('Feedback submission error:', error);
            this.app.showToast('Failed to send feedback. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    toggleDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');
        
        // Close all dropdowns first
        this.closeAllDropdowns();
        
        // Toggle current dropdown
        if (!isActive) {
            dropdown.classList.add('active');
            this.activeDropdown = dropdown;
            
            // Focus first item
            const firstItem = dropdown.querySelector('.preset-item');
            if (firstItem) firstItem.focus();
        }
    }
    
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        this.activeDropdown = null;
    }
    
    showFeedbackModal() {
        this.feedbackModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = this.feedbackModal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    hideFeedbackModal() {
        this.feedbackModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals and dropdowns
            if (e.key === 'Escape') {
                if (this.feedbackModal.classList.contains('active')) {
                    this.hideFeedbackModal();
                } else if (this.activeDropdown) {
                    this.closeAllDropdowns();
                }
                return;
            }
            
            // Tab navigation in dropdowns
            if (this.activeDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                this.navigateDropdown(e.key === 'ArrowDown' ? 1 : -1);
            }
            
            // Enter key in dropdowns
            if (this.activeDropdown && e.key === 'Enter') {
                e.preventDefault();
                const focused = document.activeElement;
                if (focused && focused.classList.contains('preset-item')) {
                    focused.click();
                }
            }
        });
    }
    
    navigateDropdown(direction) {
        if (!this.activeDropdown) return;
        
        const items = this.activeDropdown.querySelectorAll('.preset-item');
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
        
        items[newIndex].focus();
    }
    
    setupPanelResize() {
        // Add resize handles to panels
        this.addResizeHandle('.left-panel', 'right');
        this.addResizeHandle('.right-panel', 'left');
        this.addResizeHandle('.bottom-panel', 'top');
    }
    
    addResizeHandle(selector, direction) {
        const panel = document.querySelector(selector);
        if (!panel) return;
        
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${direction}`;
        handle.style.cssText = `
            position: absolute;
            background: rgba(0, 216, 255, 0.1);
            cursor: ${direction === 'right' || direction === 'left' ? 'ew-resize' : 'ns-resize'};
            transition: background-color 0.2s ease;
            z-index: 10;
        `;
        
        if (direction === 'right') {
            handle.style.cssText += `
                top: 0;
                right: -3px;
                width: 6px;
                height: 100%;
            `;
        } else if (direction === 'left') {
            handle.style.cssText += `
                top: 0;
                left: -3px;
                width: 6px;
                height: 100%;
            `;
        } else if (direction === 'top') {
            handle.style.cssText += `
                top: -3px;
                left: 0;
                width: 100%;
                height: 6px;
            `;
        }
        
        handle.addEventListener('mouseenter', () => {
            handle.style.backgroundColor = 'rgba(0, 216, 255, 0.3)';
        });
        
        handle.addEventListener('mouseleave', () => {
            handle.style.backgroundColor = 'rgba(0, 216, 255, 0.1)';
        });
        
        panel.appendChild(handle);
        
        // Add resize functionality
        this.setupResizeDrag(handle, panel, direction);
    }
    
    setupResizeDrag(handle, panel, direction) {
        let isResizing = false;
        let startPos = 0;
        let startSize = 0;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startPos = direction === 'top' ? e.clientY : e.clientX;
            startSize = direction === 'top' ? panel.offsetHeight : panel.offsetWidth;
            
            document.body.style.cursor = handle.style.cursor;
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const currentPos = direction === 'top' ? e.clientY : e.clientX;
            let delta = currentPos - startPos;
            
            if (direction === 'left' || direction === 'top') {
                delta = -delta;
            }
            
            const newSize = Math.max(200, Math.min(600, startSize + delta));
            
            if (direction === 'top') {
                panel.style.height = `${newSize}px`;
                document.documentElement.style.setProperty('--bottom-panel-height', `${newSize}px`);
            } else {
                panel.style.width = `${newSize}px`;
                document.documentElement.style.setProperty('--panel-width', `${newSize}px`);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
    
    setupSmoothScrolling() {
        const codeBlocks = document.querySelectorAll('.code-block');
        codeBlocks.forEach(block => {
            block.style.scrollBehavior = 'smooth';
        });
    }
    
    setupThemeToggle() {
        // Future implementation for light/dark theme toggle
        this.currentTheme = 'dark';
        
        // Add theme toggle button (optional)
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(30, 42, 120, 0.9);
            border: 1px solid rgba(0, 216, 255, 0.3);
            color: var(--accent);
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
        `;
        
        themeToggle.addEventListener('mouseenter', () => {
            themeToggle.style.opacity = '1';
            themeToggle.style.transform = 'scale(1.1)';
        });
        
        themeToggle.addEventListener('mouseleave', () => {
            themeToggle.style.opacity = '0.7';
            themeToggle.style.transform = 'scale(1)';
        });
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Uncomment to add theme toggle
        // document.body.appendChild(themeToggle);
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light-theme', this.currentTheme === 'light');
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.currentTheme === 'light' ? 
                '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        
        // Save theme preference
        localStorage.setItem('flexify_theme', this.currentTheme);
        
        this.app.showToast(`Switched to ${this.currentTheme} theme`, 'success');
    }
    
    handleWindowResize() {
        // Update canvas controller dimensions
        if (this.app.canvasController) {
            this.app.canvasController.updateCanvasDimensions();
            this.app.canvasController.updateRulerMarks();
        }
        
        // Adjust UI layout for smaller screens
        this.adjustUIForScreenSize();
    }
    
    adjustUIForScreenSize() {
        const isSmallScreen = window.innerWidth < 1200;
        const isMobileScreen = window.innerWidth < 768;
        
        // Auto-collapse panels on small screens
        if (isMobileScreen) {
            this.collapsePanels();
        } else if (isSmallScreen) {
            this.adjustPanelSizes();
        }
        
        // Adjust navbar on mobile
        const navbar = document.querySelector('.navbar');
        if (isMobileScreen) {
            navbar.style.padding = '0 12px';
        } else {
            navbar.style.padding = '0 24px';
        }
    }
    
    collapsePanels() {
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');
        const bottomPanel = document.querySelector('.bottom-panel');
        
        if (leftPanel) leftPanel.style.width = '60px';
        if (rightPanel) rightPanel.style.width = '60px';
        if (bottomPanel) bottomPanel.style.height = '150px';
        
        // Hide panel content
        document.querySelectorAll('.panel-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show collapse indicators
        this.showCollapseIndicators();
    }
    
    adjustPanelSizes() {
        document.documentElement.style.setProperty('--panel-width', '220px');
        document.documentElement.style.setProperty('--bottom-panel-height', '250px');
    }
    
    showCollapseIndicators() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            if (!panel.querySelector('.collapse-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'collapse-indicator';
                indicator.innerHTML = '<i class="fas fa-chevron-right"></i>';
                indicator.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: var(--secondary);
                    cursor: pointer;
                    font-size: 18px;
                    transition: transform 0.2s ease;
                `;
                
                indicator.addEventListener('click', () => {
                    this.expandPanel(panel);
                });
                
                panel.appendChild(indicator);
            }
        });
    }
    
    expandPanel(panel) {
        panel.style.width = '';
        panel.style.height = '';
        
        const content = panel.querySelector('.panel-content');
        if (content) content.style.display = '';
        
        const indicator = panel.querySelector('.collapse-indicator');
        if (indicator) indicator.remove();
    }
    
    // Animation helpers
    animateElement(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-out`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
    
    // Accessibility helpers
    setupAccessibility() {
        // Add ARIA labels where needed
        document.querySelectorAll('.tool-btn, .nav-btn').forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const text = button.querySelector('span')?.textContent || 
                           button.getAttribute('title') || 
                           'Button';
                button.setAttribute('aria-label', text);
            }
        });
        
        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .tool-btn:focus,
            .nav-btn:focus,
            .export-option:focus,
            .preset-item:focus {
                outline: 2px solid var(--secondary);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
        
        // Announce state changes to screen readers
        this.setupAriaLiveRegion();
    }
    
    setupAriaLiveRegion() {
        const ariaLive = document.createElement('div');
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(ariaLive);
        
        this.ariaLiveRegion = ariaLive;
    }
    
    announceToScreenReader(message) {
        if (this.ariaLiveRegion) {
            this.ariaLiveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                this.ariaLiveRegion.textContent = '';
            }, 1000);
        }
    }
    
    // Context menu helpers
    showQuickActions(x, y) {
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        quickActions.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: rgba(30, 42, 120, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 12px;
            padding: 8px;
            display: flex;
            gap: 8px;
            z-index: 9999;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.2s ease;
        `;
        
        const actions = [
            { icon: 'fas fa-plus', action: () => this.app.addBox(), title: 'Add Box' },
            { icon: 'fas fa-copy', action: () => this.app.duplicateBox(this.app.selectedBox), title: 'Duplicate' },
            { icon: 'fas fa-trash', action: () => this.app.deleteSelectedBox(), title: 'Delete' },
            { icon: 'fas fa-eye', action: () => this.app.exportController.previewLayout(), title: 'Preview' }
        ];
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.innerHTML = `<i class="${action.icon}"></i>`;
            btn.title = action.title;
            btn.style.cssText = `
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(0, 216, 255, 0.1);
                color: var(--secondary);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(0, 216, 255, 0.3)';
                btn.style.transform = 'scale(1.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(0, 216, 255, 0.1)';
                btn.style.transform = 'scale(1)';
            });
            
            btn.addEventListener('click', () => {
                action.action();
                this.hideQuickActions();
            });
            
            quickActions.appendChild(btn);
        });
        
        document.body.appendChild(quickActions);
        
        // Show with animation
        requestAnimationFrame(() => {
            quickActions.style.transform = 'scale(1)';
            quickActions.style.opacity = '1';
        });
        
        // Auto-hide after delay
        setTimeout(() => this.hideQuickActions(), 3000);
        
        this.currentQuickActions = quickActions;
    }
    
    hideQuickActions() {
        if (this.currentQuickActions) {
            this.currentQuickActions.style.transform = 'scale(0.9)';
            this.currentQuickActions.style.opacity = '0';
            
            setTimeout(() => {
                if (this.currentQuickActions && this.currentQuickActions.parentNode) {
                    this.currentQuickActions.parentNode.removeChild(this.currentQuickActions);
                }
                this.currentQuickActions = null;
            }, 200);
        }
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        if (typeof PerformanceObserver !== 'undefined') {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        console.log(`${entry.name}: ${entry.duration}ms`);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
        
        // Monitor memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                    this.app.showToast('High memory usage detected', 'warning');
                }
            }, 30000); // Check every 30 seconds
        }
    }
    
    // Utility functions
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
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Cleanup
    destroy() {
        // Remove event listeners
        this.closeAllDropdowns();
        
        // Remove tooltip
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
        
        // Remove quick actions
        this.hideQuickActions();
        
        // Remove theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle && themeToggle.parentNode) {
            themeToggle.parentNode.removeChild(themeToggle);
        }
        
        // Reset body overflow
        document.body.style.overflow = '';
    }
}

// Initialize UI controller when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.flexifyApp) {
        window.flexifyApp.uiController = new UIController(window.flexifyApp);
        window.flexifyApp.uiController.setupAccessibility();
        window.flexifyApp.uiController.startPerformanceMonitoring();
    }
});