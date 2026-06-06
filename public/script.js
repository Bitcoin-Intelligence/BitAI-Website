// script.js
// ==========
/* ----------------------------------------------------------------
   DATA MODEL — Single network view (neurons + users)
---------------------------------------------------------------- */
const nodes = [
    { id:1, components:['Desktop App','Local Agents','Local AI Models'], role:'neuron' },
    { id:2, components:['Desktop App','Local Agents'], role:'user' },
    { id:3, components:['Desktop App','Local Agents','Local AI Models'], role:'neuron' },
    { id:4, components:['Desktop App','Local Agents'], role:'user' },
    { id:5, components:['Desktop App','Local Agents','Local AI Models'], role:'neuron' },
    { id:6, components:['Desktop App','Local Agents'], role:'user' },
    { id:7, components:['Desktop App','Local Agents','Local AI Models'], role:'neuron' },
    { id:8, components:['Desktop App','Local Agents'], role:'user' },
    { id:9, components:['Desktop App','Local Agents','Local AI Models'], role:'neuron' },
    { id:10,components:['Desktop App','Local Agents'], role:'user' }
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
    el.className = `node ${node.role === 'neuron' ? 'provider-node' : 'consumer-node'}`;
    el.innerHTML = `
        <svg viewBox="0 0 24 24" width="40" height="40">
            <path d="M20 3H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6v2H8v2h8v-2h-2v-2h6
                     c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H4V5h16v12z"/>
        </svg>
        <div class="node-label">${node.role === 'neuron' ? 'Neuron' : 'User'}</div>`;
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

    // Animated mode redraws every rAF frame; only static (reduced-motion) needs a redraw here.
    if (prefersReducedMotion) drawConnections();
}

window.addEventListener('resize', layoutNetwork);

/* ----------------------------------------------------------------
   CANVAS DRAW — animated request/response packets + neuron "absorb" pop
     • orange packet = REQUEST,  travels User → Neuron
     • neuron pops bigger (zoom up) then eases back as it absorbs
     • teal packet   = RESPONSE, travels Neuron → User
   Respects prefers-reduced-motion (static dashed lines fallback).
---------------------------------------------------------------- */
const PACKET     = { ORANGE: '#DA7756', TEAL: '#38BFA0' };
const CYCLE_MS   = 6000;
const REQ_FRAC   = 0.42;
const PROC_FRAC  = 0.10;
const ABSORB_MAX = 1.18;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lerp(a, b, t) { return a + (b - a) * t; }
function absorbScale(t) { return 1 + (ABSORB_MAX - 1) * (1 - t) * Math.cos(t * Math.PI / 2); }

