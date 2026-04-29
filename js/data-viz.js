/**
 * data-viz.js
 * D3 visualization orchestrator for tysonshields.com
 * Handles scroll-triggered rendering, weighted transitions, and responsive resizing.
 */

class VizEngine {
    constructor() {
        this.activeCharts = new Map();
        
        // Grab CSS tokens for D3 to use natively
        const styles = getComputedStyle(document.documentElement);
        this.tokens = {
            accent: styles.getPropertyValue('--accent').trim() || '#3b82f6',
            textDim: styles.getPropertyValue('--text-muted').trim() || '#4b5563',
            textPrimary: styles.getPropertyValue('--text-primary').trim() || '#f3f4f6',
            fontMono: styles.getPropertyValue('--font-mono').trim() || '"JetBrains Mono", monospace'
        };

        // ResizeObserver to handle responsive repaints without full re-initialization
        this.resizeObserver = new ResizeObserver(entries => {
            // Debounce the resize to prevent aggressive repainting
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                for (let entry of entries) {
                    const id = entry.target.id;
                    if (this.activeCharts.has(id)) {
                        this.updateChartDimensions(id, entry.contentRect);
                    }
                }
            }, 150);
        });

        this.init();
    }

    init() {
        // Listen for the custom event dispatched by animations.js
        document.addEventListener('garden:vizEnterViewport', (e) => {
            const targetId = e.detail.target;
            this.renderChart(targetId);
        });
    }

    /**
     * Router for different visualization containers
     */
    renderChart(containerId) {
        // Prevent re-rendering if it already exists
        if (this.activeCharts.has(containerId)) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        // Retrieve hydrated data from the core hub
        const appData = window.GardenHub ? window.GardenHub.state.projects : [];

        // Route to the correct chart method based on ID or data attributes
        let chartInstance;
        if (containerId === 'bridge-canvas' || container.classList.contains('viz-scatter')) {
            chartInstance = this.renderScatterPlot(container, appData);
        }

        if (chartInstance) {
            this.activeCharts.set(containerId, chartInstance);
            this.resizeObserver.observe(container);
        }
    }

    /**
     * Modular Chart: Scatter Plot / Project Distribution
     */
    renderScatterPlot(container, data) {
        // Clear any placeholder canvas or noscript content
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 400;
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Setup SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('width', '100%')
            .style('height', '100%');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .attr('class', 'chart-group');

        // Mock scales assuming data has 'complexity' and 'impact' scores
        // In production you would map these to actual project metrics
        const xScale = d3.scaleLinear()
            .domain([0, 100]) 
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        // Minimalist Axes
        const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale).ticks(4).tickSizeOuter(0);

        // X Axis Styling
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .call(g => g.select('.domain').attr('stroke', this.tokens.textDim))
            .call(g => g.selectAll('.tick line').attr('stroke', this.tokens.textDim))
            .call(g => g.selectAll('.tick text')
                .attr('fill', this.tokens.textDim)
                .style('font-family', this.tokens.fontMono)
            );

        // Y Axis Styling
        g.append('g')
            .attr('class', 'y-axis')
            .call(yAxis)
            .call(g => g.select('.domain').attr('stroke', this.tokens.textDim))
            .call(g => g.selectAll('.tick line').attr('stroke', this.tokens.textDim))
            .call(g => g.selectAll('.tick text')
                .attr('fill', this.tokens.textDim)
                .style('font-family', this.tokens.fontMono)
            );

        // Render Data Points with Rhythmic Transitions
        const nodes = g.selectAll('circle.data-node')
            .data(data, d => d.id);

        // D3 Enter selection with staggered transition
        nodes.enter()
            .append('circle')
            .attr('class', 'data-node')
            .attr('cx', d => xScale(d.complexity || Math.random() * 100)) // Fallback math for testing
            .attr('cy', d => yScale(d.impact || Math.random() * 100))
            .attr('r', 0)
            .attr('fill', this.tokens.accent)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseenter', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .ease(d3.easeCubicOut)
                    .attr('r', 8)
                    .attr('opacity', 1);
                // Trigger tooltip logic here
            })
            .on('mouseleave', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(400)
                    .ease(d3.easeCubicOut)
                    .attr('r', 5)
                    .attr('opacity', 0.8);
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 150) // The rhythmic stagger
            .ease(d3.easeCubicOut) // Mimics your --ease-weighted
            .attr('r', 5);

        // Store configuration for resize handler
        return {
            svg: svg,
            xScale: xScale,
            yScale: yScale,
            margin: margin
        };
    }

    /**
     * Handles dynamic layout shifts without full re-renders
     */
    updateChartDimensions(containerId, rect) {
        const chart = this.activeCharts.get(containerId);
        if (!chart) return;

        const { svg, xScale, yScale, margin } = chart;
        
        const newWidth = rect.width;
        const newHeight = rect.height;
        
        const newInnerWidth = newWidth - margin.left - margin.right;
        const newInnerHeight = newHeight - margin.top - margin.bottom;

        // Update viewBox
        svg.attr('viewBox', `0 0 ${newWidth} ${newHeight}`);

        // Update scale ranges
        xScale.range([0, newInnerWidth]);
        yScale.range([newInnerHeight, 0]);

        // Re-call axes and smoothly transition node positions
        const t = svg.transition().duration(400).ease(d3.easeCubicOut);

        svg.select('.x-axis')
            .transition(t)
            .attr('transform', `translate(0,${newInnerHeight})`)
            .call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0));

        svg.select('.y-axis')
            .transition(t)
            .call(d3.axisLeft(yScale).ticks(4).tickSizeOuter(0));

        svg.selectAll('circle.data-node')
            .transition(t)
            .attr('cx', d => xScale(d.complexity || Math.random() * 100))
            .attr('cy', d => yScale(d.impact || Math.random() * 100));
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    // Only load if D3 is present
    if (typeof d3 !== 'undefined') {
        window.GardenViz = new VizEngine();
    } else {
        console.warn('VizEngine: D3.js is required but not loaded.');
    }
});