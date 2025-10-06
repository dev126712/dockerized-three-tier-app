db.createCollection('products');
db.products.insertOne(
    {
        name: 'paper',
        category: 'wood',
        price: 67
    }
);
