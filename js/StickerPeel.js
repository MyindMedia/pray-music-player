/**
 * StickerPeel - Vanilla JavaScript Version
 * A draggable sticker with realistic peel effect
 * Based on the React component but adapted for vanilla JS
 */

class StickerPeel {
    constructor(options = {}) {
        this.options = {
            imageSrc: '',
            rotate: 30,
            peelBackHoverPct: 30,
            peelBackActivePct: 40,
            peelEasing: 'power3.out',
            peelHoverEasing: 'power2.out',
            width: 200,
            shadowIntensity: 0.6,
            lightingIntensity: 0.1,
            initialPosition: 'center',
            peelDirection: 0,
            className: '',
            container: null,
            ...options
        };

        this.container = null;
        this.dragTarget = null;
        this.stickerContainer = null;
        this.stickerMain = null;
        this.flap = null;
        this.pointLight = null;
        this.pointLightFlipped = null;
        this.draggableInstance = null;
        this.defaultPadding = 0;

        this.init();
    }

    init() {
        if (!this.options.container) {
            console.error('StickerPeel: container element is required');
            return;
        }

        this.container = typeof this.options.container === 'string' 
            ? document.querySelector(this.options.container)
            : this.options.container;

        if (!this.container) {
            console.error('StickerPeel: container element not found');
            return;
        }

        this.createElements();
        this.setupStyles();
        this.setupEventListeners();
        this.setupDraggable();
    }

    createElements() {
        // Get container dimensions to size the sticker properly
        const containerRect = this.container.getBoundingClientRect();
        
        // Use the exact container dimensions for perfect fit
        const stickerWidth = containerRect.width;
        const stickerHeight = containerRect.height;
        
        // Create main draggable element
        this.dragTarget = document.createElement('div');
        this.dragTarget.className = `sticker-peel-draggable ${this.options.className}`;
        this.dragTarget.style.width = stickerWidth + 'px';
        this.dragTarget.style.height = stickerHeight + 'px';

        // Create SVG filters
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Point light filter
        const pointLightFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        pointLightFilter.setAttribute('id', 'pointLight');
        pointLightFilter.innerHTML = `
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feSpecularLighting result="spec" in="blur" specularExponent="100" specularConstant="${this.options.lightingIntensity}" lightingColor="white">
                <fePointLight x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
        `;

        // Point light flipped filter
        const pointLightFlippedFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        pointLightFlippedFilter.setAttribute('id', 'pointLightFlipped');
        pointLightFlippedFilter.innerHTML = `
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feSpecularLighting result="spec" in="blur" specularExponent="100" specularConstant="${this.options.lightingIntensity * 7}" lightingColor="white">
                <fePointLight x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
        `;

        // Drop shadow filter
        const dropShadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        dropShadowFilter.setAttribute('id', 'dropShadow');
        dropShadowFilter.innerHTML = `
            <feDropShadow dx="2" dy="4" stdDeviation="${3 * this.options.shadowIntensity}" floodColor="black" floodOpacity="${this.options.shadowIntensity}" />
        `;

        // Expand and fill filter
        const expandAndFillFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        expandAndFillFilter.setAttribute('id', 'expandAndFill');
        expandAndFillFilter.innerHTML = `
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
            <feFlood floodColor="rgb(179,179,179)" result="flood" />
            <feComposite operator="in" in="flood" in2="shape" />
        `;

        defs.appendChild(pointLightFilter);
        defs.appendChild(pointLightFlippedFilter);
        defs.appendChild(dropShadowFilter);
        defs.appendChild(expandAndFillFilter);
        svg.appendChild(defs);

        // Create sticker container
        this.stickerContainer = document.createElement('div');
        this.stickerContainer.className = 'sticker-peel-container';

        // Create sticker main
        this.stickerMain = document.createElement('div');
        this.stickerMain.className = 'sticker-peel-main';
        
        const stickerLighting = document.createElement('div');
        stickerLighting.className = 'sticker-peel-lighting';
        
        const stickerImage = document.createElement('img');
        stickerImage.src = this.options.imageSrc;
        stickerImage.alt = '';
        stickerImage.className = 'sticker-peel-image';
        stickerImage.draggable = false;
        stickerImage.addEventListener('contextmenu', e => e.preventDefault());

        stickerLighting.appendChild(stickerImage);
        this.stickerMain.appendChild(stickerLighting);

        // Create flap
        this.flap = document.createElement('div');
        this.flap.className = 'sticker-peel-flap';
        
        const flapLighting = document.createElement('div');
        flapLighting.className = 'sticker-peel-flap-lighting';
        
        const flapImage = document.createElement('img');
        flapImage.src = this.options.imageSrc;
        flapImage.alt = '';
        flapImage.className = 'sticker-peel-flap-image';
        flapImage.draggable = false;
        flapImage.addEventListener('contextmenu', e => e.preventDefault());

        flapLighting.appendChild(flapImage);
        this.flap.appendChild(flapLighting);

        // Assemble the structure
        this.stickerContainer.appendChild(this.stickerMain);
        this.stickerContainer.appendChild(this.flap);
        this.dragTarget.appendChild(svg);
        this.dragTarget.appendChild(this.stickerContainer);
        this.container.appendChild(this.dragTarget);

        // Store references to point lights for mouse tracking
        this.pointLight = svg.querySelector('fePointLight');
        this.pointLightFlipped = svg.querySelector('#pointLightFlipped fePointLight');
    }

