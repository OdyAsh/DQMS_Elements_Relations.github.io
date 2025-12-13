// D3.js graph rendering logic

import { config, colors } from './config.js';
import { 
    mouseover, 
    mouseout, 
    click, 
    contextMenu, 
    mouseoverEdges, 
    zoom,
    setLinkedByIndex 
} from './event-handlers.js';

export function createForceLayout() {
    return d3.layout.force()
        .charge(-300)
        .linkDistance(200)
        .gravity(0.15)
        .friction(0.85)
        .size([config.width, config.height]);
}

export function createSVG() {
    return d3.select("#chart").append("svg")
        .attr("width", config.width)
        .attr("height", config.height)
        .attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")")
        .attr("class", "w-full")
        .append("svg:g")
        .attr("class", "drawarea")
        .append("svg:g")
        .attr('transform', 'translate(' + [225, 150] + ') scale(' + 0.5 + ')');
}

export function setupZoom() {
    d3.select("#chart svg")
        .call(d3.behavior.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", zoom))
        .on("dblclick.zoom", null);
}

export function createStatusText(svg) {
    // Get computed CSS variable for text color
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--bc') || '0% 0 0';
    
    return d3.select("#chart svg").append("svg")
        .append("text")
        .attr("dy", config.h / 2)
        .attr("dx", (config.w / 2) - 50)
        .style("fill", `oklch(${textColor})`)
        .style("stroke-width", 0)
        .text("Preparing visualisation ....")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .style("font", "14px Arial")
        .transition(1500)
        .duration(1000)
        .style("opacity", 0)
        .style('pointer-events', 'none');
}

export function createTooltip() {
    return d3.select('body').append('div')
        .attr("class", "tooltip-d3 tooltip")
        .style("position", "absolute")
        .style("text-align", "left")
        .style("width", "auto")
        .style("min-width", "110px")
        .style("max-width", "250px")
        .style("color", "oklch(var(--bc))")
        .style("background-color", "oklch(var(--b1))")
        .style("border", "1px solid oklch(var(--bc) / 0.2)")
        .style("font-family", "system-ui, -apple-system, sans-serif")
        .style("font-size", "12px")
        .style("padding", "8px 12px")
        .style("border-radius", "8px")
        .style("box-shadow", "0 4px 12px oklch(var(--bc) / 0.15)")
        .style("pointer-events", "none")
        .style("z-index", "9999")
        .style("opacity", 0)
        .style("backdrop-filter", "blur(8px)")
        .style("transition", "opacity 0.2s ease");
}

export function createArrowMarker(svg) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const arrowColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(26, 26, 26, 0.5)';
    
    svg.append('defs').append('marker')
        .attr("id", 'arrowhead')
        .attr('viewBox', '-0 -3 10 10')
        .attr('refX', 16)
        .attr('refY', 0.01)
        .attr('orient', 'auto')
        .attr('markerWidth', 11)
        .attr('markerHeight', 7)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-3 L 10 ,0 L 0,3 z')
        .attr('fill', arrowColor)
        .attr('class', 'arrow-marker')
        .style('stroke', 'none');
}

export function prepareGraphData(graph) {
    const nodeMap = {};
    graph.nodes.forEach(function(x) { 
        nodeMap[x.name] = x; 
    });
    
    graph.links = graph.links.map(function(x) {
        return {
            source: nodeMap[x.source],
            target: nodeMap[x.target],
            value: x.value,
            property: x.property
        };
    });
    
    return graph;
}

