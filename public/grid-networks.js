(() => {
  const state = {
    apiUrl: '',
    googleClientId: '',
    sessionToken: localStorage.getItem('gridSessionToken') || '',
    deviceId: localStorage.getItem('gridDeviceId') || crypto.randomUUID(),
    networks: [],
  };

  const $ = (id) => document.getElementById(id);

  function setStatus(text) {
    $('status').textContent = text;
  }

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (state.sessionToken) headers.Authorization = `Bearer ${state.sessionToken}`;
    const res = await fetch(`${state.apiUrl}${path}`, { ...options, headers });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  }

  async function loadConfig() {
    const res = await fetch('/runtime-config.json');
    const cfg = await res.json();
    state.apiUrl = cfg.gridControlPlaneUrl || 'https://api.localagi.network';
    state.googleClientId = cfg.googleClientId || '';
    $('dev-auth').hidden = !cfg.gridDevAuthEnabled;
    localStorage.setItem('gridDeviceId', state.deviceId);
    $('device-id').value = state.deviceId;
    if (window.google && state.googleClientId) {
      google.accounts.id.initialize({
        client_id: state.googleClientId,
        callback: async (credential) => {
          await loginWithToken(credential.credential);
        },
      });
      google.accounts.id.renderButton($('google-button'), { theme: 'outline', size: 'large', width: 280 });
    }
  }

  async function loginWithToken(googleIdToken) {
    const data = await api('/v1/grid/auth/google', {
      method: 'POST',
      body: JSON.stringify({ google_id_token: googleIdToken }),
      headers: {},
    });
    state.sessionToken = data.session_token;
    localStorage.setItem('gridSessionToken', state.sessionToken);
    setStatus(`Signed in as ${data.user.email}`);
    await refreshNetworks();
  }

  async function refreshNetworks() {
    state.deviceId = $('device-id').value.trim() || state.deviceId;
    localStorage.setItem('gridDeviceId', state.deviceId);
    const data = await api(`/v1/grid/tokens?device_id=${encodeURIComponent(state.deviceId)}`);
    state.networks = data.networks || [];
    renderNetworks();
    setStatus(`Loaded ${state.networks.length} network(s).`);
  }

  function renderNetworks() {
    const root = $('networks');
    root.innerHTML = '';
    for (const network of state.networks) {
      const el = document.createElement('section');
      el.className = 'network stack';
      el.innerHTML = `
        <div>
          <h2>${escapeHtml(network.name)}</h2>
          <p class="muted">${escapeHtml(network.network_id)} · ${escapeHtml(network.lan_signaling_url)}</p>
        </div>
        <div class="row">
          <input data-email placeholder="member@example.com" />
          <select data-role>
            <option value="consumer">consumer</option>
            <option value="provider">provider</option>
            <option value="both">both</option>
            <option value="admin">admin</option>
          </select>
          <button type="button" data-add>Add</button>
        </div>
        <div class="row">
          <button type="button" class="secondary" data-members>Load members</button>
          <button type="button" class="secondary" data-token>Show token</button>
        </div>
        <pre data-output>grid provider start --network ${escapeHtml(network.name)} --model &lt;model.gguf&gt;
OPENAI_BASE_URL=${escapeHtml(network.lan_signaling_url)}/relay/v1</pre>
      `;
      el.querySelector('[data-add]').addEventListener('click', async () => {
        const email = el.querySelector('[data-email]').value.trim();
        const role = el.querySelector('[data-role]').value;
        await api(`/v1/grid/networks/${network.network_id}/members`, {
          method: 'POST',
          body: JSON.stringify({ email, roles: [role] }),
        });
        setStatus(`Added ${email}.`);
      });
      el.querySelector('[data-members]').addEventListener('click', async () => {
        const data = await api(`/v1/grid/networks/${network.network_id}/members`);
        el.querySelector('[data-output]').textContent = (data.members || [])
          .map((m) => `${m.email}\t${m.status}\t${m.roles.join(',')}\tepoch=${m.member_epoch}`)
          .join('\n');
      });
      el.querySelector('[data-token]').addEventListener('click', () => {
        el.querySelector('[data-output]').textContent = network.access_token;
      });
      root.appendChild(el);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }

  $('dev-login').addEventListener('click', async () => {
    await loginWithToken(`dev:${$('dev-email').value.trim()}`);
  });
  $('refresh').addEventListener('click', refreshNetworks);
  $('create-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = await api('/v1/grid/networks', {
      method: 'POST',
      body: JSON.stringify({
        name: $('network-name').value.trim(),
        lan_signaling_url: $('lan-url').value.trim(),
        device_id: state.deviceId,
      }),
    });
    state.networks.push(data.credentials);
    renderNetworks();
    setStatus(`Created ${data.network.name}.`);
  });

  loadConfig().catch((err) => setStatus(err.message));
})();
