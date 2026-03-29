// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const winston = require('winston'); // Added Winston
const client = require('prom-client'); // Added Prometheus Client

const app = express();
const port = 8080;

// Get MongoDB connection string from environment variables
// The 'mongodb' host name is the service name from your docker-compose.yml
const mongoDbUrl = process.env.DATABASE_URI;
const dbName = "mydatabase";

let mongoClient; // To be used by /ready and routes
let collection;  // To be used by API routes

app.use(cors());
app.use(express.json());

// --- 1. Configure Winston Logger ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ],
});

// --- 2. Configure Prometheus Metrics ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metric: Count product fetches
const httpRequestCounter = new client.Counter({
  name: 'api_products_fetches_total',
  help: 'Total number of times products were requested',
});
register.registerMetric(httpRequestCounter);

// VictoriaMetrics will now scrape this instead of '/'
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});


app.get('/', (req, res) => {
    res.status(200).json({ status: "Welcome" });
});



app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.get('/ready', async (req, res) => {
    try {
        // FIX: Use the global mongoClient variable, not the Prometheus 'client'
        if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
            res.status(200).send('Ready');
        } else {
            res.status(503).send('Database not connected');
        }
    } catch (err) {
        res.status(503).send('Service Unavailable');
    }
});

// --- 2. API ROUTES (Place these OUTSIDE main so they are registered immediately) ---
app.get('/api/products', async (req, res) => {
    try {
        if (!collection) return res.status(503).json({ message: "Database not initialized" });
        const products = await collection.find({}).toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, category, price } = req.body;
        if (!name || !category || price === undefined) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const newProduct = { name, category, price: parseFloat(price), createdAt: new Date() };
        const result = await collection.insertOne(newProduct);
        res.status(201).json({ ...newProduct, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: "Error adding product" });
    }
});

async function main() {
  // Ensure the MongoDB URL is available
  if (!mongoDbUrl) {
      console.error('DATABASE_URI environment variable is not set.');
      return;
  }

  const client = new MongoClient(mongoDbUrl);
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('products');

    console.log(`database name: ${dbName}`);
    console.log(`collection name: ${collection.collectionName}`);





    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        console.log(`Application Tier API server running on port ${port}`);
        console.log(`Access the API directly at http://localhost:${port}/api/products`);
      });
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    if (process.env.NODE_ENV !== 'test') {
             process.exit(1);
    }
  }

}

module.exports = app;

if (require.main === module) {
    main().catch(err => console.error('Initialization failed', err));
}