export function renderGraph(force, svg, graph, div) {
    const n = graph.nodes.length;
    
    force.nodes(graph.nodes).links(graph.links);
    
    // Initialize positions deterministically
    graph.nodes.forEach(function(d, i) { 
        d.x = d.y = config.width / n * i; 
    });
    
    setTimeout(function() {
        force.start();
        
        // Pre-compute layout
        for (var i = 150; i > 0; --i) force.tick();
        force.stop();
        
        // Center the graph
        var ox = 0, oy = 0;
        graph.nodes.forEach(function(d) { 
            ox += d.x; 
            oy += d.y; 
        });
        ox = ox / n - config.width / 2;
        oy = oy / n - config.height / 2;
        graph.nodes.forEach(function(d) { 
            d.x -= ox; 
            d.y -= oy; 
        });
        
        force.start();
        
        // Create links
        const link = svg.selectAll(".link")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", "link");
        
        // Create edge paths for arrows
        const edgepaths = svg.selectAll(".edgepath")
            .data(graph.links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 1)
            .attr('id', function(d, i) { return 'edgepath' + i; })
            .on("mouseover", mouseoverEdges)
            .attr('marker-end', 'url(#arrowhead)');
        
        // Create edge labels
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColorAlpha = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 26, 0.7)';
        const strokeColor = isDark ? '#1a1a1a' : '#ffffff';
        
        const linkText = svg.selectAll(".edgelabel")
            .data(graph.links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function(d, i) { return 'edgelabel' + i; })
            .attr("font-family", "system-ui, -apple-system, sans-serif")
            .style("font-weight", "500")
            .style("font-size", "11px")
            .attr('fill', textColorAlpha);
        
        linkText.append('textPath')
            .attr('xlink:href', function(d, i) { return '#edgepath' + i; })
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(d => d.property)
            .style("font-weight", "500")
            .style("font-size", "11px")
            .style("fill", textColorAlpha)
            .style("paint-order", "stroke fill")
            .style("stroke", strokeColor)
            .style("stroke-width", "3px")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round");
        
        // Create nodes
        const node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .on("mouseover", function(d) { mouseover(d, div); })
            .on("mouseout", function(d) { mouseout(div); })
            .on("click", click)
            .on("contextmenu", contextMenu)
            .call(force.drag);
        
        node.append("circle")
            .attr("r", 9)
            .style("fill", function(d) { return colors[d.group]; })
            .style("filter", "drop-shadow(0 2px 4px oklch(var(--bc) / 0.15))")
            .style("transition", "r 0.2s ease, filter 0.2s ease");
        
        // Add hover effect to circles
        node.selectAll("circle")
            .on("mouseenter", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 11)
                    .style("filter", "drop-shadow(0 4px 8px oklch(var(--bc) / 0.25))");
            })
            .on("mouseleave", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 9)
                    .style("filter", "drop-shadow(0 2px 4px oklch(var(--bc) / 0.15))");
            });
        
        const textColor = isDark ? '#ffffff' : '#1a1a1a';
        const textStrokeColor = isDark ? '#1a1a1a' : '#ffffff';
        
        node.append("text")
            .attr("dy", 4)
            .attr("dx", 14)
            .text(d => d.name)
            .attr("font-family", "system-ui, -apple-system, sans-serif")
            .style("font-weight", "600")
            .style("font-size", "13px")
            .style("fill", textColor)
            .style("paint-order", "stroke fill")
            .style("stroke", textStrokeColor)
            .style("stroke-width", "3px")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style("user-select", "none")
            .style("pointer-events", "none");
        
        // Update edge paths
        edgepaths.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + 
                d.source.x + "," + 
                d.source.y + "A" + 
                dr + "," + dr + " 0 0,1 " + 
                d.target.x + "," + 
                d.target.y;
        });
        
        // Update node positions
        node.attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });
        
        // Rotate labels to follow edges
        linkText.attr('transform', function(d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();
                var rx = bbox.x + bbox.width / 2;
                var ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            } else {
                return 'rotate(0)';
            }
        });
        
        // Build linked index for neighbor detection
        const linkedByIndex = {};
        graph.links.forEach(function(d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
            linkedByIndex[d.target.index + "," + d.source.index] = 1;
        });
        
        setLinkedByIndex(linkedByIndex);
        
    }, 30);
}

