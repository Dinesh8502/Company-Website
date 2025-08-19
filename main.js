// S Shobana Enterprises - Enhanced Professional Loading System v2.0

class ProfessionalLoader {
    constructor() {
        this.loader = document.getElementById('loader');
        this.mainContent = document.getElementById('main-content');
        this.statusText = document.querySelector('.loading-status-text');
        this.progressPercentage = document.querySelector('.progress-percentage');
        this.progressFill = document.querySelector('.progress-fill');
        this.brandLogo = document.querySelector('.brand-logo-img');
        
        this.loadingMessages = [
            'Preparing foundation systems...',
            'Loading construction resources...',
            'Initializing project management tools...',
            'Finalizing professional interface...',
            'Welcome to S Shobana Enterprises'
        ];
        
        this.currentProgress = 0;
        this.messageIndex = 0;
        this.loadingComplete = false;
        this.init();
    }

    init() {
        // Show loader immediately
        if (this.loader) {
            this.loader.style.display = 'flex';
            this.loader.classList.remove('hidden');
        } else {
            // Create loader if it doesn't exist
            this.createLoader();
        }

        // Hide main content initially
        if (this.mainContent) {
            this.mainContent.style.display = 'none';
        }

        this.hideScrollProgress();
        this.startLoading();
        
        // Handle page load completion
        if (document.readyState === 'complete') {
            setTimeout(() => this.completeLoading(), 1500);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.completeLoading(), 1500);
            });
        }
    }

    createLoader() {
        // Create loader HTML if it doesn't exist
        const loaderHTML = `
            <div id="loader" class="loader-wrapper">
                <div class="loading-brand">
                    <div class="loader-logo">
                        <img src="logo.png" alt="S Shobana Enterprises" class="brand-logo-img">
                    </div>
                    <h2 class="company-name-loading">S SHOBANA ENTERPRISES</h2>
                    <p class="company-tagline-loading">Building Tomorrow's Foundation Today</p>
                </div>
                <div class="progress-section">
                    <div class="loading-status-text">Preparing foundation systems...</div>
                    <div class="progress-container">
                        <div class="progress-bar progress-fill"></div>
                    </div>
                    <div class="progress-percentage">0%</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
        this.loader = document.getElementById('loader');
        this.statusText = document.querySelector('.loading-status-text');
        this.progressPercentage = document.querySelector('.progress-percentage');
        this.progressFill = document.querySelector('.progress-fill');
    }

    hideScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            scrollProgress.classList.add('loading-active');
            scrollProgress.style.display = 'none';
        }
    }

    showScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            scrollProgress.classList.remove('loading-active');
            scrollProgress.style.display = 'block';
            setTimeout(() => {
                scrollProgress.classList.add('visible');
            }, 300);
        }
    }

    startLoading() {
        this.animateProgress();
        this.updateLoadingStatus();
    }

    animateProgress() {
        const progressInterval = setInterval(() => {
            if (this.currentProgress < 95 && !this.loadingComplete) {
                let increment;
                if (this.currentProgress < 30) {
                    increment = Math.random() * 4 + 2;
                } else if (this.currentProgress < 70) {
                    increment = Math.random() * 2 + 1;
                } else {
                    increment = Math.random() * 1 + 0.5;
                }

                this.currentProgress = Math.min(this.currentProgress + increment, 95);
                this.updateProgressDisplay();
                this.updateMessageBasedOnProgress();
            } else if (this.loadingComplete) {
                this.currentProgress = 100;
                this.updateProgressDisplay();
                this.finalizeLoading();
                clearInterval(progressInterval);
            }
        }, 180);
    }

    updateProgressDisplay() {
        const roundedProgress = Math.round(this.currentProgress);
        if (this.progressPercentage) {
            this.progressPercentage.textContent = roundedProgress + '%';
        }
        if (this.progressFill) {
            this.progressFill.style.width = roundedProgress + '%';
        }
    }

    updateMessageBasedOnProgress() {
        let newMessageIndex = this.messageIndex;
        if (this.currentProgress >= 20 && this.messageIndex === 0) {
            newMessageIndex = 1;
        } else if (this.currentProgress >= 45 && this.messageIndex === 1) {
            newMessageIndex = 2;
        } else if (this.currentProgress >= 70 && this.messageIndex === 2) {
            newMessageIndex = 3;
        } else if (this.currentProgress >= 95 && this.messageIndex === 3) {
            newMessageIndex = 4;
        }

        if (newMessageIndex !== this.messageIndex) {
            this.messageIndex = newMessageIndex;
            this.updateStatusText();
        }
    }

    updateStatusText() {
        if (this.statusText && this.loadingMessages[this.messageIndex]) {
            this.statusText.style.transition = 'opacity 0.4s ease-in-out';
            this.statusText.style.opacity = '0';
            setTimeout(() => {
                this.statusText.textContent = this.loadingMessages[this.messageIndex];
                this.statusText.style.opacity = '1';
            }, 400);
        }
    }

    updateLoadingStatus() {
        if (this.statusText) {
            this.statusText.textContent = this.loadingMessages[0];
        }
    }

    completeLoading() {
        this.loadingComplete = true;
        setTimeout(() => {
            this.finalizeLoading();
        }, 800);
    }

    finalizeLoading() {
        this.currentProgress = 100;
        this.updateProgressDisplay();
        
        if (this.statusText) {
            this.statusText.textContent = this.loadingMessages[4];
        }

        setTimeout(() => {
            this.hideLoader();
        }, 1200);
    }

    hideLoader() {
        if (this.loader) {
            this.loader.classList.add('hidden');
            setTimeout(() => {
                this.loader.style.display = 'none';
                
                // Show main content
                if (this.mainContent) {
                    this.mainContent.style.display = 'block';
                    this.mainContent.style.opacity = '0';
                    setTimeout(() => {
                        this.mainContent.style.transition = 'opacity 0.8s ease-out';
                        this.mainContent.style.opacity = '1';
                    }, 100);
                }
                
                this.showScrollProgress();
                this.initMainWebsite();
            }, 800);
        }
    }

    initMainWebsite() {
        console.log('🏗️ S Shobana Enterprises website loaded successfully!');
        this.initSmoothScrolling();
        this.initNavigationActiveState();
        this.initProjectFilters();
        this.initServiceButtons();
    }
    
    // Add this new method
    initServiceButtons() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    const contactSection = document.querySelector('.contact');

    serviceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
    
    initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectItems = document.querySelectorAll('.project-item');
        
        // Set initial active filter
        if (filterBtns.length > 0) {
            filterBtns[0].classList.add('active');
        }
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(filterBtn => filterBtn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                
                projectItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.5s ease-in-out';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    initSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initNavigationActiveState() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        
        function updateActiveNav() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', updateActiveNav);
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                this.blur();
            });
        });
        
        updateActiveNav();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalLoader();
});

// Add CSS animations
const burstStyles = `
    @keyframes burstParticle {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(100px);
        }
    }
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 0.5;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
`;

// Standalone project show more functionality
window.addEventListener('DOMContentLoaded', () => {
    const projects = document.querySelectorAll('.project-item');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const initiallyShown = 3;

    if (!projects.length || !loadMoreBtn) return;

    // Hide projects after the first 3
    projects.forEach((project, index) => {
        if (index >= initiallyShown) {
            project.style.display = 'none';
        }
    });

    // Show or hide the load more button
    if (projects.length > initiallyShown) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }

    // Add click event to load more button
    loadMoreBtn.addEventListener('click', () => {
        projects.forEach(project => {
            project.style.display = 'block';
        });
        loadMoreBtn.style.display = 'none';
    });
});


const styleSheet = document.createElement('style');
styleSheet.textContent = burstStyles;
document.head.appendChild(styleSheet);
