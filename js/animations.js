/* ===========================
   Animation Controller
   =========================== */

class AnimationController {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        this.setupIntersectionObserver();

        // Coming Soon cards click animations
        this.setupComingSoonCards();

        // Button hover effects
        this.setupButtonEffects();
    }

    setupIntersectionObserver() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.coming-soon-card');
        animateElements.forEach(el => observer.observe(el));
    }

    setupComingSoonCards() {
        const cards = document.querySelectorAll('.coming-soon-card');
        console.log('Found', cards.length, 'coming soon cards');

        cards.forEach((card, index) => {
            const video = card.querySelector('.card-video');
            console.log(`Card ${index}:`, video ? 'has video' : 'no video');

            // Click handler
            card.addEventListener('click', () => {
                this.showComingSoonMessage(card);
            });

            // Enter key handler for accessibility
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.showComingSoonMessage(card);
                }
            });

            // Hover handlers for video playback
            if (video) {
                // Mouse enter - play video
                card.addEventListener('mouseenter', () => {
                    console.log('Mouse entered card', index);
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => console.log('Video playing'))
                            .catch(e => console.error('Video play error:', e));
                    }
                });

                // Mouse leave - pause and reset video
                card.addEventListener('mouseleave', () => {
                    console.log('Mouse left card', index);
                    video.pause();
                    video.currentTime = 0; // Reset to beginning
                });

                // Focus handlers for keyboard navigation
                card.addEventListener('focus', () => {
                    video.play().catch(e => console.log('Video play on focus blocked:', e));
                });

                card.addEventListener('blur', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            }
        });
    }

    showComingSoonMessage(card) {
        const cardTitle = card.querySelector('.card-title').textContent;

        // Create toast notification
        const toast = this.createToast(`"${cardTitle}" is coming soon! Stay tuned.`);
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    createToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(42, 45, 58, 0.95);
            backdrop-filter: blur(10px);
            color: #ffffff;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            font-size: 1rem;
            max-width: 300px;
            border: 1px solid rgba(212, 175, 55, 0.3);
        `;

        return toast;
    }

    setupButtonEffects() {
        const buttons = document.querySelectorAll('button, .coming-soon-card');

        buttons.forEach(button => {
            // Add hover sound effect trigger (optional)
            button.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
    }

    playHoverSound() {
        // Placeholder for optional hover sound effect
        // You can add a subtle click/hover sound here if desired
    }

    // Smooth scroll utility
    smoothScrollTo(target, duration = 1000) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    // Easing function for smooth animations
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // Parallax effect disabled - video plays without transforms
    setupParallax() {
        // Disabled to prevent rotation
        return;
    }
}

// Utility: Detect user preference for reduced motion
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Utility: Add stagger delay to elements
function addStaggerDelay(elements, baseDelay = 0.1) {
    elements.forEach((el, index) => {
        el.style.animationDelay = `${baseDelay * index}s`;
    });
}

// Initialize animation controller
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();

    // Add stagger delays to coming soon cards
    const cards = document.querySelectorAll('.coming-soon-card');
    addStaggerDelay(cards, 0.1);
});

// Preload images for better performance
function preloadImages() {
    const imageUrls = [
        'assets/images/pray-cover.jpg',
        'assets/images/the-source-cover.jpg',
        'assets/images/c-walk-cover.jpg',
        'assets/images/lit-cover.jpg'
    ];

    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Call preload on page load
window.addEventListener('load', preloadImages);

// Handle visibility change (pause audio when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.audioPlayer && window.audioPlayer.isPlaying) {
        // Optionally pause when tab is hidden
        // window.audioPlayer.pause();
    }
});

// Performance monitoring (optional)
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
                console.warn('Long task detected:', entry);
            }
        }
    });

    observer.observe({ entryTypes: ['longtask'] });
}