function drawBaseLines() {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
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

function drawPacket(x, y, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawArrow(from, to, color) {
    const x = lerp(from.x, to.x, 0.80);
    const y = lerp(from.y, to.y, 0.80);
    const ang = Math.atan2(to.y - from.y, to.x - from.x);
    const s = 9;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - s * Math.cos(ang - 0.42), y - s * Math.sin(ang - 0.42));
    ctx.lineTo(x - s * Math.cos(ang + 0.42), y - s * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawProcessingGlow(x, y, t) {
    ctx.save();
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.5;
    ctx.fillStyle = PACKET.ORANGE;
    ctx.shadowColor = PACKET.ORANGE;
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawConnections(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBaseLines();

    // Reduced-motion: keep the original static look.
    if (prefersReducedMotion) {
        nodes.forEach(n => { if (n.role === 'neuron') n.el.style.transform = 'translate(-50%,-50%) scale(1)'; });
        return;
    }

    nodes.forEach(n => { if (n.role === 'neuron') n._scale = 1; });

    connections.forEach(([userId, neuronId], i) => {
        const user   = nodes.find(n => n.id === userId);   // even id → user
        const neuron = nodes.find(n => n.id === neuronId); // odd id  → neuron
        const phase  = (((now || 0) + i * 900) % CYCLE_MS) / CYCLE_MS;

        if (phase < REQ_FRAC) {                         // REQUEST: user → neuron
            const t = phase / REQ_FRAC;
            drawPacket(lerp(user.x, neuron.x, t), lerp(user.y, neuron.y, t), PACKET.ORANGE);
            drawArrow(user, neuron, PACKET.ORANGE);
        } else if (phase < REQ_FRAC + PROC_FRAC) {      // neuron absorbs + pops bigger
            const pt = (phase - REQ_FRAC) / PROC_FRAC;
            drawProcessingGlow(neuron.x, neuron.y, pt);
            const sc = absorbScale(pt);
            if (sc > (neuron._scale || 1)) neuron._scale = sc;
        } else {                                        // RESPONSE: neuron → user
            const t = (phase - REQ_FRAC - PROC_FRAC) / (1 - REQ_FRAC - PROC_FRAC);
            drawPacket(lerp(neuron.x, user.x, t), lerp(neuron.y, user.y, t), PACKET.TEAL);
            drawArrow(neuron, user, PACKET.TEAL);
        }
    });

    nodes.forEach(n => {
        if (n.role === 'neuron') n.el.style.transform = `translate(-50%,-50%) scale(${(n._scale || 1).toFixed(3)})`;
    });

    requestAnimationFrame(drawConnections);
}

// Position nodes now that prefers-reduced-motion is known, then start the single animation loop.
layoutNetwork();
if (!prefersReducedMotion) requestAnimationFrame(drawConnections);

/* ----------------------------------------------------------------
   DETAIL PANEL HELPERS
---------------------------------------------------------------- */
function showDetail(node) {
    const label = node.role === 'neuron' ? 'Neuron' : 'User';
    const statusClass = node.role === 'neuron' ? 'active' : 'limited';
    const statusText = node.role === 'neuron' ? 'sovereign privacy' : 'network user';
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
   DOWNLOAD APP — OS detection
   Drop real installer URLs in below as each platform's build ships,
   and flip `available` to true. Visitors on an available OS get a
   native "Download for <OS>" link; everyone else is offered the
   default build with a "coming soon" note.
---------------------------------------------------------------- */
const DOWNLOADS = {
    mac:     { label: 'Download for macOS',   url: 'https://localagi.network/download/mac',   available: true  }, // .dmg
    windows: { label: 'Download for Windows', url: 'https://localagi.network/download/win',   available: false }, // .exe
    linux:   { label: 'Download for Linux',   url: 'https://localagi.network/download/linux', available: false }, // .AppImage
};
const DEFAULT_DOWNLOAD = 'mac'; // build offered when the visitor's OS has no build yet (incl. mobile/unknown)

function detectOS() {
    const data = navigator.userAgentData;
    const platform = ((data && data.platform) || navigator.platform || '').toLowerCase();
    const ua = (navigator.userAgent || '').toLowerCase();
    const hay = platform + ' ' + ua;
    if (/android/.test(hay)) return 'android';
    if (/iphone|ipad|ipod/.test(hay)) return 'ios';
    // iPadOS 13+ reports as a Mac — disambiguate via touch points.
    if (/mac/.test(hay) && navigator.maxTouchPoints > 1) return 'ios';
    if (/mac|darwin/.test(hay)) return 'mac';
    if (/win/.test(hay)) return 'windows';
    if (/linux|x11|cros/.test(hay)) return 'linux';
    return 'unknown';
}

function applyDownloadDetection() {
    const detected = DOWNLOADS[detectOS()];
    const native = detected && detected.available ? detected : null;
    const offered = native || DOWNLOADS[DEFAULT_DOWNLOAD];

    document.querySelectorAll('.download-app-btn').forEach(btn => {
        if (offered && offered.url) btn.setAttribute('href', offered.url);
        const label = btn.querySelector('.download-app-label');
        if (label) label.textContent = native ? native.label : 'Download App';
    });

    // Hero-only note: shown to visitors whose OS has no native build yet.
    document.querySelectorAll('.hero-download-note').forEach(note => {
        note.hidden = Boolean(native);
    });
}

applyDownloadDetection();

/* ----------------------------------------------------------------
   ANIMATED STARFIELD BACKGROUND
---------------------------------------------------------------- */
const starCanvas = document.getElementById('starsCanvas');
const starCtx    = starCanvas.getContext('2d');

const STAR_DENSITY   = 30;
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
        r: Math.random() * 1.0 + 0.2,
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
   TYPEWRITER EFFECT (removed — hero copy is self-sufficient)
---------------------------------------------------------------- */

/* ----------------------------------------------------------------
   NETWORK HEALTH — live data from signaling server
---------------------------------------------------------------- */

const SIGNALING_URL = "https://signal.localagi.network";

const AGENT_TYPES = [
  { label: "Hermes",          type: "general" },
  { label: "Browser",         type: "administrative" },
  { label: "Image Generator", type: "image_generation_from_text" },
  { label: "Image Editor",    type: "image_generation_from_images" },
  { label: "Video Generator", type: "video_generation_from_images" },
];

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

async function loadNetworkHealth() {
  try {
    const resp = await fetch(SIGNALING_URL + "/usage/network-health");
    if (!resp.ok) return;
    const data = await resp.json();

    var n = data.active_neurons || 0;
    var t = data.tasks_submitted || 0;
    var completionRate = data.completion_rate || 0;
    var cancelRate = data.cancel_by_user_rate || 0;

    // Social proof bar (.proof-stats)
    var proofStats = document.querySelectorAll(".proof-stats .stat");
    if (proofStats.length >= 4) {
      proofStats[0].innerHTML = '<span class="stat-dot"></span> <strong>' + n.toLocaleString() + "</strong> " + (n === 1 ? "Neuron" : "Neurons");
      proofStats[1].innerHTML = "<strong>" + t.toLocaleString() + "</strong> " + (t === 1 ? "Task Submitted" : "Tasks Submitted");
      proofStats[2].innerHTML = "<strong>" + completionRate + "%</strong> Completed";
      proofStats[3].innerHTML = "<strong>" + cancelRate + "%</strong> Canceled";
    }

    // Stat cards (Network Health section)
    var cards = document.querySelectorAll(".stat-card");
    if (cards.length >= 4) {
      cards[0].querySelector(".stat-value").textContent = n.toLocaleString();
      cards[0].querySelector(".stat-label-text").textContent = n === 1 ? "Active Neuron" : "Active Neurons";
      cards[1].querySelector(".stat-value").textContent = t.toLocaleString();
      cards[1].querySelector(".stat-label-text").textContent = t === 1 ? "Task Submitted" : "Tasks Submitted";
      cards[2].querySelector(".stat-value").textContent = completionRate + "%";
      cards[3].querySelector(".stat-value").textContent = cancelRate + "%";
    }

    // Per-task-type lookup: { submitted, completed, canceled }
    const byType = {};
    for (const entry of (data.by_type || [])) {
      byType[entry.task_type] = entry;
    }

    // Agent-type table: Submitted | Completion Rate | Cancel by User Rate
    const tbody = document.querySelector(".network-table tbody");
    if (tbody) {
      tbody.innerHTML = AGENT_TYPES.map(function (agent) {
        const row = byType[agent.type] || { submitted: 0, completed: 0, canceled: 0 };
        const submitted = row.submitted || 0;
        return "<tr><td>" + agent.label + "</td><td>" + submitted +
               "</td><td>" + pct(row.completed, submitted) + "%</td><td>" +
               pct(row.canceled, submitted) + "%</td></tr>";
      }).join("");
    }
  } catch (e) {
    // Silent fail — hardcoded HTML remains as fallback
  }
}

document.addEventListener("DOMContentLoaded", loadNetworkHealth);

/* ----------------------------------------------------------------
   IMAGE LIGHTBOX — click any .zoomable image to view it full-size
---------------------------------------------------------------- */
(function () {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    const modalImg = document.getElementById('image-modal-img');
    const closeBtn = modal.querySelector('.image-modal-close');
    let lastFocused = null;

    function openImageModal(img) {
        lastFocused = img;
        modalImg.src = img.currentSrc || img.src;
        modalImg.alt = img.alt || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
    }
    function closeImageModal() {
        modal.classList.remove('active');
        modalImg.removeAttribute('src');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.zoomable').forEach(function (img) {
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-label', (img.alt || 'Image') + ' — view full size');
        img.addEventListener('click', function () { openImageModal(img); });
        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openImageModal(img); }
        });
    });

    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target === closeBtn) closeImageModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeImageModal();
    });
})();
