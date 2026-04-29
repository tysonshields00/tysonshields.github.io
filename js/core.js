/**
 * core.js
 * Central orchestrator for tysonshields.com
 * Handles state management, data hydration, and the "Live" engine.
 */

// Utility: Basic HTML Sanitizer to prevent XSS from JSON payloads
const sanitizeHTML = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[^\w. ]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
};

class DigitalGardenHub {
    constructor() {
        this.state = {
            isLoaded: false,
            projects: [],
            activeTimelineNode: null,
            liveSystem: {
                puzzleActive: true,
                musicPlaying: false
            }
        };

        // DOM Elements
        this.DOM = {
            projectFeed: document.getElementById('project-feed'),
            timelineContainer: document.getElementById('interactive-timeline'),
            musicStatus: document.getElementById('music-status'),
            puzzleStatus: document.getElementById('current-puzzle')
        };
    }

    init() {
        this.bindEvents();
        this.hydrateData();
        this.initLiveEngine();
        this.setupTimelineNavigation();
    }

    bindEvents() {
        // Listen for our own custom data event
        document.addEventListener('garden:dataReady', (e) => {
            this.state.projects = e.detail;
            this.state.isLoaded = true;
            this.renderProjectFeed();
        });
    }

    async hydrateData() {
        try {
            // Simulated fetch for projects.json
            // In production replace with: const response = await fetch('data/projects.json');
            const response = await this.mockNetworkRequest();
            const data = await response.json();
            
            // Dispatch custom event for data-viz.js and animations.js to hook into
            const dataEvent = new CustomEvent('garden:dataReady', { 
                detail: data,
                bubbles: true 
            });
            document.dispatchEvent(dataEvent);

        } catch (error) {
            console.error('CoreHub Error: Failed to hydrate data.', error);
            if (this.DOM.projectFeed) {
                this.DOM.projectFeed.innerHTML = `<p class="font-mono" style="color: red;">Error: Data stream interrupted.</p>`;
            }
        }
    }

    renderProjectFeed() {
        if (!this.DOM.projectFeed || !this.state.projects.length) return;

        // Use DocumentFragment to prevent layout thrashing
        const fragment = document.createDocumentFragment();

        this.state.projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'card-project';
            
            // Render either a video thumbnail or a hook for canvas
            const mediaHTML = project.type === 'video' 
                ? `<video src="${sanitizeHTML(project.mediaUrl)}" muted loop playsinline></video>`
                : `<img src="${sanitizeHTML(project.mediaUrl)}" alt="${sanitizeHTML(project.title)} context image" />`;

            const techStackHTML = project.stack.map(tech => 
                `<span>[${sanitizeHTML(tech)}]</span>`
            ).join('');

            card.innerHTML = `
                <div class="card-media">
                    ${mediaHTML}
                </div>
                <div class="card-meta">
                    <h3 class="font-mono">${sanitizeHTML(project.title)}</h3>
                    <div class="card-tech-stack">${techStackHTML}</div>
                </div>
            `;

            // Hover trigger for video playback
            if (project.type === 'video') {
                const vid = card.querySelector('video');
                card.addEventListener('mouseenter', () => vid.play().catch(() => {}));
                card.addEventListener('mouseleave', () => {
                    vid.pause();
                    vid.currentTime = 0;
                });
            }

            fragment.appendChild(card);
        });

        // Batch DOM update
        requestAnimationFrame(() => {
            this.DOM.projectFeed.innerHTML = '';
            this.DOM.projectFeed.appendChild(fragment);
        });
    }

    initLiveEngine() {
        // Modular engine ready to be hooked up to Last.fm or a websocket
        const updateLiveFeed = async () => {
            // Mock API calls
            const currentTrack = "Autechre : : VLetrmx"; // Placeholder
            const puzzleState = "Permutation 4B complete. Awaiting next sequence.";
            
            requestAnimationFrame(() => {
                if (this.DOM.musicStatus) {
                    this.DOM.musicStatus.textContent = currentTrack;
                }
                if (this.DOM.puzzleStatus) {
                    this.DOM.puzzleStatus.textContent = puzzleState;
                }
            });
        };

        // Run immediately then poll every 30 seconds
        updateLiveFeed();
        setInterval(updateLiveFeed, 30000);
    }

    setupTimelineNavigation() {
        if (!this.DOM.timelineContainer) return;

        // Event delegation for timeline nodes
        this.DOM.timelineContainer.addEventListener('click', (e) => {
            const node = e.target.closest('.timeline-node');
            if (!node) return;

            // Remove active state from current node
            if (this.state.activeTimelineNode) {
                this.state.activeTimelineNode.classList.remove('is-active');
            }

            // Set new active node
            node.classList.add('is-active');
            this.state.activeTimelineNode = node;

            // Trigger animation hook for animations.js
            const nodeId = node.dataset.id;
            document.dispatchEvent(new CustomEvent('garden:timelineNodeSelected', { detail: { id: nodeId } }));
        });
    }

    // Temporary mock data generator for testing the hydration flow
    mockNetworkRequest() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    json: () => Promise.resolve([
                        { id: 1, title: 'Sentiment Analysis Engine', type: 'data', mediaUrl: 'assets/thumb-data.jpg', stack: ['Python', 'D3.js'] },
                        { id: 2, title: 'Documentary Reel 2025', type: 'video', mediaUrl: 'assets/reel-snippet.mp4', stack: ['Premiere', 'After Effects'] }
                    ])
                });
            }, 800);
        });
    }
}

// Bootstrap the application once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', () => {
    const app = new DigitalGardenHub();
    app.init();
    
    // Expose app to window for data-viz.js and animations.js to query state if needed
    window.GardenHub = app; 
});