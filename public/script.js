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

let SIGNALING_URL = "https://signal.localagi.network";
let GOOGLE_CLIENT_ID = "";

const TASK_GROUPS = [
  { name: "Deep Research",      capabilities: "Web crawl, synthesis, fact-check",   types: ["research"],                                                    statusKey: "llm" },
  { name: "Data Analysis",      capabilities: "Trends, anomalies, visualization",   types: ["data_science"],                                                statusKey: "llm" },
  { name: "Financial Analysis", capabilities: "Market data, forecasts, reports",     types: ["crypto", "stock"],                                             statusKey: "llm" },
  { name: "Code & Debug",       capabilities: "Generate, review, fix",              types: ["software_engineering", "web_development"],                      statusKey: "llm" },
  { name: "Admin & Ops",        capabilities: "Scheduling, drafts, summaries",      types: ["administrative"],                                              statusKey: "llm" },
  { name: "Image Creation",     capabilities: "Generate, edit, upscale",            types: ["image_generation_from_text"],            statusKey: "image_generation" },
  { name: "Image Editing",      capabilities: "Transform, style, enhance",          types: ["image_generation_from_images"],          statusKey: "image_editing" },
  { name: "Video Production",   capabilities: "Generate, animate, composite",       types: ["video_generation_from_images"],                                statusKey: "i2v" },
];

async function loadNetworkHealth() {
  try {
    const resp = await fetch(SIGNALING_URL + "/usage/network-health");
    if (!resp.ok) return;
    const data = await resp.json();

    var n = data.active_neurons;
    var t = data.tasks_submitted;

    // Populate social proof bar (.proof-stats)
    var proofStats = document.querySelectorAll(".proof-stats .stat");
    if (proofStats.length >= 4) {
      proofStats[0].innerHTML = '<span class="stat-dot"></span> <strong>' + n.toLocaleString() + "</strong> " + (n === 1 ? "Neuron" : "Neurons");
      proofStats[1].innerHTML = "<strong>" + t.toLocaleString() + "</strong> " + (t === 1 ? "Task Submitted" : "Tasks Submitted");
      proofStats[2].innerHTML = "<strong>" + data.pickup_rate + "%</strong> Picked Up";
      proofStats[3].innerHTML = "<strong>" + data.completion_rate + "%</strong> Completed";
    }

    // Populate stat cards (Network Health section)
    var cards = document.querySelectorAll(".stat-card");
    if (cards.length >= 4) {
      cards[0].querySelector(".stat-value").textContent = n.toLocaleString();
      cards[0].querySelector(".stat-label-text").textContent = n === 1 ? "Active Neuron" : "Active Neurons";
      cards[1].querySelector(".stat-value").textContent = t.toLocaleString();
      cards[1].querySelector(".stat-label-text").textContent = t === 1 ? "Task Submitted" : "Tasks Submitted";
      cards[2].querySelector(".stat-value").textContent = data.pickup_rate + "%";
      cards[3].querySelector(".stat-value").textContent = data.completion_rate + "%";
    }

    // Build type count lookup
    const typeCounts = {};
    for (const entry of data.by_type) {
      typeCounts[entry.task_type] = entry.count;
    }

    // Populate table
    const tbody = document.querySelector(".network-table tbody");
    if (tbody) {
      tbody.innerHTML = TASK_GROUPS.map(function (group) {
        const count = group.types.reduce(function (sum, t) { return sum + (typeCounts[t] || 0); }, 0);
        const status = data.capability_status[group.statusKey] || "offline";
        var badgeClass = "busy";
        var badgeText = "Offline";
        if (status === "online") { badgeClass = "online"; badgeText = "Online"; }
        else if (status === "busy") { badgeClass = "busy"; badgeText = "Busy"; }
        return "<tr><td>" + group.name + "</td><td>" + group.capabilities + "</td><td>" + count + "</td><td><span class=\"status-badge " + badgeClass + "\">" + badgeText + "</span></td></tr>";
      }).join("");
    }
  } catch (e) {
    // Silent fail — hardcoded HTML remains as fallback
  }
}

document.addEventListener("DOMContentLoaded", loadNetworkHealth);

/* ----------------------------------------------------------------
   API KEY MANAGEMENT
---------------------------------------------------------------- */

