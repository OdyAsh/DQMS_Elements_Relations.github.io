// Configuration and constants for the DQMS visualization

export const config = {
    width: 1100,
    height: 630,
    margin: { top: 8, right: 10, bottom: 100, left: 0 },
    w: 1100,
    h: 630,
    r: 6,
    padding: 1.5,
    clusterPadding: 6,
    maxRadius: 12,
    m: 20
};

export const colors = [
    "#C40233",  // 0: Supporting/Uncategorised
    "#9DC3E6",  // 1: Operational
    "#5B9BD5",  // 2: Tactical
    "#1F4E79",  // 3: Strategic
    "#FF8E1D",  // 4: Objective
    "#FFEB3B"   // 5: Management System
];

export const state = {
    toggle: 0,
    flagLinks: "off",
    flagLabels: "off",
    flagSelectedElements: "off"
};

