const express = require('express');
const path = require('path');
const app = express();
const FRONTEND_PORT = 8000;

// Serve static files from the 'public' directory (which contains index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to serving index.html for all other routes (useful for SPAs)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(FRONTEND_PORT, () => {
    console.log(`Presentation Tier server running on port ${FRONTEND_PORT}`);
});
