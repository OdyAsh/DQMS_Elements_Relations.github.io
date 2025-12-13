// Main initialization and orchestration

import { 
    createForceLayout, 
    createSVG, 
    setupZoom,
    createStatusText,
    createTooltip,
    createArrowMarker,
    prepareGraphData,
    renderGraph 
} from './graph-renderer.js';

import { 
    initializeRadioButtons, 
    initializeCheckboxes 
} from './ui-controls.js';

import { 
    initializeSearch 
} from './search.js';

// Initialize the visualization
function init() {
    const force = createForceLayout();
    const svg = createSVG();
    
    setupZoom();
    createStatusText(svg);
    
    const div = createTooltip();
    
    createArrowMarker(svg);
    
    // Load data and render
    d3.json("Data/Data.json", function(error, graph) {
        if (error) {
            console.error("Error loading data:", error);
            return;
        }
        
        const preparedGraph = prepareGraphData(graph);
        renderGraph(force, svg, preparedGraph, div);
        
        // Initialize UI controls
        initializeRadioButtons();
        initializeCheckboxes();
        
        // Initialize search functionality
        initializeSearch(preparedGraph.nodes);
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

