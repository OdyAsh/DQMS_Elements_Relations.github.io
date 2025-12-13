// Event handlers for node and edge interactions

import { state } from './config.js';

let linkedByIndex = {};

export function setLinkedByIndex(index) {
    linkedByIndex = index;
}

export function neighboring(a, b) {
    return a.index == b.index || linkedByIndex[a.index + "," + b.index];
}

export function mouseover(d, div) {
    const str_link_status = d.wiki_link === "-" 
        ? "<td id=2>-</td>"
        : `<td id=2><a href="${d.wiki_link}" target='_blank'>Link</a></td>`;

    let mouse_x = d3.event.pageX;
    let mouse_y = d3.event.pageY;

    if (mouse_x + 110 > 1480) {
        mouse_x = mouse_x - 120;
    }

    if (mouse_y - 15 < 115) {
        mouse_y = mouse_y + 10;
    } else {
        mouse_y = mouse_y - 30;
    }

    div.transition()
        .duration(200)
        .style("opacity", .9)
        .style('pointer-events', 'auto');

    div.html(
        "<table>" +
        "<tr>" +
        "<td><strong>Wiki source: </strong></td>" +
        str_link_status +
        "</tr>" +
        "</table>"
    )
    .style("left", (mouse_x + 0) + "px")
    .style("top", (mouse_y) + "px");
    
    // Keep tooltip visible when hovering over it
    div.on('mouseenter', function() {
        div.transition()
            .duration(200)
            .style("opacity", .9)
            .style('pointer-events', 'auto');
    });
    
    div.on('mouseleave', function() {
        mouseout(div);
    });
}

export function mouseout(div) {
    div.transition()
        .duration(500)
        .style("opacity", 0)
        .style('pointer-events', 'none');
}

export function click(d) {
    if (d3.event.defaultPrevented) return;

    if (state.flagSelectedElements === "off") {
        if (state.toggle == 0) {
            // Highlight logic
            highlightNode.call(this, d);
            state.toggle = 1;
        } else {
            // Reset logic
            resetHighlight.call(this);
            state.toggle = 0;
        }
    }
}

// Public function to trigger node click programmatically
export function clickNode(nodeData, nodeElement) {
    if (state.flagSelectedElements === "off") {
        if (state.toggle == 0) {
            // Highlight logic
            highlightNodeDirect(nodeData, nodeElement);
            state.toggle = 1;
        } else {
            // Reset logic
            resetHighlight();
            state.toggle = 0;
        }
    }
}

function highlightNode(d) {
    // Get theme colors
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--p') || '49.12% 0.3096 275.75';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ffffff' : '#1a1a1a';
    const linkColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(26, 26, 26, 0.3)';
    const nodeStrokeColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(26, 26, 26, 0.2)';
    const textColorAlpha = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(26, 26, 26, 0.4)';
    
    d3.select(this).select("circle")
        .transition()
        .duration(200)
        .attr("r", 12)
        .style("stroke", `oklch(${primaryColor})`)
        .style("stroke-width", "3px");

    d3.select(this)
        .select("text")
        .attr("x", 4)
        .style("font-weight", "700")
        .style("font-size", "15px");

    d3.selectAll(".link")
        .style("stroke", linkColor)
        .style("opacity", function(o) {
            return o.source === d || o.target === d ? 1 : 0.1;
        });

    d3.selectAll("circle")
        .style("stroke", function(o) {
            return neighboring(d, o) == 1 ? `oklch(${primaryColor})` : nodeStrokeColor;
        })
        .style("stroke-width", function(o) {
            return neighboring(d, o) == 1 ? "2.5px" : "2px";
        });

    d3.selectAll(".node")
        .style("opacity", function(o) {
            return neighboring(d, o) ? 1 : .1;
        });

    if ((state.flagLinks === "on" && state.flagLabels === "off") || 
        (state.flagLinks === "on" && state.flagLabels === "on")) {
        d3.selectAll(".edgelabel")
            .style("opacity", function(o) {
                return o.source === d || o.target === d ? 1 : 0;
            })
            .attr("fill", function(o) {
                return o.source === d || o.target === d ? textColor : textColorAlpha;
            });
    }

    updateArrowhead();
}