    setupStyles() {
        // Get container dimensions for dynamic sizing
        const containerRect = this.container.getBoundingClientRect();
        
        const style = document.createElement('style');
        style.textContent = `
            .sticker-peel-draggable {
                position: absolute;
                cursor: grab;
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
                -webkit-user-select: none;
                user-select: none;
                -webkit-touch-callout: none;
                -webkit-tap-highlight-color: transparent;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            .sticker-peel-draggable:active {
                cursor: grabbing;
            }
            
            .sticker-peel-container {
                position: relative;
                transform: rotate(${this.options.peelDirection}deg);
                transform-origin: center;
                -webkit-transform-style: preserve-3d;
                transform-style: preserve-3d;
                width: 100%;
                height: 100%;
                margin: 0 auto;
            }
            
            .sticker-peel-main {
                clip-path: polygon(
                    calc(-1 * ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) calc(100% + ${this.defaultPadding}px),
                    calc(-1 * ${this.defaultPadding}px) calc(100% + ${this.defaultPadding}px)
                );
                transition: clip-path 0.6s ease-out;
                filter: url(#dropShadow);
                will-change: clip-path, transform;
            }
            
            .sticker-peel-main > * {
                transform: rotate(calc(-1 * ${this.options.peelDirection}deg));
            }
            
            .sticker-peel-lighting {
                filter: url(#pointLight);
            }
            
            .sticker-peel-image {
                transform: rotate(${this.options.rotate}deg);
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            
            .sticker-peel-flap {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: calc(-100% - ${this.defaultPadding}px - ${this.defaultPadding}px);
                clip-path: polygon(
                    calc(-1 * ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(-1 * ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px)
                );
                transform: scaleY(-1);
                transition: all 0.6s ease-out;
                will-change: clip-path, transform;
            }
            
            .sticker-peel-flap > * {
                transform: rotate(calc(-1 * ${this.options.peelDirection}deg));
            }
            
            .sticker-peel-flap-lighting {
                filter: url(#pointLightFlipped);
            }
            
            .sticker-peel-flap-image {
                transform: rotate(${this.options.rotate}deg);
                filter: url(#expandAndFill);
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            
            /* Hover effects */
            .sticker-peel-container:hover .sticker-peel-main,
            .sticker-peel-container.touch-active .sticker-peel-main {
                clip-path: polygon(
                    calc(-1 * ${this.defaultPadding}px) ${this.options.peelBackHoverPct}%,
                    calc(100% + ${this.defaultPadding}px) ${this.options.peelBackHoverPct}%,
                    calc(100% + ${this.defaultPadding}px) calc(100% + ${this.defaultPadding}px),
                    calc(-1 * ${this.defaultPadding}px) calc(100% + ${this.defaultPadding}px)
                ) !important;
            }
            
            .sticker-peel-container:hover .sticker-peel-flap,
            .sticker-peel-container.touch-active .sticker-peel-flap {
                clip-path: polygon(
                    calc(-1 * ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) ${this.options.peelBackHoverPct}%,
                    calc(-1 * ${this.defaultPadding}px) ${this.options.peelBackHoverPct}%
                ) !important;
                top: calc(-100% + 2 * ${this.options.peelBackHoverPct}% - 1px) !important;
            }
            
            /* Active effects */
            .sticker-peel-draggable:active .sticker-peel-main {
                clip-path: polygon(
                    calc(-1 * ${this.defaultPadding}px) ${this.options.peelBackActivePct}%,
                    calc(100% + ${this.defaultPadding}px) ${this.options.peelBackActivePct}%,
                    calc(100% + ${this.defaultPadding}px) calc(100% + ${this.defaultPadding}px),
                    calc(-1 * ${this.defaultPadding}px) calc(100% + ${this.defaultPadding}px)
                ) !important;
            }
            
            .sticker-peel-draggable:active .sticker-peel-flap {
                clip-path: polygon(
                    calc(-1 * ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) calc(-1 * ${this.defaultPadding}px),
                    calc(100% + ${this.defaultPadding}px) ${this.options.peelBackActivePct}%,
                    calc(-1 * ${this.defaultPadding}px) ${this.options.peelBackActivePct}%
                ) !important;
                top: calc(-100% + 2 * ${this.options.peelBackActivePct}% - 1px) !important;
            }
            
            @media (hover: none) and (pointer: coarse) {
                .sticker-peel-draggable {
                    cursor: default;
                }
                .sticker-peel-container {
                    touch-action: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Touch event handling
        const handleTouchStart = () => {
            this.stickerContainer.classList.add('touch-active');
        };

        const handleTouchEnd = () => {
            this.stickerContainer.classList.remove('touch-active');
        };

        this.dragTarget.addEventListener('touchstart', handleTouchStart);
        this.dragTarget.addEventListener('touchend', handleTouchEnd);
        this.dragTarget.addEventListener('touchcancel', handleTouchEnd);

        // Mouse move for lighting effects
        const updateLight = (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.pointLight) {
                this.pointLight.setAttribute('x', x);
                this.pointLight.setAttribute('y', y);
            }

            const normalizedAngle = Math.abs(this.options.peelDirection % 360);
            if (this.pointLightFlipped) {
                if (normalizedAngle !== 180) {
                    this.pointLightFlipped.setAttribute('x', x);
                    this.pointLightFlipped.setAttribute('y', rect.height - y);
                } else {
                    this.pointLightFlipped.setAttribute('x', -1000);
                    this.pointLightFlipped.setAttribute('y', -1000);
                }
            }
        };

        this.container.addEventListener('mousemove', updateLight);
    }

    setupDraggable() {
        if (typeof Draggable === 'undefined') {
            console.warn('StickerPeel: GSAP Draggable not found. Peel effect will work but dragging will be disabled.');
            return;
        }

        this.draggableInstance = Draggable.create(this.dragTarget, {
            type: 'x,y',
            bounds: this.container,
            inertia: true,
            onDrag: () => {
                const rot = gsap.utils.clamp(-24, 24, this.draggableInstance.deltaX * 0.4);
                gsap.to(this.dragTarget, { rotation: rot, duration: 0.15, ease: 'power1.out' });
            },
            onDragEnd: () => {
                const rotationEase = 'power2.out';
                const duration = 0.8;
                gsap.to(this.dragTarget, { rotation: 0, duration, ease: rotationEase });
            }
        })[0];
    }

    // Public methods
    destroy() {
        if (this.draggableInstance) {
            this.draggableInstance.kill();
        }
        if (this.dragTarget && this.dragTarget.parentNode) {
            this.dragTarget.parentNode.removeChild(this.dragTarget);
        }
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.destroy();
        this.init();
    }
}

// Make it available globally
window.StickerPeel = StickerPeel;