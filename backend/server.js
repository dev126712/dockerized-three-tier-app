const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

// Enable CORS for cross-container communication (Frontend to Backend)
app.use(cors());

// Data Tier Simulation: In-memory array acting as our "database"
let products = [
    { id: 1, name: "Gemini AI Model", price: 299.99, category: "Software" },
    { id: 2, name: "Compute Stick", price: 49.99, category: "Hardware" },
    { id: 3, name: "Quantum Widget", price: 1200.00, category: "Hardware" }
];

// API Endpoint (Tier 2/3 interaction)
app.get('/api/products', (req, res) => {
    console.log('Request received for products list.');
    // In a real application, this is where we'd query the actual database (Tier 3).
    res.json({
        data: products,
        message: 'Data successfully retrieved from the Application Tier.'
    });
});

app.listen(PORT, () => {
    console.log(`Application Tier API server running on port ${PORT}`);
    console.log('Access the API directly at http://localhost:8080/api/products');
});
