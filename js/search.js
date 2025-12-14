// Node search functionality

import { colors } from './config.js';
import { clickNode } from './event-handlers.js';

let graphNodes = [];
let nodeElements = null;

// Initialize search with graph data
export function initializeSearch(nodes) {
    graphNodes = nodes;
    
    const searchInput = document.getElementById('node-search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Handle input changes
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length === 0) {
            hideSearchResults();
            return;
        }
        
        // Filter nodes that match the query
        const matches = graphNodes.filter(node => 
            node.name.toLowerCase().includes(query)
        ).slice(0, 10); // Limit to 10 results
        
        displaySearchResults(matches, query);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            hideSearchResults();
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideSearchResults();
            searchInput.blur();
        }
    });
}

function displaySearchResults(matches, query) {
    const searchResults = document.getElementById('search-results');
    
    if (matches.length === 0) {
        searchResults.innerHTML = '<li class="disabled"><a class="text-sm opacity-60">No results found</a></li>';
        searchResults.classList.remove('hidden');
        return;
    }
    
    // Build results HTML
    searchResults.innerHTML = matches.map(node => {
        const highlightedName = highlightMatch(node.name, query);
        const color = colors[node.group];
        
        return `
            <li>
                <a href="#" class="search-result-item" data-node-name="${node.name}">
                    <div class="flex items-center gap-3 w-full">
                        <div class="w-3 h-3 rounded-full shrink-0" style="background-color: ${color};"></div>
                        <span class="text-sm flex-1">${highlightedName}</span>
                    </div>
                </a>
            </li>
        `;
    }).join('');
    
    searchResults.classList.remove('hidden');
    
    // Add click handlers to results
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const nodeName = this.getAttribute('data-node-name');
            selectNodeByName(nodeName);
            hideSearchResults();
            document.getElementById('node-search-input').value = '';
        });
    });
}

function highlightMatch(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return `${before}<mark class="bg-primary text-primary-content px-0.5 rounded">${match}</mark>${after}`;
}

function hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
    }
}

// Trigger click event on a node by name
export function selectNodeByName(nodeName) {
    // Find the node in the graph data
    const node = graphNodes.find(n => n.name === nodeName);
    if (!node) {
        console.warn('Node not found:', nodeName);
        return;
    }
    
    // Find the corresponding DOM element
    const nodes = d3.selectAll('.node');
    let targetNodeElement = null;
    let targetNodeData = null;
    
    nodes.each(function(d) {
        if (d.name === nodeName) {
            targetNodeElement = this;
            targetNodeData = d;
        }
    });
    
    if (targetNodeElement && targetNodeData) {
        // Use the clickNode function to properly highlight the node
        clickNode(targetNodeData, targetNodeElement);
        
        // Optionally, scroll/pan the graph to center on this node
        centerOnNode(node);
    } else {
        console.warn('Node element not found in DOM:', nodeName);
    }
}

function centerOnNode(node) {
    // Get the current SVG and its dimensions
    const svg = d3.select('#chart svg');
    const chartContainer = document.getElementById('chart');
    
    if (!svg.node() || !chartContainer) return;
    
    // Get container dimensions
    const containerRect = chartContainer.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    
    // Calculate the offset needed to center the node
    // Note: This is a simplified version. For full implementation,
    // you'd need to account for current zoom and pan state
    
    // Visual feedback: briefly highlight the selected node
    d3.selectAll('.node').each(function(d) {
        if (d.name === node.name) {
            const circle = d3.select(this).select('circle');
            
            // Pulse animation
            circle
                .transition()
                .duration(300)
                .attr('r', 14)
                .style('stroke-width', '4px')
                .transition()
                .duration(300)
                .attr('r', 12)
                .style('stroke-width', '3px')
                .transition()
                .duration(300)
                .attr('r', 9)
                .style('stroke-width', '2px');
        }
    });
}

