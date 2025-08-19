// Advanced Animation Controller for S Shobana Enterprises
class AnimationController {
    constructor() {
        this.observers = new Map();
        this.activeAnimations = new Set();
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupLoadingAnimations();
        this.setupParticleSystem();
        this.setupMorphingAnimations();
    }

    // Advanced Scroll Animations
    setupScrollAnimations() {
        // Create different observers for different animation types
        this.createScrollObserver('fade', this.fadeInAnimation.bind(this));
        this.createScrollObserver('slide', this.slideInAnimation.bind(this));
        this.createScrollObserver('scale', this.scaleInAnimation.bind(this));
        this.createScrollObserver('rotate', this.rotateInAnimation.bind(this));
        this.createScrollObserver('stagger', this.staggerAnimation.bind(this));
    }

    createScrollObserver(type, callback) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.observers.set(type, observer);
        
        // Observe elements
        document.querySelectorAll(`[data-animation="${type}"]`).forEach(el => {
            observer.observe(el);
        });
    }

    fadeInAnimation(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    slideInAnimation(element) {
        const direction = element.dataset.direction || 'up';
        const distance = element.dataset.distance || '50px';
        
        let transform;
        switch(direction) {
            case 'left': transform = `translateX(-${distance})`; break;
            case 'right': transform = `translateX(${distance})`; break;
            case 'down': transform = `translateY(${distance})`; break;
            default: transform = `translateY(${distance})`;
        }
        
        element.style.opacity = '0';
        element.style.transform = transform;
        element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0)';
        });
    }

    scaleInAnimation(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    rotateInAnimation(element) {
        const rotation = element.dataset.rotation || '180deg';
        
        element.style.opacity = '0';
        element.style.transform = `rotate(${rotation})`;
        element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'rotate(0)';
        });
    }

    staggerAnimation(element) {
        const children = Array.from(element.children);
        const delay = parseFloat(element.dataset.delay) || 100;
        
        children.forEach((child, index) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';
            child.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            }, index * delay);
        });
    }

    // Hover Animations
    setupHoverAnimations() {
        this.setupServiceCardHovers();
        this.setupProjectHovers();
        this.setupButtonHovers();
    }

    setupServiceCardHovers() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            let tilt = { x: 0, y: 0 };
            
            card.addEventListener('mouseenter', (e) => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                
                this.animateServiceIcon(card);
            });
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                tilt.x = (y / rect.height) * 10;
                tilt.y = -(x / rect.width) * 10;
                
                card.style.transform = `translateY(-10px) scale(1.02) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
                card.style.boxShadow = 'var(--shadow-sm)';
            });
        });
    }

    animateServiceIcon(card) {
        const icon = card.querySelector('.service-icon');
        if (!icon) return;
        
        icon.style.animation = 'none';
        icon.offsetHeight; // Trigger reflow
        icon.style.animation = 'bounce 0.6s ease-in-out';
    }

    setupProjectHovers() {
        const projectItems = document.querySelectorAll('.project-item');
        
        projectItems.forEach(item => {
            const image = item.querySelector('.project-image');
            const overlay = item.querySelector('.project-overlay');
            
            item.addEventListener('mouseenter', () => {
                if (image) {
                    image.style.transform = 'scale(1.1)';
                    image.style.filter = 'brightness(0.8)';
                }
                
                if (overlay) {
                    overlay.style.opacity = '1';
                }
                
                this.createImageParticles(item);
            });
            
            item.addEventListener('mouseleave', () => {
                if (image) {
                    image.style.transform = 'scale(1)';
                    image.style.filter = 'brightness(1)';
                }
                
                if (overlay) {
                    overlay.style.opacity = '0';
                }
            });
        });
    }

    setupButtonHovers() {
        const buttons = document.querySelectorAll('.btn, .service-btn, .filter-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.createButtonGlow(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonGlow(button);
            });
        });
    }

    createButtonGlow(button) {
        const glow = document.createElement('div');
        glow.className = 'button-glow';
        glow.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            animation: glowPulse 2s ease-in-out infinite;
        `;
        
        button.style.position = 'relative';
        button.appendChild(glow);
        
        setTimeout(() => {
            glow.style.opacity = '0.7';
        }, 10);
    }

    removeButtonGlow(button) {
        const glow = button.querySelector('.button-glow');
        if (glow) {
            glow.style.opacity = '0';
            setTimeout(() => {
                glow.remove();
            }, 300);
        }
    }

    // Loading Animations
    setupLoadingAnimations() {
        this.createConstructionLoader();
        this.animateProgressIndicators();
    }

    createConstructionLoader() {
        // This enhances the existing loader with more complex animations
        const excavatorLoader = document.querySelector('.excavator-loader');
        if (!excavatorLoader) return;
        
        // Add dust particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'dust-particle';
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: #8B4513;
                border-radius: 50%;
                animation: dustFly ${2 + Math.random() * 2}s ease-out infinite;
                animation-delay: ${Math.random() * 2}s;
                left: ${20 + Math.random() * 60}px;
                bottom: ${Math.random() * 20}px;
            `;
            excavatorLoader.appendChild(particle);
        }
    }

    animateProgressIndicators() {
        const indicators = document.querySelectorAll('.progress-indicator');
        
        indicators.forEach(indicator => {
            const fill = indicator.querySelector('.progress-fill');
            const target = parseInt(indicator.dataset.target) || 100;
            
            let progress = 0;
            const increment = target / 100;
            
            const animate = () => {
                progress += increment;
                if (progress <= target) {
                    fill.style.width = `${progress}%`;
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        });
    }

    // Particle System
    setupParticleSystem() {
        this.createBackgroundParticles();
        this.setupInteractiveParticles();
    }

    createBackgroundParticles() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        `;
        
        hero.appendChild(particleContainer);
        
        // Create floating particles
        for (let i = 0; i < 50; i++) {
            this.createFloatingParticle(particleContainer);
        }
    }

    createFloatingParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        const size = Math.random() * 4 + 1;
        const x = Math.random() * window.innerWidth;
        const duration = Math.random() * 20 + 10;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 210, 63, 0.3);
            border-radius: 50%;
            left: ${x}px;
            bottom: -10px;
            animation: floatUp ${duration}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        container.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
            this.createFloatingParticle(container);
        }, duration * 1000);
    }

    setupInteractiveParticles() {
        document.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.9) { // Only create particles occasionally
                this.createMouseParticle(e.clientX, e.clientY);
            }
        });
    }

    createMouseParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: mouseParticleFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    createImageParticles(element) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                width: 4px;
                height: 4px;
                background: var(--accent-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: sparkle 0.8s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
    }

    // Morphing Animations
    setupMorphingAnimations() {
        this.createMorphingBackground();
        this.setupTextMorphing();
    }

    createMorphingBackground() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const morphing = document.createElement('div');
        morphing.className = 'morphing-background';
        morphing.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                var(--primary-color), 
                var(--secondary-color), 
                var(--accent-color));
            background-size: 400% 400%;
            opacity: 0.1;
            animation: morphingGradient 15s ease infinite;
            z-index: 1;
        `;
        
        hero.insertBefore(morphing, hero.firstChild);
    }

    setupTextMorphing() {
        const morphingTexts = document.querySelectorAll('[data-morph-text]');
        
        morphingTexts.forEach(element => {
            const texts = element.dataset.morphText.split(',');
            let currentIndex = 0;
            
            const morphText = () => {
                const currentText = element.textContent;
                const nextText = texts[currentIndex];
                
                this.morphTextAnimation(element, currentText, nextText);
                
                currentIndex = (currentIndex + 1) % texts.length;
                setTimeout(morphText, 4000);
            };
            
            setTimeout(morphText, 2000);
        });
    }

    morphTextAnimation(element, fromText, toText) {
        const maxLength = Math.max(fromText.length, toText.length);
        let frame = 0;
        
        const animate = () => {
            let result = '';
            
            for (let i = 0; i < maxLength; i++) {
                const progress = Math.min(frame / 20, 1);
                
                if (Math.random() < progress) {
                    result += toText[i] || '';
                } else {
                    result += fromText[i] || '';
                }
            }
            
            element.textContent = result;
            
            if (frame < 20) {
                frame++;
                setTimeout(animate, 50);
            } else {
                element.textContent = toText;
            }
        };
        
        animate();
    }

    // Utility Methods
    addAnimationStyles() {
        const styles = `
            @keyframes glowPulse {
                0%, 100% { opacity: 0.7; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
            }
            
            @keyframes dustFly {
                0% { 
                    opacity: 1; 
                    transform: translateY(0) translateX(0) rotate(0deg); 
                }
                100% { 
                    opacity: 0; 
                    transform: translateY(-50px) translateX(20px) rotate(180deg); 
                }
            }
            
            @keyframes floatUp {
                0% { 
                    opacity: 0; 
                    transform: translateY(0) rotate(0deg); 
                }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { 
                    opacity: 0; 
                    transform: translateY(-100vh) rotate(360deg); 
                }
            }
            
            @keyframes mouseParticleFloat {
                0% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0.5) translateY(-20px); 
                }
            }
            
            @keyframes sparkle {
                0% { 
                    opacity: 1; 
                    transform: scale(0) rotate(0deg); 
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1) rotate(180deg); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0) rotate(360deg); 
                }
            }
            
            @keyframes morphingGradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animationController = new AnimationController();
    animationController.addAnimationStyles();
});
