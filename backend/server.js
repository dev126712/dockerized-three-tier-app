// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 8080;

// Get MongoDB connection string from environment variables
// The 'mongodb' host name is the service name from your docker-compose.yml
const mongoDbUrl = process.env.DATABASE_URL;
const dbName = 'mydatabase';

async function main() {
  const client = new MongoClient(mongoDbUrl);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const db = client.db(dbName);

    // Hardcoded data
    const hardcodedProducts = [
      { id: 1, name: 'Laptop', price: 177777200 },
      { id: 2, name: 'Mouse', price: 25 },
      { id: 3, name: 'Keyboard', price: 75 }
    ];

    // Insert hardcoded data if the collection is empty
    const collection = db.collection('products');
    const count = await collection.countDocuments();
    if (count === 0) {
        await collection.insertMany(hardcodedProducts);
        console.log('Inserted initial hardcoded data into the database.');
    }

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

main();