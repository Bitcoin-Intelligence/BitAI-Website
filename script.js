// Define the nodes with their components (5 nodes with 3 components, 5 with 2 components)
const nodes = [
    { id: 1, components: ['Desktop App', 'Agent', 'Local AI Model'], x: 0, y: 0 },
    { id: 2, components: ['Desktop App', 'Agent'], x: 0, y: 0 },
    { id: 3, components: ['Desktop App', 'Agent', 'Local AI Model'], x: 0, y: 0 },
    { id: 4, components: ['Desktop App', 'Agent'], x: 0, y: 0 },
    { id: 5, components: ['Desktop App', 'Agent', 'Local AI Model'], x: 0, y: 0 },
    { id: 6, components: ['Desktop App', 'Agent'], x: 0, y: 0 },
    { id: 7, components: ['Desktop App', 'Agent', 'Local AI Model'], x: 0, y: 0 },
    { id: 8, components: ['Desktop App', 'Agent'], x: 0, y: 0 },
    { id: 9, components: ['Desktop App', 'Agent', 'Local AI Model'], x: 0, y: 0 },
    { id: 10, components: ['Desktop App', 'Agent'], x: 0, y: 0 }
];

// Define connections based on the screenshot
const connections = [
    [2, 3],  // Node 2 → Node 3
    [4, 5],  // Node 4 → Node 5
    [6, 7],  // Node 6 → Node 7
    [8, 7],  // Node 8 → Node 7
    [10, 9]  // Node 10 → Node 9
];

// Canvas setup for drawing connections
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 700;

// Calculate node positions: 8 on octagon, 2 inside
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const outerRadius = 250;
const innerRadius = 100;
const angleStep = (2 * Math.PI) / 8;

nodes.forEach((node, index) => {
    if (index < 8) {
        // Outer octagon nodes
        node.x = centerX + outerRadius * Math.cos(index * angleStep);
        node.y = centerY + outerRadius * Math.sin(index * angleStep);
    } else {
        // Inner nodes (slightly offset for visual distinction)
        const innerAngle = (index - 8) * Math.PI + Math.PI / 4; // Offset for inner nodes
        node.x = centerX + innerRadius * Math.cos(innerAngle);
        node.y = centerY + innerRadius * Math.sin(innerAngle);
    }
});

// Create node elements
const nodesContainer = document.getElementById('nodes');
const detailPanel = document.getElementById('detail-panel');

nodes.forEach(node => {
    const nodeElement = document.createElement('div');
    nodeElement.className = `node ${node.components.length === 3 ? 'three-components' : ''}`;
    nodeElement.style.left = `${node.x}px`;
    nodeElement.style.top = `${node.y}px`;

    // Add transparent desktop icon (SVG with reduced fill-opacity)
    const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" fill-opacity="0.7">
            <path d="M20 3H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6v2H8v2h8v-2h-2v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H4V5h16v12z"/>
        </svg>`;
    nodeElement.innerHTML = iconSvg;

    // Add node label
    const label = document.createElement('div');
    label.className = 'node-label';
    label.textContent = `Node ${node.id}`;
    nodeElement.appendChild(label);

    // Hover events
    nodeElement.addEventListener('mouseenter', () => {
        detailPanel.innerHTML = `
            <h3>Node ${node.id}</h3>
            <ul>
                ${node.components.map(comp => `<li class="${comp.toLowerCase().replace(' ', '-')}" style="text-transform: capitalize">${comp}</li>`).join('')}
            </ul>
            <div class="status ${node.components.length === 3 ? 'active' : 'limited'}">
                ${node.components.length === 3 ? 'Active (Full)' : 'Limited'}
            </div>
        `;
        const panelWidth = 280;
        const offsetX = node.x + 60;
        detailPanel.style.left = `${offsetX + panelWidth > canvas.width ? node.x - panelWidth - 20 : offsetX}px`;
        detailPanel.style.top = `${node.y - 20}px`;
        detailPanel.classList.add('show');
    });
    nodeElement.addEventListener('mouseleave', () => {
        detailPanel.classList.remove('show');
    });

    nodesContainer.appendChild(nodeElement);
});

// Draw connections
function drawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dashed lines for P2P aesthetic

    connections.forEach(([fromId, toId]) => {
        const fromNode = nodes.find(node => node.id === fromId);
        const toNode = nodes.find(node => node.id === toId);
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
    });

    ctx.setLineDash([]); // Reset to solid lines
}

// Open Node 7's detail panel by default
const node7 = nodes.find(node => node.id === 7);
detailPanel.innerHTML = `
    <h3>Node ${node7.id}</h3>
    <ul>
        ${node7.components.map(comp => `<li class="${comp.toLowerCase().replace(' ', '-')}" style="text-transform: capitalize">${comp}</li>`).join('')}
    </ul>
    <div class="status ${node7.components.length === 3 ? 'active' : 'limited'}">
        ${node7.components.length === 3 ? 'Active (Full)' : 'Limited'}
    </div>
`;
const panelWidth = 280;
const offsetX = node7.x + 60;
detailPanel.style.left = `${offsetX + panelWidth > canvas.width ? node7.x - panelWidth - 20 : offsetX}px`;
detailPanel.style.top = `${node7.y - 20}px`;
detailPanel.classList.add('show');

drawConnections();
