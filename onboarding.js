// ===== ONBOARDING CONTROLLER =====
class OnboardingController {
    constructor(app) {
        this.app = app;
        this.overlay = document.getElementById('onboarding');
        this.currentStep = 1;
        this.totalSteps = 4;
        this.highlights = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkOnboardingStatus();
    }
    
    setupEventListeners() {
        // Step navigation buttons
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
        
        document.querySelector('.finish-tour').addEventListener('click', () => {
            this.finishOnboarding();
        });
        
        // Skip onboarding (Escape key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.skipOnboarding();
            }
        });
        
        // Overlay click to skip
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.skipOnboarding();
            }
        });
    }
    
    checkOnboardingStatus() {
        const completed = localStorage.getItem('flexify_onboarding_completed');
        const skipCount = parseInt(localStorage.getItem('flexify_onboarding_skip_count') || '0');
        
        // Show onboarding if:
        // 1. Never completed and skip count < 3
        // 2. Or if explicitly requested
        if (!completed && skipCount < 3) {
            setTimeout(() => this.showOnboarding(), 1000);
        } else if (completed) {
            // Add a subtle hint for returning users
            this.showWelcomeBackHint();
        }
    }
    
    showOnboarding() {
        this.overlay.classList.add('active');
        this.currentStep = 1;
        this.showStep(1);
        
        // Disable main app interactions
        document.body.style.overflow = 'hidden';
        
        // Track onboarding start
        this.trackEvent('onboarding_started');
    }
    
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.onboarding-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepEl = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }
        
        // Update step indicator
        this.updateStepIndicator(stepNumber);
        
        // Add contextual highlights based on step
        this.addStepHighlights(stepNumber);
        
        // Update current step
        this.currentStep = stepNumber;
        
        // Track step view
        this.trackEvent('onboarding_step_viewed', { step: stepNumber });
    }
    
    updateStepIndicator(stepNumber) {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.step-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: 10;
        `;
        
        for (let i = 1; i <= this.totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = 'step-dot';
            dot.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${i === stepNumber ? 'var(--secondary)' : 'rgba(253, 253, 253, 0.3)'};
                transition: all 0.3s ease;
            `;
            
            if (i < stepNumber) {
                dot.style.background = 'var(--success)';
                dot.innerHTML = '<i class="fas fa-check" style="font-size: 8px; color: white; display: flex; align-items: center; justify-content: center; height: 100%;"></i>';
            }
            
            indicator.appendChild(dot);
        }
        
        this.overlay.querySelector('.onboarding-content').appendChild(indicator);
    }
    
    addStepHighlights(stepNumber) {
        // Clear existing highlights
        this.clearHighlights();
        
        let targetElement = null;
        let message = '';
        
        switch (stepNumber) {
            case 2:
                targetElement = document.querySelector('.add-box-btn');
                message = 'Click here to add new boxes to your layout';
                break;
            case 3:
                // Highlight canvas area
                targetElement = document.querySelector('.canvas-area');
                message = 'This is your main canvas where you create layouts';
                break;
            case 4:
                targetElement = document.querySelector('.export-btn');
                message = 'Export your finished layout as HTML & CSS';
                break;
        }
        
        if (targetElement) {
            this.highlightElement(targetElement, message);
        }
    }
    
    highlightElement(element, message) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        
        // Create highlight overlay
        const highlight = document.createElement('div');
        highlight.className = 'onboarding-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: ${rect.top - 8}px;
            left: ${rect.left - 8}px;
            width: ${rect.width + 16}px;
            height: ${rect.height + 16}px;
            border: 3px solid var(--secondary);
            border-radius: 12px;
            pointer-events: none;
            z-index: 2999;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            animation: pulse 2s infinite;
        `;
        
        document.body.appendChild(highlight);
        this.highlights.push(highlight);
        
        // Create tooltip
        if (message) {
            const tooltip = document.createElement('div');
            tooltip.className = 'onboarding-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                top: ${rect.bottom + 16}px;
                left: ${rect.left + rect.width / 2}px;
                transform: translateX(-50%);
                background: rgba(30, 42, 120, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 216, 255, 0.3);
                border-radius: 12px;
                padding: 12px 16px;
                color: var(--accent);
                font-size: 14px;
                max-width: 250px;
                text-align: center;
                z-index: 3000;
                box-shadow: 0 8px 32px rgba(0, 216, 255, 0.2);
                animation: fadeInUp 0.4s ease-out;
            `;
            
            // Add arrow
            const arrow = document.createElement('div');
            arrow.style.cssText = `
                position: absolute;
                top: -6px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid rgba(30, 42, 120, 0.95);
            `;
            
            tooltip.appendChild(arrow);
            tooltip.appendChild(document.createTextNode(message));
            
            // Adjust position if tooltip goes outside viewport
            document.body.appendChild(tooltip);
            const tooltipRect = tooltip.getBoundingClientRect();
            
            if (tooltipRect.right > window.innerWidth) {
                tooltip.style.left = `${window.innerWidth - tooltipRect.width - 16}px`;
                tooltip.style.transform = 'none';
                arrow.style.left = `${rect.left + rect.width / 2 - (window.innerWidth - tooltipRect.width - 16)}px`;
            }
            
            if (tooltipRect.left < 0) {
                tooltip.style.left = '16px';
                tooltip.style.transform = 'none';
                arrow.style.left = `${rect.left + rect.width / 2 - 16}px`;
            }
            
            this.highlights.push(tooltip);
        }
    }
    
    clearHighlights() {
        this.highlights.forEach(highlight => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        });
        this.highlights = [];
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        } else {
            this.finishOnboarding();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    finishOnboarding() {
        this.hideOnboarding();
        
        // Mark as completed
        localStorage.setItem('flexify_onboarding_completed', 'true');
        localStorage.setItem('flexify_onboarding_completed_date', new Date().toISOString());
        
        // Show completion message
        this.showCompletionMessage();
        
        // Track completion
        this.trackEvent('onboarding_completed', { 
            steps_completed: this.totalSteps,
            completion_time: Date.now() 
        });
        
        // Add first box as a welcome gift
        setTimeout(() => {
            this.app.addBox();
            this.app.showToast('Welcome to Flexify! Your first box has been added.', 'success');
        }, 1000);
    }
    
    skipOnboarding() {
        if (confirm('Are you sure you want to skip the tour? You can always access it later from the help menu.')) {
            this.hideOnboarding();
            
            // Track skip
            const skipCount = parseInt(localStorage.getItem('flexify_onboarding_skip_count') || '0') + 1;
            localStorage.setItem('flexify_onboarding_skip_count', skipCount.toString());
            
            this.trackEvent('onboarding_skipped', { 
                step: this.currentStep,
                skip_count: skipCount 
            });
            
            // Show skip message
            this.app.showToast('Tour skipped. You can restart it anytime from the help menu.', 'success');
        }
    }
    
    hideOnboarding() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.clearHighlights();
        
        // Reset step
        this.currentStep = 1;
        
        // Remove step indicator
        const indicator = document.querySelector('.step-indicator');
        if (indicator) indicator.remove();
    }
    
    showCompletionMessage() {
        const completion = document.createElement('div');
        completion.className = 'completion-message';
        completion.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: rgba(30, 42, 120, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            color: var(--accent);
            z-index: 9999;
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 40px rgba(0, 216, 255, 0.2);
            max-width: 400px;
            width: 90%;
        `;
        
        completion.innerHTML = `
            <div class="completion-icon" style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, var(--success), #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                animation: bounceIn 0.6s ease-out 0.3s both;
            ">
                <i class="fas fa-check" style="font-size: 32px; color: white;"></i>
            </div>
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: var(--accent);">
                🎉 Welcome to Flexify!
            </h2>
            <p style="font-size: 16px; color: var(--gray-light); line-height: 1.6; margin-bottom: 24px;">
                You're all set to create amazing CSS Grid layouts. Start by adding your first box!
            </p>
            <button class="get-started-btn" style="
                background: linear-gradient(135deg, var(--secondary), #0099CC);
                border: none;
                color: var(--dark);
                padding: 14px 28px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
            ">Get Started</button>
        `;
        
        document.body.appendChild(completion);
        
        // Animate in
        requestAnimationFrame(() => {
            completion.style.opacity = '1';
            completion.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Event listener for get started button
        completion.querySelector('.get-started-btn').addEventListener('click', () => {
            completion.style.opacity = '0';
            completion.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (completion.parentNode) {
                    completion.parentNode.removeChild(completion);
                }
            }, 500);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (completion.parentNode) {
                completion.style.opacity = '0';
                completion.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (completion.parentNode) {
                        completion.parentNode.removeChild(completion);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    showWelcomeBackHint() {
        const hint = document.createElement('div');
        hint.className = 'welcome-back-hint';
        hint.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(30, 42, 120, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 12px;
            padding: 16px 20px;
            color: var(--accent);
            font-size: 14px;
            z-index: 1000;
            max-width: 280px;
            box-shadow: 0 8px 25px rgba(0, 216, 255, 0.2);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        hint.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-lightbulb" style="color: var(--secondary); font-size: 16px;"></i>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Welcome back!</div>
                    <div style="font-size: 12px; opacity: 0.8;">Ready to create something amazing?</div>
                </div>
                <button class="close-hint" style="
                    background: none;
                    border: none;
                    color: var(--gray-medium);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.2s ease;
                ">
                    <i class="fas fa-times" style="font-size: 12px;"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // Animate in
        setTimeout(() => {
            hint.style.transform = 'translateX(0)';
            hint.style.opacity = '1';
        }, 2000);
        
        // Close button
        hint.querySelector('.close-hint').addEventListener('click', () => {
            hint.style.transform = 'translateX(100%)';
            hint.style.opacity = '0';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 400);
        });
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (hint.parentNode) {
                hint.style.transform = 'translateX(100%)';
                hint.style.opacity = '0';
                setTimeout(() => {
                    if (hint.parentNode) {
                        hint.parentNode.removeChild(hint);
                    }
                }, 400);
            }
        }, 8000);
    }
    
    // Restart onboarding (for help menu)
    restart() {
        // Clear completion status temporarily
        const wasCompleted = localStorage.getItem('flexify_onboarding_completed');
        localStorage.removeItem('flexify_onboarding_completed');
        
        this.showOnboarding();
        
        // Restore completion status after tour
        if (wasCompleted) {
            const originalFinish = this.finishOnboarding;
            this.finishOnboarding = () => {
                localStorage.setItem('flexify_onboarding_completed', 'true');
                this.hideOnboarding();
                this.app.showToast('Tour completed!', 'success');
                this.finishOnboarding = originalFinish;
            };
        }
        
        this.trackEvent('onboarding_restarted');
    }
    
    // Quick tips system
    showQuickTip(tipId, message, targetElement, position = 'bottom') {
        // Check if tip was already shown
        const shownTips = JSON.parse(localStorage.getItem('flexify_shown_tips') || '[]');
        if (shownTips.includes(tipId)) {
            return;
        }
        
        if (!targetElement) return;
        
        const rect = targetElement.getBoundingClientRect();
        const tip = document.createElement('div');
        tip.className = 'quick-tip';
        tip.style.cssText = `
            position: fixed;
            background: rgba(15, 20, 25, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            color: var(--accent);
            font-size: 13px;
            max-width: 200px;
            z-index: 9998;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        
        // Position the tip
        let top, left;
        if (position === 'bottom') {
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
            tip.style.transform = 'translateX(-50%) scale(0.9)';
        } else if (position === 'top') {
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
            tip.style.transform = 'translateX(-50%) translateY(-100%) scale(0.9)';
        } else if (position === 'right') {
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
            tip.style.transform = 'translateY(-50%) scale(0.9)';
        } else if (position === 'left') {
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
            tip.style.transform = 'translateX(-100%) translateY(-50%) scale(0.9)';
        }
        
        tip.style.top = `${top}px`;
        tip.style.left = `${left}px`;
        tip.textContent = message;
        
        document.body.appendChild(tip);
        
        // Animate in
        requestAnimationFrame(() => {
            tip.style.opacity = '1';
            tip.style.transform = tip.style.transform.replace('scale(0.9)', 'scale(1)');
        });
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            tip.style.opacity = '0';
            tip.style.transform = tip.style.transform.replace('scale(1)', 'scale(0.9)');
            setTimeout(() => {
                if (tip.parentNode) {
                    tip.parentNode.removeChild(tip);
                }
            }, 300);
        }, 4000);
        
        // Mark tip as shown
        shownTips.push(tipId);
        localStorage.setItem('flexify_shown_tips', JSON.stringify(shownTips));
    }
    
    // Contextual help system
    showContextualHelp() {
        const helpData = {
            'no-boxes': {
                condition: () => this.app.boxes.length === 0,
                message: 'Start by adding your first box using the "Add Box" button',
                target: '.add-box-btn'
            },
            'first-box-added': {
                condition: () => this.app.boxes.length === 1 && !this.app.selectedBox,
                message: 'Click on your box to select and customize it',
                target: '.grid-box'
            },
            'box-selected': {
                condition: () => this.app.selectedBox && this.app.boxes.length === 1,
                message: 'Use the right panel to customize your box properties',
                target: '.right-panel'
            },
            'multiple-boxes': {
                condition: () => this.app.boxes.length >= 3,
                message: 'Great! Try different viewport sizes using these buttons',
                target: '.viewport-switcher'
            },
            'ready-to-export': {
                condition: () => this.app.boxes.length >= 2,
                message: 'Your layout looks good! Ready to export?',
                target: '.export-btn'
            }
        };
        
        // Check conditions and show appropriate help
        for (const [id, help] of Object.entries(helpData)) {
            if (help.condition()) {
                const target = document.querySelector(help.target);
                if (target) {
                    setTimeout(() => {
                        this.showQuickTip(id, help.message, target);
                    }, 1000);
                }
                break; // Show only one tip at a time
            }
        }
    }
    
    // Analytics/tracking
    trackEvent(eventName, data = {}) {
        // In a real app, you'd send this to your analytics service
        const event = {
            event: eventName,
            timestamp: new Date().toISOString(),
            data: data,
            session: this.getSessionId()
        };
        
        console.log('Onboarding event:', event);
        
        // Store locally for demo purposes
        const events = JSON.parse(localStorage.getItem('flexify_onboarding_events') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('flexify_onboarding_events', JSON.stringify(events));
    }
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('flexify_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('flexify_session_id', sessionId);
        }
        return sessionId;
    }
    
    // Add help button to navbar (optional)
    addHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'nav-btn help-btn';
        helpButton.innerHTML = '<i class="fas fa-question-circle"></i><span>Help</span>';
        helpButton.title = 'Show help and tour';
        
        helpButton.addEventListener('click', () => {
            this.showHelpMenu();
        });
        
        // Insert before feedback button
        const feedbackBtn = document.querySelector('.feedback-btn');
        if (feedbackBtn && feedbackBtn.parentNode) {
            feedbackBtn.parentNode.insertBefore(helpButton, feedbackBtn);
        }
    }
    
    showHelpMenu() {
        const menu = document.createElement('div');
        menu.className = 'help-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 42, 120, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 216, 255, 0.3);
            border-radius: 16px;
            padding: 24px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 20px 40px rgba(0, 216, 255, 0.2);
        `;
        
        menu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: var(--accent); font-size: 18px; font-weight: 600;">Help & Support</h3>
                <button class="close-help" style="background: none; border: none; color: var(--gray-medium); cursor: pointer; font-size: 16px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="help-options">
                <button class="help-option restart-tour" style="
                    width: 100%;
                    background: rgba(0, 216, 255, 0.1);
                    border: 1px solid rgba(0, 216, 255, 0.3);
                    color: var(--accent);
                    padding: 12px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    text-align: left;
                    transition: all 0.2s ease;
                ">
                    <i class="fas fa-play-circle" style="margin-right: 12px; color: var(--secondary);"></i>
                    Restart Welcome Tour
                </button>
                <button class="help-option show-shortcuts" style="
                    width: 100%;
                    background: rgba(0, 216, 255, 0.1);
                    border: 1px solid rgba(0, 216, 255, 0.3);
                    color: var(--accent);
                    padding: 12px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    text-align: left;
                    transition: all 0.2s ease;
                ">
                    <i class="fas fa-keyboard" style="margin-right: 12px; color: var(--secondary);"></i>
                    Keyboard Shortcuts
                </button>
                <button class="help-option show-tips" style="
                    width: 100%;
                    background: rgba(0, 216, 255, 0.1);
                    border: 1px solid rgba(0, 216, 255, 0.3);
                    color: var(--accent);
                    padding: 12px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s ease;
                ">
                    <i class="fas fa-lightbulb" style="margin-right: 12px; color: var(--secondary);"></i>
                    Tips & Tricks
                </button>
            </div>
        `;
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(menu);
        
        // Event listeners
        const closeMenu = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(menu);
        };
        
        menu.querySelector('.close-help').addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        
        menu.querySelector('.restart-tour').addEventListener('click', () => {
            closeMenu();
            this.restart();
        });
        
        menu.querySelector('.show-shortcuts').addEventListener('click', () => {
            closeMenu();
            this.showKeyboardShortcuts();
        });
        
        menu.querySelector('.show-tips').addEventListener('click', () => {
            closeMenu();
            this.showTipsAndTricks();
        });
    }
    
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + Z', action: 'Undo' },
            { key: 'Ctrl/Cmd + Y', action: 'Redo' },
            { key: 'Ctrl/Cmd + S', action: 'Save Layout' },
            { key: 'Ctrl/Cmd + O', action: 'Load Layout' },
            { key: 'Ctrl/Cmd + E', action: 'Export' },
            { key: 'Delete/Backspace', action: 'Delete Selected Box' },
            { key: 'A', action: 'Add New Box' },
            { key: 'Escape', action: 'Close Modals' }
        ];
        
        this.showInfoModal('Keyboard Shortcuts', shortcuts.map(s => 
            `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <kbd style="background: rgba(0, 216, 255, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${s.key}</kbd>
                <span>${s.action}</span>
            </div>`
        ).join(''));
    }
    
    showTipsAndTricks() {
        const tips = [
            'Drag boxes to reposition them on the grid',
            'Use resize handles to change box dimensions',
            'Right-click for context menu options',
            'Toggle grid overlay for better alignment',
            'Try different viewport sizes for responsive design',
            'Save custom presets for reuse',
            'Use guides for precise positioning',
            'Double-click canvas to add box at position'
        ];
        
        this.showInfoModal('Tips & Tricks', tips.map((tip, i) => 
            `<div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <span style="background: var(--secondary); color: var(--dark); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">${i + 1}</span>
                <span>${tip}</span>
            </div>`
        ).join(''));
    }
    
    showInfoModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'info-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        modal.innerHTML = `
            <div style="
                background: rgba(30, 42, 120, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 216, 255, 0.3);
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="
                    padding: 24px 24px 16px;
                    border-bottom: 1px solid rgba(0, 216, 255, 0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="font-size: 20px; font-weight: 600; color: var(--accent);">${title}</h2>
                    <button class="close-modal" style="
                        background: none;
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
                <div style="padding: 24px; color: var(--gray-light);">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close functionality
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
}

// Initialize onboarding controller when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.flexifyApp) {
        window.flexifyApp.onboardingController = new OnboardingController(window.flexifyApp);
        
        // Add help button to navbar
        // window.flexifyApp.onboardingController.addHelpButton();
        
        // Set up contextual help monitoring
        setInterval(() => {
            if (window.flexifyApp.onboardingController) {
                window.flexifyApp.onboardingController.showContextualHelp();
            }
        }, 5000); // Check every 5 seconds
    }
});