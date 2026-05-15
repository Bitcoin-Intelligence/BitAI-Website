const API_AUTH_STORAGE_KEY = "localagiWebsiteAuth.v1";

const API_KEY_PRESETS = {
  inference: {
    scopes: ["inference:create", "inference:models", "inference:resume"],
  },
  provider: {
    scopes: ["provider:heartbeat", "provider:update", "provider:poll", "provider:submit", "provider:error"],
  },
  dual: {
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

let signalingUrl = "https://signal.localagi.network";
let googleClientId = "";
let apiAuth = null;
let apiKeyPreset = "inference";
let activePanel = "create";
let googleButtonsRendered = false;
let copyToastTimer = null;

function apiEls() {
  return {
    accountMenu: document.getElementById("api-account-menu"),
    accountButton: document.getElementById("api-account-button"),
    accountDropdown: document.getElementById("api-account-dropdown"),
    accountName: document.getElementById("api-account-name"),
    accountCredits: document.getElementById("api-account-credits"),
    headerSignIn: document.getElementById("api-header-signin"),
    signoutBtn: document.getElementById("api-signout-btn"),
    googleButtons: [document.getElementById("google-signin-button-gate")].filter(Boolean),
    gate: document.getElementById("api-auth-gate"),
    panels: document.getElementById("api-panels"),
    sidebarItems: Array.from(document.querySelectorAll(".api-sidebar-item")),
    managePanel: document.getElementById("api-panel-manage"),
    createPanel: document.getElementById("api-panel-create"),
    creditsPanel: document.getElementById("api-panel-credits"),
    form: document.getElementById("api-key-form"),
    keyName: document.getElementById("api-key-name"),
    verifiedOnly: document.getElementById("verified-providers-only"),
    createBtn: document.getElementById("api-create-btn"),
    createdPanel: document.getElementById("api-created-key"),
    createdSecret: document.getElementById("api-created-secret"),
    createdClose: document.getElementById("api-created-close"),
    createdSaved: document.getElementById("api-created-saved"),
    copyCreated: document.getElementById("api-copy-created"),
    copyToast: document.getElementById("api-copy-toast"),
    refreshBtn: document.getElementById("api-refresh-keys"),
    addCreditsBtn: document.getElementById("api-add-credits"),
    creditsBalance: document.getElementById("api-credits-balance"),
    tableBody: document.getElementById("api-key-table-body"),
    emptyState: document.getElementById("api-empty-state"),
    status: document.getElementById("api-status"),
  };
}

async function loadRuntimeConfig() {
  try {
    const resp = await fetch("/runtime-config.json", { cache: "no-store" });
    if (!resp.ok) return;
    const cfg = await resp.json();
    if (cfg.signalingUrl) signalingUrl = cfg.signalingUrl.replace(/\/+$/, "");
    if (cfg.googleClientId) googleClientId = cfg.googleClientId;
  } catch (e) {
    // Production defaults remain usable.
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

function updateStoredApiAuth(fields) {
  if (!apiAuth) return;
  apiAuth = { ...apiAuth, ...fields };
  localStorage.setItem(API_AUTH_STORAGE_KEY, JSON.stringify(apiAuth));
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

  const resp = await fetch(signalingUrl + path, { ...init, headers });
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
  const signedIn = Boolean(apiAuth && apiAuth.user_jwt);

  els.gate.hidden = signedIn;
  els.panels.hidden = !signedIn;
  els.accountMenu.hidden = !signedIn;
  els.headerSignIn.hidden = signedIn;
  els.headerSignIn.disabled = !googleClientId;
  els.googleButtons.forEach(button => { button.hidden = signedIn; });
  els.sidebarItems.forEach(button => { button.disabled = !signedIn; });

  if (signedIn) {
    els.accountName.textContent = apiAuth.name || apiAuth.email || "Signed in";
    els.accountCredits.textContent = typeof apiAuth.balance === "number"
      ? apiAuth.balance.toFixed(2) + " credits"
      : "Credits unavailable";
    els.creditsBalance.textContent = typeof apiAuth.balance === "number"
      ? Math.floor(apiAuth.balance).toLocaleString()
      : "Credits unavailable";
  } else {
    closeAccountMenu();
    els.createdPanel.hidden = true;
    renderApiKeys([]);
  }

  renderPanel(activePanel);
  updatePresetControls();
  if (!signedIn) renderGoogleSignInButtons();
}

function closeAccountMenu() {
  const { accountButton, accountDropdown } = apiEls();
  if (!accountButton || !accountDropdown) return;
  accountDropdown.hidden = true;
  accountButton.setAttribute("aria-expanded", "false");
}

function toggleAccountMenu() {
  const { accountButton, accountDropdown } = apiEls();
  if (!accountButton || !accountDropdown) return;
  const open = accountDropdown.hidden;
  accountDropdown.hidden = !open;
  accountButton.setAttribute("aria-expanded", open ? "true" : "false");
}

function showToast(message) {
  const { copyToast } = apiEls();
  if (!copyToast) return;
  window.clearTimeout(copyToastTimer);
  copyToast.textContent = message;
  copyToast.hidden = false;
  copyToastTimer = window.setTimeout(() => {
    copyToast.hidden = true;
  }, 1400);
}

function showCopyToast() {
  showToast("Copied");
}

async function refreshApiBalance() {
  if (!apiAuth) return;
  try {
    const data = await apiRequest("/credits/balance");
    if (typeof data.balance === "number") {
      updateStoredApiAuth({
        balance: data.balance,
        total_spent: data.total_spent,
        total_earned: data.total_earned,
      });
      renderApiKeyDashboard();
    }
  } catch (e) {
    // Keep the cached session usable if the balance refresh is temporarily unavailable.
  }
}

function renderGoogleSignInButtons() {
  if (googleButtonsRendered || !googleClientId) return;
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    window.setTimeout(renderGoogleSignInButtons, 200);
    return;
  }

  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleGoogleCredential,
  });

  apiEls().googleButtons.forEach(button => {
    window.google.accounts.id.renderButton(button, {
      theme: "filled_black",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
      width: 400,
    });
  });
  googleButtonsRendered = true;
}

async function handleGoogleCredential(response) {
  if (!response || !response.credential) return;
  setApiStatus("Signing in...", "info");
  try {
    const resp = await fetch(signalingUrl + "/auth/login", {
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

function renderPanel(panel) {
  activePanel = ["create", "manage", "credits"].includes(panel) ? panel : "create";
  const els = apiEls();
  els.sidebarItems.forEach(button => {
    button.classList.toggle("active", button.dataset.panel === activePanel);
  });
  els.managePanel.hidden = activePanel !== "manage";
  els.createPanel.hidden = activePanel !== "create";
  els.creditsPanel.hidden = activePanel !== "credits";
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
  const { tableBody, emptyState } = apiEls();
  tableBody.replaceChildren();
  const rows = keys || [];
  emptyState.hidden = rows.length > 0;

  rows.forEach(key => {
    const tr = document.createElement("tr");
    const status = statusForKey(key);
    const revoked = status !== "Active";
    const cells = [
      key.name || "Unnamed",
      key.key_prefix || "",
      scopeLabel(key.scopes),
      shortNodeId(key.node_id),
      formatDate(key.last_used_at || key.created_at),
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
  const { createdPanel, createdSecret } = apiEls();
  createdSecret.textContent = data.key || "";
  createdPanel.hidden = false;
  document.body.classList.add("api-modal-open");
}

function closeCreatedKeyModal() {
  const { createdPanel } = apiEls();
  createdPanel.hidden = true;
  document.body.classList.remove("api-modal-open");
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
    setApiStatus("", "info");
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

async function addCredits() {
  if (!apiAuth) return;
  const { addCreditsBtn } = apiEls();
  addCreditsBtn.disabled = true;
  setApiStatus("Adding credits...", "info");
  try {
    const data = await apiRequest("/credits/purchase", {
      method: "POST",
      body: JSON.stringify({ amount_dollars: 10 }),
    });
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
      return;
    }
    if (typeof data.new_balance === "number") {
      updateStoredApiAuth({
        balance: data.new_balance,
        total_spent: data.total_spent,
        total_earned: data.total_earned,
      });
      renderApiKeyDashboard();
    } else {
      await refreshApiBalance();
    }
    setApiStatus("", "info");
    showToast("Credits added");
  } catch (e) {
    setApiStatus(e.message || "Could not add credits", "error");
  } finally {
    addCreditsBtn.disabled = false;
  }
}

function wireApiKeyDashboard() {
  const els = apiEls();
  els.form.addEventListener("submit", createApiKey);
  els.signoutBtn.addEventListener("click", () => {
    clearApiAuth();
    closeAccountMenu();
    renderApiKeyDashboard();
    setApiStatus("", "info");
  });
  els.headerSignIn.addEventListener("click", () => {
    els.gate.scrollIntoView({ behavior: "smooth", block: "center" });
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    }
  });
  els.accountButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleAccountMenu();
    if (!els.accountDropdown.hidden) refreshApiBalance();
  });
  document.addEventListener("click", (event) => {
    if (!els.accountMenu.contains(event.target)) closeAccountMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAccountMenu();
      closeCreatedKeyModal();
    }
  });
  els.refreshBtn.addEventListener("click", loadApiKeys);
  els.addCreditsBtn.addEventListener("click", addCredits);
  els.createdClose.addEventListener("click", closeCreatedKeyModal);
  els.createdSaved.addEventListener("click", closeCreatedKeyModal);
  els.createdPanel.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-created")) closeCreatedKeyModal();
  });
  els.copyCreated.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.createdSecret.textContent);
      showCopyToast();
    } catch (e) {
      setApiStatus("Copy failed.", "error");
    }
  });
  els.sidebarItems.forEach(button => {
    button.addEventListener("click", () => {
      renderPanel(button.dataset.panel);
      if (button.dataset.panel === "credits") refreshApiBalance();
    });
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
    await Promise.all([refreshApiBalance(), loadApiKeys()]);
  }
}

document.addEventListener("DOMContentLoaded", initApiKeyDashboard);
