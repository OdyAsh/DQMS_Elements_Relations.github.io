// UI Controls: Radio buttons and checkboxes

import { state } from './config.js';

export function updateLabels() {
    d3.select("#chk_box2").each(function(o) {
        const cb_labels = d3.select(this);
        
        if (cb_labels.property("checked")) {
            state.flagLabels = "on";
            d3.selectAll(".edgelabel").style("opacity", 1);
        } else {
            state.flagLabels = "off";
            d3.selectAll(".edgelabel").style("opacity", 0);
        }
    });
    
    return state.flagLabels;
}

export function updateLinks() {
    d3.select("#chk_box1").each(function(o) {
        const cb_links = d3.select(this);
        
        if (cb_links.property("checked")) {
            state.flagLinks = "on";
            d3.selectAll(".link").style("display", "inline");
            d3.select("#chk_box2").attr("disabled", null);
        } else {
            state.flagLinks = "off";
            d3.selectAll(".link").style("display", "none");
            d3.select("#chk_box2").attr("disabled", true);
            d3.select('#chk_box2').property('checked', false);
            d3.selectAll(".edgelabel").style("opacity", 0);
            updateLabels();
        }
    });
    
    return state.flagLinks;
}

function setLegendOpacity(activeDot) {
    const dots = [".dot1", ".dot4", ".dot2", ".dot3", ".dot5", ".dot6"];
    dots.forEach((dot, index) => {
        const opacity = dot === activeDot ? 1 : 0.1;
        d3.select(dot).transition().duration(300).style("opacity", opacity);
    });
}

function disableCheckboxes() {
    d3.select('#chk_box1').property('checked', false);
    d3.select("#chk_box1").attr("disabled", true);
    d3.select('#chk_box2').property('checked', false);
    d3.select("#chk_box2").attr("disabled", true);
}

function filterNodesByGroup(groupId, activeDot) {
    d3.selectAll(".node")
        .transition()
        .duration(300)
        .style("opacity", function(d) {
            return d.group != groupId ? 0.1 : 1;
        });
    
    state.flagLinks = "off";
    state.flagLabels = "off";
    state.flagSelectedElements = "on";
    
    setLegendOpacity(activeDot);
    disableCheckboxes();
    
    updateLinks();
    updateLabels();
}

export function initializeRadioButtons() {
    const buttons = d3.selectAll('input');
    buttons.on('change', function(d) {
        const value = this.value;
        
        const groupMap = {
            "Uncategorised": { group: 0, dot: ".dot1" },
            "Operational": { group: 1, dot: ".dot4" },
            "Tactical": { group: 2, dot: ".dot2" },
            "Strategic": { group: 3, dot: ".dot3" },
            "Objective": { group: 4, dot: ".dot5" },
            "MS": { group: 5, dot: ".dot6" }
        };
        
        if (groupMap[value]) {
            filterNodesByGroup(groupMap[value].group, groupMap[value].dot);
        } else if (value === "All") {
            // Show all nodes
            d3.selectAll(".node")
                .transition()
                .duration(300)
                .style("opacity", 1);
            
            // Show all legend dots
            setLegendOpacity(null);
            d3.selectAll(".dot1, .dot4, .dot2, .dot3, .dot5, .dot6")
                .transition()
                .duration(300)
                .style("opacity", 1);
            
            d3.select("#chk_box1").attr("disabled", null);
            d3.select("#chk_box2").attr("disabled", true);
            
            state.flagSelectedElements = "off";
            
            updateLinks();
            updateLabels();
        }
        
        return state.flagSelectedElements;
    });
}

export function initializeCheckboxes() {
    d3.select("#chk_box1").on("change", updateLinks);
    d3.select("#chk_box2").on("change", updateLabels);
}

