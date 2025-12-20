const express = require('express');
const path = require('path');

const app = express();
const PORT = 2000;

// Serve static files from the 'public' folder (adjust if your files are elsewhere)
app.use(express.static(path.join(__dirname, 'public')));

// Optional: Redirect root to index.html if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});