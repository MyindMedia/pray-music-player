/* ===========================
   Animation Controller
   =========================== */

console.log('animations.js: File loaded');

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
        console.log('setupAnimations: Starting...');
        // Skip IntersectionObserver for now and directly setup cards
        console.log('Directly calling setupComingSoonCards...');
        this.setupComingSoonCards();
        this.setupButtonEffects();
    }

    setupIntersectionObserver() {
        console.log('setupIntersectionObserver: Starting...');
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            console.log('IntersectionObserver not supported');
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            console.log(`IntersectionObserver callback: ${entries.length} entries`);
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log(`Element ${entry.target.className} is intersecting`);
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.coming-soon-card');
        console.log(`Found ${animateElements.length} animate elements to observe`);
        animateElements.forEach(el => observer.observe(el));
    }

    setupComingSoonCards() {
        alert('setupComingSoonCards: Starting...');
        console.log('setupComingSoonCards: Starting...');
        const cards = document.querySelectorAll('.coming-soon-card');
        console.log(`Found ${cards.length} coming soon cards`);

        cards.forEach((card, index) => {
            console.log(`Processing card ${index}`);
            const video = card.querySelector('.card-video');

            const posterLayer = card.querySelector('.poster-layer');
            const posterSrc = card.getAttribute('data-poster');
            const posterVer = card.getAttribute('data-poster-version');
            if (posterLayer && posterSrc) {
                const src = posterVer ? `${posterSrc}?v=${posterVer}` : posterSrc;
                
                // Test if the image exists and can be loaded
                const testImg = new Image();
                testImg.onload = () => {
                    // Image loaded successfully, apply it
                    posterLayer.style.backgroundImage = `url('${src}')`;
                    posterLayer.style.backgroundSize = '100% 100%';
                    posterLayer.style.backgroundPosition = 'center';
                    posterLayer.style.backgroundRepeat = 'no-repeat';
                    posterLayer.style.opacity = '1';
                    posterLayer.style.display = 'block';
                };
                testImg.onerror = () => {
                    // Image failed to load, try without version parameter
                    const baseSrc = posterSrc;
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => {
                        posterLayer.style.backgroundImage = `url('${baseSrc}')`;
                        posterLayer.style.backgroundSize = '100% 100%';
                        posterLayer.style.backgroundPosition = 'center';
                        posterLayer.style.backgroundRepeat = 'no-repeat';
                        posterLayer.style.opacity = '1';
                        posterLayer.style.display = 'block';
                    };
                    fallbackImg.onerror = () => {
                        // Both failed: fallback to video poster attribute if available
                        const videoEl = card.querySelector('.card-video');
                        const posterAttr = videoEl ? videoEl.getAttribute('poster') : null;
                        if (posterAttr) {
                            posterLayer.style.backgroundImage = `url('${posterAttr}')`;
                            posterLayer.style.backgroundSize = '100% 100%';
                            posterLayer.style.backgroundPosition = 'center';
                            posterLayer.style.backgroundRepeat = 'no-repeat';
                            posterLayer.style.opacity = '1';
                            posterLayer.style.display = 'block';
                        } else {
                            posterLayer.style.backgroundColor = '#2a2d3a';
                            posterLayer.style.opacity = '0.6';
                            posterLayer.style.display = 'block';
                        }
                    };
                    fallbackImg.src = baseSrc;
                };
                testImg.src = src;
            }

            const plasticTop = card.querySelector('.plastic-top');
            const plasticBottom = card.querySelector('.plastic-bottom');
            const plasticSrc = card.getAttribute('data-plastic');
            if (plasticSrc) {
                if (plasticTop) {
                    plasticTop.style.backgroundImage = `url('${plasticSrc}')`;
                    plasticTop.style.backgroundSize = '100% 100%';
                    plasticTop.style.backgroundPosition = 'center';
                    plasticTop.style.backgroundRepeat = 'no-repeat';
                }
                if (plasticBottom) {
                    plasticBottom.style.backgroundImage = `url('${plasticSrc}')`;
                    plasticBottom.style.backgroundSize = '100% 100%';
                    plasticBottom.style.backgroundPosition = 'center';
                    plasticBottom.style.backgroundRepeat = 'no-repeat';
                }
            }

            // Remove old peel overlay - replaced with new StickerPeel component
            // const posterGroup = card.querySelector('.poster-group');
            // const existingOverlayImg = posterGroup ? posterGroup.querySelector('img.poster-overlay') : null;
            // let peelSrc = 'assets/images/peeloverlay.png';
            // ... (old peel overlay code removed)

            // New StickerPeel component integration - TEMPORARILY DISABLED FOR DEBUGGING
            const posterGroup = card.querySelector('.poster-group');
            const cardMedia = card.querySelector('.card-media');
            
            // Create simple overlay for testing
            if (posterGroup && cardMedia && posterLayer && video) {
                console.log(`Creating overlay for card ${index}`);
                
                const overlayContainer = document.createElement('div');
                overlayContainer.className = 'peel-overlay-container';
                card.appendChild(overlayContainer);
                overlayContainer.style.background = 'transparent';
                
                // Wait for next frame to ensure DOM is fully rendered and dimensions are available
                requestAnimationFrame(() => {
                    console.log(`Setting up dimensions for card ${index}`);
                    
                    const cardRect = card.getBoundingClientRect();
                    const mediaRect = cardMedia.getBoundingClientRect();
                    const targetWidth = mediaRect.width;
                    const targetHeight = mediaRect.height;
                    const hoverRevealPx = 4;
                    const hoverPct = Math.max(0.5, Math.min(25, (hoverRevealPx / targetHeight) * 100));
                    const hoverPctReduced = hoverPct * 0.3;
                    
                    // Ensure base container is positioned for absolute children
                    cardMedia.style.position = 'relative';
                    cardMedia.style.willChange = 'transform';

                    // Force poster-layer and poster-group to match card-media dimensions exactly
                    posterLayer.style.width = targetWidth + 'px';
                    posterLayer.style.height = targetHeight + 'px';
                    posterLayer.style.position = 'absolute';
                    posterLayer.style.inset = '1px';
                    posterGroup.style.width = targetWidth + 'px';
                    posterGroup.style.height = targetHeight + 'px';
                    posterGroup.style.position = 'absolute';
                    posterGroup.style.inset = '0';
                    
                    const overlapPx = 1;
                    overlayContainer.style.width = (targetWidth + overlapPx * 2) + 'px';
                    overlayContainer.style.height = (targetHeight + overlapPx * 2) + 'px';
                    overlayContainer.style.position = 'absolute';
                    overlayContainer.style.left = (Math.round(mediaRect.left - cardRect.left - 2 - overlapPx) + 1.5) + 'px';
                    overlayContainer.style.top = (mediaRect.top - cardRect.top - 26.4 - overlapPx) + 'px';
                    overlayContainer.style.zIndex = '50';
                    overlayContainer.style.pointerEvents = 'none';
                    overlayContainer.style.willChange = 'transform';
                    overlayContainer.style.transform = 'none';
                    overlayContainer.style.overflow = 'visible';
                    overlayContainer.style.transformStyle = 'preserve-3d';

                    
                    if (plasticTop) {
                        plasticTop.style.width = targetWidth + 'px';
                        plasticTop.style.height = targetHeight + 'px';
                        plasticTop.style.position = 'absolute';
                        plasticTop.style.inset = '0';
                    }
                    if (plasticBottom) {
                        plasticBottom.style.width = targetWidth + 'px';
                        plasticBottom.style.height = targetHeight + 'px';
                        plasticBottom.style.position = 'absolute';
                        plasticBottom.style.inset = '0';
                    }

                    const videoFrame = card.querySelector('.video-frame') || (() => {
                        const f = document.createElement('div');
                        f.className = 'video-frame';
                        cardMedia.appendChild(f);
                        f.appendChild(video);
                        return f;
                    })();
                    videoFrame.style.position = 'absolute';
                    videoFrame.style.inset = '11px 1px 1px 11px';
                    videoFrame.style.overflow = 'hidden';
                    videoFrame.style.borderRadius = '0';
                    videoFrame.style.zIndex = '1';

                    video.style.position = 'absolute';
                    video.style.inset = '0';
                    video.style.width = '100%';
                    video.style.height = '100%';
                    video.style.objectFit = 'cover';
                    video.style.opacity = '0';
                    video.style.transition = 'none';
                    video.style.transform = 'none';
                    video.style.backgroundColor = 'transparent';
                    video.style.boxShadow = 'none';
                    
                    
                    video.style.zIndex = '1';
                    if (plasticTop) plasticTop.style.zIndex = '2';
                    if (plasticBottom) plasticBottom.style.zIndex = '2';
                    posterGroup.style.zIndex = '3';
                    
                    // Create simple StickerPeel instance with exact dimensions
                    const stickerPeel = new StickerPeel({
                        container: overlayContainer,
                        imageSrc: 'assets/images/peeloverlay.png',
                        width: Math.round(targetWidth * 0.9),
                        rotate: 0,
                        peelBackHoverPct: hoverPctReduced,
                        peelBackActivePct: 70,
                        peelDirection: 269,
                        shadowIntensity: 0.05,
                        lightingIntensity: 0.09,
                        initialPosition: 'center',
                        className: 'coming-soon-sticker'
                    });
                    
                    // Store reference for cleanup
                    card._stickerPeel = stickerPeel;
                    card._overlayContainer = overlayContainer;
                    console.log(`Overlay created for card ${index}`);

                    const updateLayout = () => {
                        const cr = card.getBoundingClientRect();
                        const mr = cardMedia.getBoundingClientRect();
                        const w = mr.width;
                        const h = mr.height;
                        posterLayer.style.width = w + 'px';
                        posterLayer.style.height = h + 'px';
                        posterGroup.style.width = w + 'px';
                        posterGroup.style.height = h + 'px';
                        overlayContainer.style.width = w + 'px';
                        overlayContainer.style.height = h + 'px';
                        overlayContainer.style.left = (Math.round(mr.left - cr.left - 2) + 1.5) + 'px';
                        overlayContainer.style.top = (mr.top - cr.top - 26.4) + 'px';
                        if (plasticTop) {
                            plasticTop.style.width = w + 'px';
                            plasticTop.style.height = h + 'px';
                        }
                        if (plasticBottom) {
                            plasticBottom.style.width = w + 'px';
                            plasticBottom.style.height = h + 'px';
                        }
                        videoFrame.style.inset = '11px 1px 1px 11px';
                        video.style.inset = '0';
                        video.style.width = '100%';
                        video.style.height = '100%';
                    };
                    if ('ResizeObserver' in window) {
                        const ro = new ResizeObserver(() => updateLayout());
                        ro.observe(cardMedia);
                        card._overlayResizeObserver = ro;
                    } else {
                        window.addEventListener('resize', updateLayout);
                    }
                });
            } else {
                console.log(`Missing elements for card ${index}: posterGroup=${!!posterGroup}, cardMedia=${!!cardMedia}, posterLayer=${!!posterLayer}, video=${!!video}`);
            }

            
            // Click handler
            card.addEventListener('click', () => {
                if (card.classList.contains('unwrapped')) return;
                card.classList.add('unwrapped');
                const overlay = card._overlayContainer;
                const sticker = card._stickerPeel;
                const main = overlay ? overlay.querySelector('.sticker-peel-main') : null;
                const flap = overlay ? overlay.querySelector('.sticker-peel-flap') : null;
                const dragEl = overlay ? overlay.querySelector('.sticker-peel-draggable') : null;

                if (overlay) overlay.style.pointerEvents = 'none';
                if (dragEl) dragEl.style.pointerEvents = 'none';
                if (main) {
                    main.style.transition = 'clip-path 1.8s cubic-bezier(0.2, 0.7, 0, 1)';
                    main.style.setProperty('clip-path', 'polygon(0 3%, 100% 3%, 100% 100%, 0 100%)', 'important');
                    void main.getBoundingClientRect();
                    main.style.setProperty('clip-path', 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', 'important');
                }
                if (flap) {
                    flap.style.transition = 'clip-path 1.8s cubic-bezier(0.2, 0.7, 0, 1), top 1.8s cubic-bezier(0.2, 0.7, 0, 1)';
                    flap.style.setProperty('clip-path', 'polygon(0 0, 100% 0, 100% 3%, 0 3%)', 'important');
                    flap.style.setProperty('top', 'calc(-100% + 2 * 3% - 1px)', 'important');
                    void flap.getBoundingClientRect();
                    flap.style.setProperty('clip-path', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', 'important');
                    flap.style.setProperty('top', 'calc(100% - 1px)', 'important');
                }

                if (video) {
                    video.style.transition = 'opacity 0.6s ease-out, transform 0.25s ease-out';
                    video.style.opacity = '1';
                    video.style.transform = 'none';
                    const playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(() => {});
                    }
                }

                const onPeelComplete = () => {
                    if (overlay) {
                        overlay.style.transition = 'none';
                        overlay.style.opacity = '0';
                        if (sticker && typeof sticker.destroy === 'function') sticker.destroy();
                        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    }
                    if (posterLayer) {
                        posterLayer.style.transition = 'opacity 0.6s ease-in-out, clip-path 0.6s ease-in-out';
                        posterLayer.style.willChange = 'opacity, clip-path';
                        posterLayer.style.clipPath = 'inset(0% 0% 0% 0%)';
                        void posterLayer.getBoundingClientRect();
                        posterLayer.style.clipPath = 'inset(12% 12% 12% 12%)';
                        posterLayer.style.opacity = '0';
                    }
                    
                    if (main) main.removeEventListener('transitionend', onPeelComplete);
                };
                if (main) main.addEventListener('transitionend', onPeelComplete);

                card.classList.add('unwrapped');
            });

            

            const media = card.querySelector('.card-media');
            
            // Peel overlay removed
            let tiltRAFId = null;
            let tiltX = 0, tiltY = 0;
            let currentRx = 0, currentRy = 0;
            const onMouseMove = (e) => {
                if (card.classList.contains('unwrapped')) return;
                if (!media) return;
                const rect = media.getBoundingClientRect();
                tiltX = e.clientX - rect.left;
                tiltY = e.clientY - rect.top;
                if (tiltRAFId) return;
                tiltRAFId = requestAnimationFrame(() => {
                    const w = media.clientWidth || 1;
                    const h = media.clientHeight || 1;
                    const isMobile = (window.innerWidth || 1024) < 768;
                    const maxAngle = isMobile ? 18 : 28;
                    const targetRx = ((tiltY / h) - 0.5) * -maxAngle;
                    const targetRy = ((tiltX / w) - 0.5) * maxAngle;
                    const smooth = 0.18;
                    currentRx += (targetRx - currentRx) * smooth;
                    currentRy += (targetRy - currentRy) * smooth;
                    const t = `rotateX(${currentRx}deg) rotateY(${currentRy}deg) translateZ(24px) scale(1.03)`;
                    media.style.transform = t;
                    const posterGroup = card.querySelector('.poster-group');
                    if (posterGroup) {
                        posterGroup.style.setProperty('--lx', `${(tiltX / w) * 100}%`);
                        posterGroup.style.setProperty('--ly', `${(tiltY / h) * 100}%`);
                    }
                    const oc = card._overlayContainer;
                    if (oc) {
                        oc.style.transform = t;
                    }
                    tiltRAFId = null;
                });
            };

            const onMouseLeave = () => {
                if (media) {
                    media.style.transform = 'none';
                }
                if (tiltRAFId) {
                    cancelAnimationFrame(tiltRAFId);
                    tiltRAFId = null;
                }
                const oc = card._overlayContainer;
                if (oc) {
                    oc.style.transform = 'none';
                }
                if (typeof gsap !== 'undefined') {
                    const posterGroup = card.querySelector('.poster-group');
                    if (posterGroup) gsap.to(posterGroup, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' });
                }
                // no direct transform applied to video; it follows parent alignment
            };

            card.addEventListener('mousemove', onMouseMove);
            card.addEventListener('mouseleave', onMouseLeave);

            // Peel features removed

            // Enter key handler disabled for autoplay requirement
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            });

            // Hover handlers for video playback
            if (video) {
                video.muted = true;
                video.playsInline = true;
                video.loop = true;
                const mediaEl = card.querySelector('.card-media') || card;
                mediaEl.addEventListener('mouseenter', () => {
                    if (card.classList.contains('unwrapped')) return;
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {});
                    }
                });
                mediaEl.addEventListener('mouseleave', () => {
                    if (card.classList.contains('unwrapped')) return;
                    // Keep video playing to ensure loop visibility; do not pause here
                });
            }
        });

        // Drag handle disabled: autoplay only after poster click
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
    const urls = [];
    document.querySelectorAll('.coming-soon-card').forEach(card => {
        const src = card.getAttribute('data-poster');
        const ver = card.getAttribute('data-poster-version');
        if (src) urls.push(ver ? `${src}?v=${ver}` : src);
    });
    urls.forEach(url => { const img = new Image(); img.src = url; });
}

// Call preload on page load
if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadImages, { timeout: 2000 });
} else {
    window.addEventListener('load', () => setTimeout(preloadImages, 1500));
}

// Handle visibility change (pause audio when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.audioPlayer && window.audioPlayer.isPlaying) {
        // Optionally pause when tab is hidden
        // window.audioPlayer.pause();
    }
});

// Performance monitoring (optional)
if ('PerformanceObserver' in window) {
    const isDevHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const threshold = isDevHost ? 200 : Infinity;
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > threshold) {
                console.warn('Long task detected:', entry);
            }
        }
    });
    observer.observe({ entryTypes: ['longtask'] });
}
