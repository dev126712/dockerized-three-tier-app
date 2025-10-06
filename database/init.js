db.createCollection('products');
db.user.insertOne(
    {
        name: 'paper',
        category: 'wood',
        price: 67
    }
);
