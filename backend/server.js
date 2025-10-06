// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 8080;

// Get MongoDB connection string from environment variables
// The 'mongodb' host name is the service name from your docker-compose.yml
const mongoDbUrl = process.env.DATABASE_URI;
const dbName = "mydatabase";

app.use(cors());

app.use(express.json());

async function main() {
  // Ensure the MongoDB URL is available
  if (!mongoDbUrl) {
      console.error('DATABASE_URI environment variable is not set.');
      process.exit(1);
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

    // Define the API endpoint
    app.get('/api/products', async (req, res) => {
        try {
            // Fetch data from the 'products' collection in MongoDB
            const products = await collection.find({}).toArray();
            res.json(products);
            
            console.log(`Fetched ${products.length} products from collection: ${collection.collectionName}`);
        } catch (error) {
            console.error('Error fetching products from database:', error);
            res.status(500).json({message: err.message});
        }
    });

    app.listen(port, () => {
      console.log(`Application Tier API server running on port ${port}`);
      console.log(`Access the API directly at http://localhost:${port}/api/products`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

main()
  .then(() => console.log('server started'))
  .catch(err => console.error('Something went wrong', err));
