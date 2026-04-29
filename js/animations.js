/**
 * animations.js
 * Motion and scroll orchestrator for tysonshields.com
 * Handles IntersectionObservers, rhythmic staggering, and timeline visual states.
 */

class AnimationEngine {
    constructor() {
        // Read the global CSS variable for our weighted bezier curve
        this.easeWeighted = getComputedStyle(document.documentElement).getPropertyValue('--ease-weighted').trim() || 'cubic-bezier(0.2, 0, 0.2, 1)';
        
        // Respect system-level accessibility preferences
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.observers = [];
    }

    init() {
        if (this.prefersReducedMotion) {
            console.log('AnimationEngine: Reduced motion enabled. Skiping complex transitions.');
            this.revealAllImmediately();
            return;
        }

        this.setupScrollObserver();
        this.setupDataVizHooks();
        this.bindTimelineEvents();
    }

    /**
     * Orchestrates standard scroll reveals and rhythmic staggering
     */
    setupScrollObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    
                    // Handle staggered children if it is a grid or list
                    if (el.classList.contains('reveal-stagger')) {
                        this.staggerChildren(el);
                    } else {
                        // Standard reveal
                        el.classList.add('is-visible');
                    }
                    
                    // Unobserve after revealing to prevent layout thrashing on scroll up
                    observer.unobserve(el);
                }
            });
        }, options);

        // Target all elements needing animation
        const elements = document.querySelectorAll('.reveal, .reveal-stagger');
        elements.forEach(el => scrollObserver.observe(el));
        this.observers.push(scrollObserver);
    }

    /**
     * Applies incremental transition delays to children for a "weighted" cascade effect
     */
    staggerChildren(container) {
        const children = container.children;
        const baseDelay = 100; // milliseconds

        Array.from(children).forEach((child, index) => {
            // Apply inline delay to utilize CSS transitions smoothly
            child.style.transitionDelay = `${index * baseDelay}ms`;
            
            // Force a reflow before adding the active class
            requestAnimationFrame(() => {
                child.classList.add('is-visible');
            });
        });
        
        container.classList.add('is-visible');
    }

    /**
     * Specialized observer strictly for data visualizations
     */
    setupDataVizHooks() {
        const vizOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.25 // Wait until at least 25% of the canvas is visible
        };

        const vizObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dispatch event for data-viz.js to catch and begin rendering
                    const event = new CustomEvent('garden:vizEnterViewport', {
                        detail: { target: entry.target.id }
                    });
                    document.dispatchEvent(event);
                } else {
                    // Optional: Dispatch pause event to save memory when out of view
                    const event = new CustomEvent('garden:vizExitViewport', {
                        detail: { target: entry.target.id }
                    });
                    document.dispatchEvent(event);
                }
            });
        }, vizOptions);

        const vizContainers = document.querySelectorAll('.viz-container');
        vizContainers.forEach(container => vizObserver.observe(container));
        this.observers.push(vizObserver);
    }

    /**
     * Visual handlers for the interactive timeline nodes
     */
    bindTimelineEvents() {
        document.addEventListener('garden:timelineNodeSelected', (e) => {
            const nodeId = e.detail.id;
            const targetNode = document.querySelector(`.timeline-node[data-id="${nodeId}"]`);
            
            if (!targetNode) return;

            // Use rAF to batch visual updates
            requestAnimationFrame(() => {
                const allNodes = document.querySelectorAll('.timeline-node');
                
                // Reset all nodes
                allNodes.forEach(node => {
                    node.style.transform = 'scale(1)';
                    node.style.opacity = '0.5';
                    node.classList.remove('is-active');
                });

                // Highlight and scale active node
                targetNode.style.transform = 'scale(1.02) translateX(10px)';
                targetNode.style.opacity = '1';
                targetNode.style.transition = `all 400ms ${this.easeWeighted}`;
                targetNode.classList.add('is-active');
            });
        });
    }

    /**
     * Fallback for accessibility
     */
    revealAllImmediately() {
        const elements = document.querySelectorAll('.reveal, .reveal-stagger, .timeline-node');
        elements.forEach(el => {
            el.style.transition = 'none';
            el.classList.add('is-visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const animationEngine = new AnimationEngine();
    animationEngine.init();
});