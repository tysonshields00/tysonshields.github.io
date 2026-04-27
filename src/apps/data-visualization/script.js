/**
 * script.js - Data Visualization Logic
 * Located in: src/apps/data-visualization/
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('main-canvas');
    const updateBtn = document.getElementById('update-data');
    const vizSelector = document.getElementById('viz-type');

    // Configuration for the visualization
    const config = {
        width: 800,
        height: 400,
        padding: 50,
        pointCount: 100,
        color: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#38bdf8'
    };

    /**
     * Core Visualization Engine
     */
    const renderVisualization = () => {
        const type = vizSelector.value;
        
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        canvas.innerHTML = ''; // Clear previous render

        // Create an SVG element dynamically
        const svg = Utils.createElement('svg', 'viz-svg', {
            viewBox: `0 0 ${config.width} ${config.height}`,
            width: '100%',
            height: '100%'
        });

        if (type === 'distribution') {
            drawNormalDistribution(svg);
        } else {
            drawPlaceholder(svg, type);
        }

        canvas.appendChild(svg);
    };

    /**
     * Draws a Normal Distribution curve using Math logic
     */
    const drawNormalDistribution = (svg) => {
        const mean = config.width / 2;
        const stdDev = 80;
        let pathData = `M 0 ${config.height}`;

        for (let x = 0; x <= config.width; x += 5) {
            // Normal Distribution Formula: f(x) = (1 / (σ * sqrt(2π))) * e^(-(x - μ)^2 / (2σ^2))
            const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
            const yValue = Math.exp(exponent);
            
            // Use Utils.mapRange to scale the bell curve to the canvas height
            const yPos = Utils.mapRange(yValue, 0, 1, config.height - config.padding, config.padding);
            
            pathData += ` L ${x} ${yPos}`;
        }

        pathData += ` L ${config.width} ${config.height} Z`;

        const path = Utils.createElement('path', 'dist-path', {
            d: pathData,
            fill: config.color,
            'fill-opacity': '0.2',
            stroke: config.color,
            'stroke-width': '2'
        });

        svg.appendChild(path);
    };

    /**
     * Basic Placeholder for other viz types
     */
    const drawPlaceholder = (svg, type) => {
        const text = Utils.createElement('text', 'placeholder-text', {
            x: config.width / 2,
            y: config.height / 2,
            'text-anchor': 'middle',
            fill: 'var(--text-muted)'
        });
        text.textContent = `${type.toUpperCase()} View - Data Engine Active`;
        svg.appendChild(text);
    };

    // Event Listeners
    updateBtn?.addEventListener('click', () => {
        console.log("Refreshing statistical model...");
        renderVisualization();
    });

    vizSelector?.addEventListener('change', renderVisualization);

    // Initial Render
    renderVisualization();
});