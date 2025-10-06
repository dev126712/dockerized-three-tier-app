// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 8080;

// Get MongoDB connection string from environment variables
// The 'mongodb' host name is the service name from your docker-compose.yml
const mongoDbUrl = process.env.DATABASE_URI;
const dbName = process.env.DATABASE_USERNAME;

async function main() {
  const client = new MongoClient(mongoDbUrl);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('product');

    // Define the API endpoint
    app.get('/api/products', async (req, res) => {
        try {
            // Fetch data from the 'products' collection in MongoDB
            const products = await collection.find({}).toArray();
            res.json(products);
        } catch (error) {
            console.error('Error fetching products from database:', error);
            res.status(500).send('Internal Server Error');
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
