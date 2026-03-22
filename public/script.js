// script.js
// ==========
/* ----------------------------------------------------------------
   DATA MODEL — Single network view (providers + consumers)
---------------------------------------------------------------- */
const nodes = [
    { id:1, components:['Desktop App','Local Agents','Local AI Models'], role:'provider' },
    { id:2, components:['Desktop App','Local Agents'], role:'consumer' },
    { id:3, components:['Desktop App','Local Agents','Local AI Models'], role:'provider' },
    { id:4, components:['Desktop App','Local Agents'], role:'consumer' },
    { id:5, components:['Desktop App','Local Agents','Local AI Models'], role:'provider' },
    { id:6, components:['Desktop App','Local Agents'], role:'consumer' },
    { id:7, components:['Desktop App','Local Agents','Local AI Models'], role:'provider' },
    { id:8, components:['Desktop App','Local Agents'], role:'consumer' },
    { id:9, components:['Desktop App','Local Agents','Local AI Models'], role:'provider' },
    { id:10,components:['Desktop App','Local Agents'], role:'consumer' }
];

const connections = [
    [2,3],[4,5],[6,7],[8,7],[10,9]
];

/* ----------------------------------------------------------------
   DOM HOOK-UP
---------------------------------------------------------------- */
const container      = document.querySelector('.container');
const canvas         = document.getElementById('networkCanvas');
const ctx            = canvas.getContext('2d');
const nodesContainer = document.getElementById('nodes');
const detailPanel    = document.getElementById('detail-panel');

/* ----------------------------------------------------------------
   NODE ELEMENT CREATION
---------------------------------------------------------------- */
nodes.forEach(node => {
    const el = document.createElement('div');
    el.className = `node ${node.role === 'provider' ? 'provider-node' : 'consumer-node'}`;
    el.innerHTML = `
        <svg viewBox="0 0 24 24" width="40" height="40">
            <path d="M20 3H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6v2H8v2h8v-2h-2v-2h6
                     c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H4V5h16v12z"/>
        </svg>
        <div class="node-label">${node.role === 'provider' ? 'Provider' : 'Consumer'}</div>`;
    el.addEventListener('mouseenter', () => showDetail(node));
    el.addEventListener('mouseleave', hideDetail);
    nodesContainer.appendChild(el);
    node.el = el;
});

/* ----------------------------------------------------------------
   LAYOUT — runs on load + every resize
---------------------------------------------------------------- */
function layoutNetwork() {
    const size = container.clientWidth;
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const Cx = size / 2, Cy = size / 2;
    const outerR = size * 0.35, innerR = size * 0.15;
    const step = (2 * Math.PI) / 8;

    nodes.forEach((node, i) => {
        if (i < 8) {
            node.x = Cx + outerR * Math.cos(i * step);
            node.y = Cy + outerR * Math.sin(i * step);
        } else {
            const a = (i - 8) * Math.PI + Math.PI / 4;
            node.x = Cx + innerR * Math.cos(a);
            node.y = Cy + innerR * Math.sin(a);
        }
        node.el.style.left = `${node.x}px`;
        node.el.style.top  = `${node.y}px`;
    });

    drawConnections();
}

window.addEventListener('resize', layoutNetwork);
layoutNetwork();

/* ----------------------------------------------------------------
   CANVAS DRAW
---------------------------------------------------------------- */
function drawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    connections.forEach(([fromId, toId]) => {
        const from = nodes.find(n => n.id === fromId);
        const to   = nodes.find(n => n.id === toId);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    });
    ctx.setLineDash([]);
}

/* ----------------------------------------------------------------
   DETAIL PANEL HELPERS
---------------------------------------------------------------- */
function showDetail(node) {
    const label = node.role === 'provider' ? 'Provider' : 'Consumer';
    const statusClass = node.role === 'provider' ? 'active' : 'limited';
    const statusText = node.role === 'provider' ? 'sovereign privacy' : 'network consumer';
    detailPanel.innerHTML = `
        <h3>${label}</h3>
        <ul>
            ${node.components.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <div class="status ${statusClass}">
            ${statusText}
        </div>`;
    const panelW = 280;
    const offsetX = node.x + 70;
    detailPanel.style.left = `${offsetX + panelW > container.clientWidth ? node.x - panelW - 20 : offsetX}px`;
    detailPanel.style.top  = `${node.y - 30}px`;
    detailPanel.classList.add('show');
}