// Direct highlight function that can be called programmatically
function highlightNodeDirect(d, nodeElement) {
    // Get theme colors
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--p') || '49.12% 0.3096 275.75';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ffffff' : '#1a1a1a';
    const linkColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(26, 26, 26, 0.3)';
    const nodeStrokeColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(26, 26, 26, 0.2)';
    const textColorAlpha = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(26, 26, 26, 0.4)';
    
    if (nodeElement) {
        d3.select(nodeElement).select("circle")
            .transition()
            .duration(200)
            .attr("r", 12)
            .style("stroke", `oklch(${primaryColor})`)
            .style("stroke-width", "3px");

        d3.select(nodeElement)
            .select("text")
            .attr("x", 4)
            .style("font-weight", "700")
            .style("font-size", "15px");
    }

    d3.selectAll(".link")
        .style("stroke", linkColor)
        .style("opacity", function(o) {
            return o.source === d || o.target === d ? 1 : 0.1;
        });

    d3.selectAll("circle")
        .style("stroke", function(o) {
            return neighboring(d, o) == 1 ? `oklch(${primaryColor})` : nodeStrokeColor;
        })
        .style("stroke-width", function(o) {
            return neighboring(d, o) == 1 ? "2.5px" : "2px";
        });

    d3.selectAll(".node")
        .style("opacity", function(o) {
            return neighboring(d, o) ? 1 : .1;
        });

    if ((state.flagLinks === "on" && state.flagLabels === "off") || 
        (state.flagLinks === "on" && state.flagLabels === "on")) {
        d3.selectAll(".edgelabel")
            .style("opacity", function(o) {
                return o.source === d || o.target === d ? 1 : 0;
            })
            .attr("fill", function(o) {
                return o.source === d || o.target === d ? textColor : textColorAlpha;
            });
    }

    updateArrowhead();
}

function resetHighlight() {
    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColorAlpha = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 26, 0.7)';
    const linkColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(26, 26, 26, 0.3)';
    const nodeStrokeColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(26, 26, 26, 0.2)';
    
    d3.selectAll("circle")
        .transition()
        .duration(200)
        .attr("r", 9)
        .style("stroke", nodeStrokeColor)
        .style("stroke-width", "2px");

    d3.select(this).select("text")
        .attr("x", 1)
        .style("font-weight", "600")
        .style("font-size", "13px");

    d3.selectAll(".link")
        .style("stroke", linkColor)
        .style("stroke-width", "2px")
        .style("opacity", 0.4);

    d3.selectAll(".node")
        .style("opacity", 1);

    if (state.flagLinks === "on" && state.flagLabels === "on") {
        d3.selectAll(".edgelabel").style("opacity", 1);
    } else {
        d3.selectAll(".edgelabel").style("opacity", 0);
    }

    d3.selectAll(".edgelabel").attr("fill", textColorAlpha);

    updateArrowhead();
}

function updateArrowhead() {
    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const arrowColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(26, 26, 26, 0.5)';
    
    d3.selectAll("#arrowhead path")
        .attr('fill', arrowColor)
        .style('fill', arrowColor)
        .style('stroke', 'none');
}

export function contextMenu(d, i) {
    d3.event.preventDefault();
    console.log("context menu used");
    // Add menu items here per action
    // https://dev.to/gilfink/adding-a-context-menu-to-d3-force-graph-4f5f
}

export function mouseoverEdges(d) {
    // Placeholder for edge hover functionality
}

export function zoom() {
    const scale = d3.event.scale;
    const translation = d3.event.translate;
    d3.select(".drawarea")
        .attr("transform", "translate(" + translation + ")" +
              " scale(" + scale + ")");
}