const API_AUTH_STORAGE_KEY = "localagiWebsiteAuth.v1";
const API_KEY_PRESETS = {
  inference: {
    label: "Infer",
    scopes: ["inference:create", "inference:models", "inference:resume"],
  },
  provider: {
    label: "Serve",
    scopes: ["provider:heartbeat", "provider:update", "provider:poll", "provider:submit", "provider:error"],
  },
  dual: {
    label: "Both",
    scopes: [
      "inference:create",
      "inference:models",
      "inference:resume",
      "provider:heartbeat",
      "provider:update",
      "provider:poll",
      "provider:submit",
      "provider:error",
    ],
  },
};

let apiAuth = null;
let apiKeyPreset = "inference";
let googleButtonRendered = false;

function apiEls() {
  return {
    authPanel: document.getElementById("api-auth-panel"),
    authSummary: document.getElementById("api-auth-summary"),
    signoutBtn: document.getElementById("api-signout-btn"),
    googleButton: document.getElementById("google-signin-button"),
    form: document.getElementById("api-key-form"),
    keyName: document.getElementById("api-key-name"),
    verifiedOnly: document.getElementById("verified-providers-only"),
    createBtn: document.getElementById("api-create-btn"),
    createdPanel: document.getElementById("api-created-key"),
    createdSecret: document.getElementById("api-created-secret"),
    createdDetails: document.getElementById("api-created-details"),
    createdClose: document.getElementById("api-created-close"),
    copyCreated: document.getElementById("api-copy-created"),
    listPanel: document.getElementById("api-key-list-panel"),
    refreshBtn: document.getElementById("api-refresh-keys"),
    tableBody: document.getElementById("api-key-table-body"),
    emptyState: document.getElementById("api-empty-state"),
    keyCount: document.getElementById("api-key-count"),
    status: document.getElementById("api-status"),
  };
}

async function loadRuntimeConfig() {
  try {
    const resp = await fetch("/runtime-config.json", { cache: "no-store" });
    if (!resp.ok) return;
    const cfg = await resp.json();
    if (cfg.signalingUrl) SIGNALING_URL = cfg.signalingUrl.replace(/\/+$/, "");
    if (cfg.googleClientId) GOOGLE_CLIENT_ID = cfg.googleClientId;
  } catch (e) {
    // Keep public production defaults.
  }
}

function loadApiAuth() {
  try {
    const raw = localStorage.getItem(API_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw);
    if (!auth || !auth.user_jwt) return null;
    if (auth.expires_at && Date.parse(auth.expires_at) <= Date.now()) {
      localStorage.removeItem(API_AUTH_STORAGE_KEY);
      return null;
    }
    return auth;
  } catch (e) {
    localStorage.removeItem(API_AUTH_STORAGE_KEY);
    return null;
  }
}

function saveApiAuth(auth) {
  apiAuth = auth;
  localStorage.setItem(API_AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearApiAuth() {
  apiAuth = null;
  localStorage.removeItem(API_AUTH_STORAGE_KEY);
}

function setApiStatus(message, tone) {
  const { status } = apiEls();
  if (!status) return;
  if (!message) {
    status.hidden = true;
    status.textContent = "";
    status.className = "api-status";
    return;
  }
  status.hidden = false;
  status.textContent = message;
  status.className = "api-status " + (tone || "info");
}

function apiErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (payload.error && payload.error.message) return payload.error.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (payload.detail && payload.detail.error) return payload.detail.error;
  return fallback;
}

async function apiRequest(path, options) {
  const init = options || {};
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (apiAuth && apiAuth.user_jwt) headers.set("Authorization", "Bearer " + apiAuth.user_jwt);
  const resp = await fetch(SIGNALING_URL + path, { ...init, headers });
  const text = await resp.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = { detail: text }; }
  }
  if (!resp.ok) {
    if (resp.status === 401) {
      clearApiAuth();
      renderApiKeyDashboard();
    }
    throw new Error(apiErrorMessage(data, "Request failed"));
  }
  return data || {};
}