function hideDetail() {
    detailPanel.classList.remove('show');
}

/* ----------------------------------------------------------------
   HEADER SCROLL EFFECT
---------------------------------------------------------------- */
window.addEventListener('scroll', () => {
    document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 50);
});

/* ----------------------------------------------------------------
   ANIMATED STARFIELD BACKGROUND
---------------------------------------------------------------- */
const starCanvas = document.getElementById('starsCanvas');
const starCtx    = starCanvas.getContext('2d');

const STAR_DENSITY   = 12;
const STAR_MIN_SPEED = 0.03;
const STAR_MAX_SPEED = 0.10;

const SHOOT_CHANCE   = 0.003;
const SHOOT_MIN_SPEED = 1.5;
const SHOOT_MAX_SPEED = 3.0;
const SHOOT_LEN      = 150;
const SHOOT_LIFE     = 120;

let stars = [], shootingStars = [];

function resizeStars() {
    const rect = document.getElementById('hero').getBoundingClientRect(),
          dpr  = window.devicePixelRatio || 1;

    starCanvas.width  = rect.width  * dpr;
    starCanvas.height = rect.height * dpr;
    starCanvas.style.width  = `${rect.width}px`;
    starCanvas.style.height = `${rect.height}px`;
    starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.floor(rect.width / STAR_DENSITY);
    stars = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 1.5 + 0.2,
        s: Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED) + STAR_MIN_SPEED
    }));
}

function animateStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

    stars.forEach(star => {
        star.y += star.s;
        if (star.y > starCanvas.height / (window.devicePixelRatio || 1)) star.y = 0;
        starCtx.beginPath();
        starCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        starCtx.fillStyle = 'rgba(255,255,255,0.8)';
        starCtx.fill();
    });

    if (Math.random() < SHOOT_CHANCE) {
        const angle = (Math.random() * Math.PI / 2) + Math.PI / 4;
        const speed = Math.random() * (SHOOT_MAX_SPEED - SHOOT_MIN_SPEED) + SHOOT_MIN_SPEED;
        const dir   = Math.random() < 0.5 ? 1 : -1;
        shootingStars.push({
            x: Math.random() * starCanvas.width / (window.devicePixelRatio || 1),
            y: 0,
            vx: dir * speed * Math.cos(angle),
            vy: speed * Math.sin(angle),
            life: 0
        });
    }

    shootingStars.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;

        starCtx.beginPath();
        starCtx.moveTo(s.x, s.y);
        starCtx.lineTo(s.x - s.vx * SHOOT_LEN, s.y - s.vy * SHOOT_LEN);
        starCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        starCtx.lineWidth   = 2;
        starCtx.stroke();

        if (s.life > SHOOT_LIFE) shootingStars.splice(i, 1);
    });

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', resizeStars);
resizeStars();
requestAnimationFrame(animateStars);

/* ----------------------------------------------------------------
   TYPEWRITER EFFECT
---------------------------------------------------------------- */
(function() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = ['Uncensorable.', 'Unstoppable.'];
    let phraseIdx = 0, charIdx = 0, deleting = false;

    function type() {
        const phrase = phrases[phraseIdx];
        if (!deleting) {
            el.textContent = phrase.slice(0, charIdx + 1);
            charIdx++;
            if (charIdx === phrase.length) {
                setTimeout(() => { deleting = true; type(); }, 2000);
                return;
            }
            setTimeout(type, 80);
        } else {
            el.textContent = phrase.slice(0, charIdx);
            charIdx--;
            if (charIdx < 0) {
                deleting = false;
                charIdx = 0;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                setTimeout(type, 500);
                return;
            }
            setTimeout(type, 40);
        }
    }
    setTimeout(type, 1000);
})();
