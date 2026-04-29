/**
 * media-player.js
 * High-performance media orchestrator for tysonshields.com
 * Handles viewport pausing, custom rhythmic controls, and media state management.
 */

class MediaEngine {
    constructor() {
        this.mediaRegistry = new Map();
        this.observer = null;
        this.rAF = null; // requestAnimationFrame reference for rhythmic UI updates
        
        // CSS Tokens for UI generation
        this.tokens = {
            accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6',
            surface: getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim() || '#121212',
            easeWeighted: getComputedStyle(document.documentElement).getPropertyValue('--ease-weighted').trim() || 'cubic-bezier(0.2, 0, 0.2, 1)'
        };
    }

    init() {
        // Initialize the primary hero reel immediately
        this.setupHeroReel();
        this.setupIntersectionObserver();

        // Wait for the central orchestrator (core.js) to finish hydrating project cards
        document.addEventListener('garden:dataReady', () => {
            // Slight delay to ensure the DOM fragment has fully painted
            requestAnimationFrame(() => {
                this.scanAndInitializeMedia();
            });
        });
    }

    /**
     * Hero Reel specifically requires guaranteed looping and un-interrupted playback 
     * when in view, acting as the visual anchor.
     */
    setupHeroReel() {
        const heroVideo = document.getElementById('production-reel');
        if (!heroVideo) return;

        // Force necessary attributes for reliable background playback
        heroVideo.muted = true;
        heroVideo.loop = true;
        heroVideo.playsInline = true;
        heroVideo.removeAttribute('controls');
        
        // Suppress playback errors on low-power mode devices
        heroVideo.play().catch(e => console.warn('MediaEngine: Hero autoplay prevented by browser policy.', e));
        
        this.mediaRegistry.set(heroVideo, { type: 'hero', state: 'playing' });
    }

    /**
     * Performance First: Pause videos when they leave the viewport.
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px', // Pre-load slightly before entering viewport
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const record = this.mediaRegistry.get(video);

                if (entry.isIntersecting) {
                    // Only auto-play if it was marked as playing, or if it's the hero
                    if (record?.state === 'playing' || record?.type === 'hero') {
                        video.play().catch(() => {});
                    }
                } else {
                    // Suspend playback to save CPU/GPU cycles
                    if (!video.paused) {
                        video.pause();
                        // Do not change state to 'paused' so it resumes when scrolling back
                    }
                }
            });
        }, options);
    }

    /**
     * Scans the DOM for any new project videos injected by core.js
     */
    scanAndInitializeMedia() {
        const projectVideos = document.querySelectorAll('.card-project video');
        
        projectVideos.forEach(video => {
            // Avoid double initialization
            if (this.mediaRegistry.has(video)) return;

            // Strip default browser chrome
            video.removeAttribute('controls');
            video.muted = true; // Default to muted for tech/minimalist vibe
            video.loop = true;

            this.injectCustomControls(video);
            
            this.mediaRegistry.set(video, { type: 'project', state: 'paused' });
            this.observer.observe(video);
        });
    }

    /**
     * Dynamically constructs the minimalist UI, keeping index.html clean
     */
    injectCustomControls(video) {
        // Create an isolation wrapper for absolute positioning
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-media-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        
        video.parentNode.insertBefore(wrapper, video);
        wrapper.appendChild(video);

        // Construct the Control Bar
        const controlBar = document.createElement('div');
        controlBar.className = 'media-controls font-mono';
        controlBar.innerHTML = `
            <button class="ctrl-btn play-pause">PLAY</button>
            <div class="progress-track">
                <div class="progress-fill"></div>
            </div>
            <button class="ctrl-btn mute-toggle">UNMUTE</button>
        `;

        wrapper.appendChild(controlBar);

        this.bindControlEvents(video, controlBar);
        this.applyControlStyles(controlBar);
    }

    /**
     * Event binding for the custom UI
     */
    bindControlEvents(video, controlBar) {
        const playBtn = controlBar.querySelector('.play-pause');
        const muteBtn = controlBar.querySelector('.mute-toggle');
        const progressFill = controlBar.querySelector('.progress-fill');
        const progressTrack = controlBar.querySelector('.progress-track');

        // Play/Pause Logic
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering card hover events
            if (video.paused) {
                video.play();
                playBtn.textContent = 'PAUSE';
                this.mediaRegistry.get(video).state = 'playing';
                this.syncProgress(video, progressFill);
            } else {
                video.pause();
                playBtn.textContent = 'PLAY';
                this.mediaRegistry.get(video).state = 'paused';
                cancelAnimationFrame(this.rAF);
            }
        });

        // Mute/Unmute Logic
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? 'UNMUTE' : 'MUTE';
            muteBtn.style.color = video.muted ? 'inherit' : this.tokens.accent;
        });

        // Scrubbing / Seeking Logic
        progressTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressTrack.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });
    }

    /**
     * Rhythmic UI update using rAF for sub-pixel precision instead of setInterval
     */
    syncProgress(video, progressFill) {
        const update = () => {
            if (video.paused || video.ended) return;
            
            const percentage = (video.currentTime / video.duration) * 100;
            progressFill.style.transform = `scaleX(${percentage / 100})`;
            
            this.rAF = requestAnimationFrame(update);
        };
        this.rAF = requestAnimationFrame(update);
    }

    /**
     * Injects the required CSS for the controls programmatically 
     * (Keeps the component completely modular without requiring global.css edits)
     */
    applyControlStyles(controlBar) {
        Object.assign(controlBar.style, {
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            opacity: '0', // Hide by default
            transition: `opacity 300ms ${this.tokens.easeWeighted}`,
            zIndex: '10'
        });

        // Reveal controls on hover
        controlBar.parentElement.addEventListener('mouseenter', () => controlBar.style.opacity = '1');
        controlBar.parentElement.addEventListener('mouseleave', () => controlBar.style.opacity = '0');

        const buttons = controlBar.querySelectorAll('.ctrl-btn');
        buttons.forEach(btn => {
            Object.assign(btn.style, {
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '0.7rem',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: `color 200ms ${this.tokens.easeWeighted}`
            });
            btn.addEventListener('mouseenter', () => btn.style.color = this.tokens.accent);
            btn.addEventListener('mouseleave', () => {
                if(btn.textContent !== 'MUTE') btn.style.color = '#fff';
            });
        });

        const track = controlBar.querySelector('.progress-track');
        Object.assign(track.style, {
            flexGrow: '1',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            position: 'relative'
        });

        const fill = controlBar.querySelector('.progress-fill');
        Object.assign(fill.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            height: '100%',
            width: '100%',
            backgroundColor: this.tokens.accent,
            transformOrigin: 'left',
            transform: 'scaleX(0)',
            willChange: 'transform'
        });
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    window.GardenMedia = new MediaEngine();
    window.GardenMedia.init();
});