function renderApiKeyDashboard() {
  const els = apiEls();
  if (!els.form) return;
  const signedIn = Boolean(apiAuth && apiAuth.user_jwt);

  els.form.hidden = !signedIn;
  els.listPanel.hidden = !signedIn;
  els.signoutBtn.hidden = !signedIn;
  els.googleButton.hidden = signedIn;

  if (signedIn) {
    const name = apiAuth.name || apiAuth.email || "Signed in";
    const balance = typeof apiAuth.balance === "number" ? " · " + apiAuth.balance.toFixed(2) + " credits" : "";
    els.authSummary.textContent = name + balance;
  } else {
    els.authSummary.textContent = GOOGLE_CLIENT_ID ? "Sign in to manage relay API keys." : "Google sign-in is not configured.";
    els.tableBody.replaceChildren();
    els.keyCount.textContent = "No keys yet.";
    els.emptyState.hidden = false;
    els.createdPanel.hidden = true;
  }

  updatePresetControls();
  if (!signedIn) renderGoogleSignInButton();
}

function renderGoogleSignInButton() {
  const { googleButton } = apiEls();
  if (!googleButton || googleButtonRendered || !GOOGLE_CLIENT_ID) return;
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    window.setTimeout(renderGoogleSignInButton, 200);
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });
  window.google.accounts.id.renderButton(googleButton, {
    theme: "filled_black",
    size: "large",
    shape: "rectangular",
    text: "signin_with",
    width: 260,
  });
  googleButtonRendered = true;
}

async function handleGoogleCredential(response) {
  if (!response || !response.credential) return;
  setApiStatus("Signing in...", "info");
  try {
    const resp = await fetch(SIGNALING_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ google_id_token: response.credential }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(apiErrorMessage(data, "Sign-in failed"));
    saveApiAuth(data);
    renderApiKeyDashboard();
    await loadApiKeys();
    setApiStatus("", "info");
  } catch (e) {
    setApiStatus(e.message || "Sign-in failed", "error");
  }
}

function scopeLabel(scopes) {
  const values = new Set(scopes || []);
  const hasInference = ["inference:create", "inference:models", "inference:resume"].some(scope => values.has(scope));
  const hasProvider = ["provider:heartbeat", "provider:update", "provider:poll", "provider:submit", "provider:error"].some(scope => values.has(scope));
  if (hasInference && hasProvider) return "Both";
  if (hasProvider) return "Serve";
  if (hasInference) return "Infer";
  return "Custom";
}

function shortNodeId(nodeId) {
  if (!nodeId) return "none";
  return nodeId.length > 12 ? nodeId.slice(0, 8) + "..." + nodeId.slice(-4) : nodeId;
}

function formatDate(value) {
  if (!value) return "never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "never";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusForKey(key) {
  if (key.revoked_at) return "Revoked";
  if (key.paused_at) return "Paused";
  return "Active";
}

function updatePresetControls() {
  const { verifiedOnly } = apiEls();
  document.querySelectorAll(".api-preset").forEach(button => {
    const active = button.dataset.preset === apiKeyPreset;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", active ? "true" : "false");
  });
  if (verifiedOnly) {
    verifiedOnly.disabled = apiKeyPreset === "provider";
    if (apiKeyPreset === "provider") verifiedOnly.checked = false;
  }
}

