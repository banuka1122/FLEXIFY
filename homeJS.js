// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const bgAnimation = document.getElementById('bgAnimation');
const sections = document.querySelectorAll('.section');
const timelineItems = document.querySelectorAll('.timeline-item');
const featureCards = document.querySelectorAll('.feature-card[data-tilt]');

// State
let isMenuOpen = false;
let mouseX = 0;
let mouseY = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollAnimations();
    initNavigation();
    initTiltEffect();
    initButtonEffects();
    initParallax();
});

// Animated Background Particles
function createParticles() {
    const particleCount = window.innerWidth > 768 ? 60 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning and animation properties
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        
        // Random size variation
        const size = 1 + Math.random() * 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        bgAnimation.appendChild(particle);
    }
}

// Navigation
function initNavigation() {
    // Mobile menu toggle
    navToggle.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Auto-hide on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Stagger timeline items
                if (entry.target.classList.contains('timeline-item')) {
                    const delay = Array.from(timelineItems).indexOf(entry.target) * 200;
                    setTimeout(() => {
                        entry.target.style.transitionDelay = '0ms';
                    }, delay);
                }
            }
        });
    }, observerOptions);
    
    // Observe sections and timeline items
    sections.forEach(section => observer.observe(section));
    timelineItems.forEach(item => observer.observe(item));
}

// 3D Tilt Effect for Feature Cards
function initTiltEffect() {
    featureCards.forEach(card => {
        card.addEventListener('mousemove', handleCardTilt);
        card.addEventListener('mouseleave', resetCardTilt);
    });
}

function handleCardTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = (e.clientY - centerY) / 10;
    const rotateY = (centerX - e.clientX) / 10;
    
    card.style.transform = `
        translateY(-10px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale(1.02)
    `;
}

function resetCardTilt(e) {
    const card = e.currentTarget;
    card.style.transform = '';
}

// Enhanced Button Effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        // Add ripple effect
        btn.addEventListener('click', createRipple);
        
        // Enhanced hover effects
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 20px 40px var(--accent-glow), 0 0 30px var(--accent-cyan)';
        });
        
        btn.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!this.matches(':hover')) {
                    this.style.boxShadow = '';
                }
            }, 300);
        });
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Parallax Effects
function initParallax() {
    const parallaxElements = [
        { element: document.querySelector('.hero'), speed: 0.5 },
        { element: document.querySelector('.hero-glow'), speed: 0.3 },
        { element: document.querySelector('.cta-bg-glow'), speed: 0.2 }
    ].filter(item => item.element);
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(({ element, speed }) => {
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    // Throttled scroll handler for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Mouse tracking for enhanced interactivity
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update CSS custom properties for mouse-following effects
    document.documentElement.style.setProperty('--mouse-x', mouseX + 'px');
    document.documentElement.style.setProperty('--mouse-y', mouseY + 'px');
});

// Smooth scroll utility
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Enhanced smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Pricing card interactions
function initPricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = this.classList.contains('pricing-featured') 
                ? 'scale(1.05) translateY(-10px)' 
                : 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('pricing-featured') 
                ? 'scale(1.05)' 
                : '';
        });
    });
}

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = counter.textContent;
                const isPercentage = target.includes('%');
                const isInfinity = target.includes('∞');
                const hasPlus = target.includes('+');
                
                if (isInfinity) return; // Skip infinity symbol
                
                const numericTarget = parseInt(target.replace(/[^\d]/g, ''));
                let current = 0;
                const increment = numericTarget / 60; // 60 frames for 1 second animation
                
                const updateCounter = () => {
                    if (current < numericTarget) {
                        current += increment;
                        const displayValue = Math.floor(current);
                        counter.textContent = displayValue + 
                            (hasPlus ? 'K+' : '') + 
                            (isPercentage ? '%' : '');
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target; // Ensure final value is correct
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', () => {
    initPricingCards();
    animateCounters();
});

// Performance optimization: Reduce particles on mobile
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && bgAnimation.children.length > 30) {
        // Remove excess particles on mobile
        const particles = Array.from(bgAnimation.children);
        particles.slice(30).forEach(particle => particle.remove());
    }
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape' && isMenuOpen) {
        toggleMobileMenu();
    }
    
    // Navigate with arrow keys (accessibility enhancement)
    if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        const currentSection = getCurrentSection();
        const nextSection = getNextSection(currentSection);
        if (nextSection) {
            scrollToSection(nextSection.id);
        }
    }
    
    if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        const currentSection = getCurrentSection();
        const prevSection = getPrevSection(currentSection);
        if (prevSection) {
            scrollToSection(prevSection.id);
        }
    }
});

function getCurrentSection() {
    const scrollPosition = window.pageYOffset + 100;
    
    for (let section of sections) {
        if (section.offsetTop <= scrollPosition && 
            section.offsetTop + section.offsetHeight > scrollPosition) {
            return section;
        }
    }
    return sections[0];
}

function getNextSection(current) {
    const allSections = Array.from(document.querySelectorAll('section'));
    const currentIndex = allSections.indexOf(current);
    return allSections[currentIndex + 1] || null;
}

function getPrevSection(current) {
    const allSections = Array.from(document.querySelectorAll('section'));
    const currentIndex = allSections.indexOf(current);
    return allSections[currentIndex - 1] || null;
}

// Error handling for images and external resources
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.warn('Image failed to load:', e.target.src);
        // Could add fallback image here
    }
}, true);

// Page visibility API for performance optimization
document.addEventListener('visibilitychange', () => {
    const particles = document.querySelectorAll('.particle');
    
    if (document.hidden) {
        // Pause animations when page is not visible
        particles.forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations when page becomes visible
        particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }
});

// Console easter egg for developers
console.log(`
%c
███████╗██╗     ███████╗██╗  ██╗██╗███████╗██╗   ██╗
██╔════╝██║     ██╔════╝╚██╗██╔╝██║██╔════╝╚██╗ ██╔╝
█████╗  ██║     █████╗   ╚███╔╝ ██║█████╗   ╚████╔╝ 
██╔══╝  ██║     ██╔══╝   ██╔██╗ ██║██╔══╝    ╚██╔╝  
██║     ███████╗███████╗██╔╝ ██╗██║██║        ██║   
╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   

%cThe Future of CSS Layouts
%cLike what you see? We're hiring talented developers!
Visit flexify.dev/careers

`, 'color: #00D8FF; font-weight: bold;', 'color: #00D8FF; font-size: 16px;', 'color: #888; font-size: 12px;');