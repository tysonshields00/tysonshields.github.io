/**
 * utils.js - General Helper Functions
 * Tyson W. Shields | 2026
 */

const Utils = {
    
    /**
     * Formatting & Math Helpers
     * Useful for the data-visualization and lab apps
     */
    
    // Formats numbers to include commas (e.g., 10000 -> 10,000)
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Maps a value from one range to another (essential for D3/Data Viz logic)
    mapRange: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * DOM & UI Helpers
     */
    
    // Selects elements more concisely
    $: (selector) => document.querySelector(selector),
    $$: (selector) => document.querySelectorAll(selector),

    // Safely creates an element with classes and attributes
    createElement: (tag, className, attributes = {}) => {
        const el = document.createElement(tag);
        if (className) el.classList.add(className);
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    },

    /**
     * Theme & Preference Helpers
     */
    
    // Checks if the user's OS is set to dark mode
    isDarkMode: () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    // Simple delay for async operations (useful for simulated loading states)
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * URL & Pathing Helpers
     */
    
    // Gets a specific query parameter from the URL
    getQueryParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
};

// Exporting so it can be used globally or as a module
window.Utils = Utils;