function renderApiKeys(keys) {
  const { tableBody, emptyState, keyCount } = apiEls();
  tableBody.replaceChildren();
  const rows = keys || [];
  emptyState.hidden = rows.length > 0;
  keyCount.textContent = rows.length === 1 ? "1 key" : rows.length + " keys";

  rows.forEach(key => {
    const tr = document.createElement("tr");
    const status = statusForKey(key);
    const revoked = status !== "Active";
    const cells = [
      key.name || "Unnamed",
      key.key_prefix || "",
      scopeLabel(key.scopes),
      shortNodeId(key.node_id),
      formatDate(key.last_used_at),
      status,
    ];

    cells.forEach((text, index) => {
      const td = document.createElement("td");
      if (index === 2) {
        const badge = document.createElement("span");
        badge.className = "api-scope-badge";
        badge.textContent = text;
        td.appendChild(badge);
        if (key.verified_providers_only) {
          const verified = document.createElement("span");
          verified.className = "api-scope-badge verified";
          verified.textContent = "Verified";
          td.appendChild(verified);
        }
      } else if (index === 5) {
        const badge = document.createElement("span");
        badge.className = "api-status-badge " + (revoked ? "revoked" : "active");
        badge.textContent = text;
        td.appendChild(badge);
      } else {
        td.textContent = text;
      }
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const revokeBtn = document.createElement("button");
    revokeBtn.type = "button";
    revokeBtn.className = "api-icon-btn api-danger-btn";
    revokeBtn.setAttribute("aria-label", "Revoke API key");
    revokeBtn.disabled = revoked;
    revokeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>';
    revokeBtn.addEventListener("click", () => revokeApiKey(key.key_id, key.name));
    actionTd.appendChild(revokeBtn);
    tr.appendChild(actionTd);
    tableBody.appendChild(tr);
  });
}

async function loadApiKeys() {
  if (!apiAuth) return;
  setApiStatus("", "info");
  try {
    const data = await apiRequest("/auth/api-keys");
    renderApiKeys(data.keys || []);
  } catch (e) {
    setApiStatus(e.message || "Could not load API keys", "error");
  }
}

function renderCreatedKey(data) {
  const { createdPanel, createdSecret, createdDetails } = apiEls();
  createdSecret.textContent = data.key || "";
  createdDetails.replaceChildren();
  [
    ["Key ID", data.key_id],
    ["Preset", scopeLabel(data.scopes)],
    ["Node", data.node_id || "none"],
    ["Verified", data.verified_providers_only ? "yes" : "no"],
  ].forEach(([label, value]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value || "";
    createdDetails.append(dt, dd);
  });
  createdPanel.hidden = false;
}

async function createApiKey(event) {
  event.preventDefault();
  if (!apiAuth) return;
  const els = apiEls();
  const name = els.keyName.value.trim();
  const preset = API_KEY_PRESETS[apiKeyPreset];
  if (!name || !preset) return;
  els.createBtn.disabled = true;
  setApiStatus("Creating API key...", "info");
  try {
    const data = await apiRequest("/auth/api-keys", {
      method: "POST",
      body: JSON.stringify({
        name,
        scopes: preset.scopes,
        verified_providers_only: apiKeyPreset !== "provider" && els.verifiedOnly.checked,
      }),
    });
    els.form.reset();
    apiKeyPreset = "inference";
    updatePresetControls();
    renderCreatedKey(data);
    await loadApiKeys();
    setApiStatus("API key created.", "success");
  } catch (e) {
    setApiStatus(e.message || "Could not create API key", "error");
  } finally {
    els.createBtn.disabled = false;
  }
}

async function revokeApiKey(keyId, name) {
  if (!apiAuth || !keyId) return;
  if (!window.confirm("Revoke " + (name || "this API key") + "?")) return;
  setApiStatus("Revoking API key...", "info");
  try {
    await apiRequest("/auth/api-keys/" + encodeURIComponent(keyId), { method: "DELETE" });
    await loadApiKeys();
    setApiStatus("API key revoked.", "success");
  } catch (e) {
    setApiStatus(e.message || "Could not revoke API key", "error");
  }
}

function wireApiKeyDashboard() {
  const els = apiEls();
  if (!els.form) return;
  els.form.addEventListener("submit", createApiKey);
  els.signoutBtn.addEventListener("click", () => {
    clearApiAuth();
    renderApiKeyDashboard();
    setApiStatus("", "info");
  });
  els.refreshBtn.addEventListener("click", loadApiKeys);
  els.createdClose.addEventListener("click", () => { els.createdPanel.hidden = true; });
  els.copyCreated.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.createdSecret.textContent);
      setApiStatus("Copied API key.", "success");
    } catch (e) {
      setApiStatus("Copy failed.", "error");
    }
  });
  document.querySelectorAll(".api-preset").forEach(button => {
    button.addEventListener("click", () => {
      apiKeyPreset = button.dataset.preset;
      updatePresetControls();
    });
  });
}

async function initApiKeyDashboard() {
  await loadRuntimeConfig();
  apiAuth = loadApiAuth();
  wireApiKeyDashboard();
  renderApiKeyDashboard();
  if (apiAuth) {
    await loadApiKeys();
  }
}

document.addEventListener("DOMContentLoaded", initApiKeyDashboard);
