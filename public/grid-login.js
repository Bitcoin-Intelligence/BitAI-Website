(() => {
  const state = {
    apiUrl: '',
    googleClientId: '',
    userCode: new URLSearchParams(window.location.search).get('user_code') || '',
  };

  const $ = (id) => document.getElementById(id);

  function setStatus(text) {
    $('status').textContent = text;
  }

  async function approve(googleIdToken) {
    if (!state.userCode) {
      throw new Error('Missing Grid login code.');
    }
    const res = await fetch(`${state.apiUrl}/v1/grid/auth/device/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_code: state.userCode,
        google_id_token: googleIdToken,
      }),
    });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    const data = await res.json();
    setStatus(`Signed in as ${data.user.email}. Return to the terminal.`);
  }

  async function loadConfig() {
    $('code').textContent = state.userCode || 'Missing';
    const res = await fetch('/runtime-config.json');
    const cfg = await res.json();
    state.apiUrl = cfg.gridControlPlaneUrl || 'https://api.localagi.network';
    state.googleClientId = cfg.googleClientId || '';
    if (!state.userCode) {
      setStatus('Missing login code. Run `grid auth login` again.');
      return;
    }
    if (window.google && state.googleClientId) {
      google.accounts.id.initialize({
        client_id: state.googleClientId,
        callback: async (credential) => {
          try {
            await approve(credential.credential);
          } catch (err) {
            setStatus(err.message);
          }
        },
      });
      google.accounts.id.renderButton($('google-button'), { theme: 'outline', size: 'large', width: 280 });
    } else {
      setStatus('Google Sign-In is not configured.');
    }
  }

  loadConfig().catch((err) => setStatus(err.message));
})();
