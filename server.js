const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 2000);
const SIGNALING_URL = process.env.SIGNALING_URL || 'https://signal.localagi.network';
const GRID_CONTROL_PLANE_URL = process.env.GRID_CONTROL_PLANE_URL || 'https://api.localagi.network';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.LOCALAGI_GOOGLE_CLIENT_ID || '';
const GRID_DEV_AUTH_ENABLED = /^(1|true|yes|on)$/i.test(process.env.GRID_DEV_AUTH_ENABLED || '');

app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.get(/^\/api-keys\/?$/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-keys.html'));
});

app.get(/^\/grid-networks\/?$/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'grid-networks.html'));
});

app.get(/^\/grid-login\/?$/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'grid-login.html'));
});

// Serve static files from the 'public' folder (adjust if your files are elsewhere)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/runtime-config.json', (_req, res) => {
  res.json({
    signalingUrl: SIGNALING_URL,
    gridControlPlaneUrl: GRID_CONTROL_PLANE_URL,
    googleClientId: GOOGLE_CLIENT_ID,
    gridDevAuthEnabled: GRID_DEV_AUTH_ENABLED,
  });
});

// Optional: Redirect root to index.html if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
