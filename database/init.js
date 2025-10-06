db.createCollection('products');
db.products.insertMany(
    {
        name: 'paper',
        category: 'wood',
        price: 67
    },
    {
        name: 'Laptop Pro',
        category: 'Electronics',
        price: 1299.99
    },
    {
        name: 'Wireless Mouse',
        category: 'Accessories',
        price: 25.50
    },
    {
        name: 'Desk Chair (Ergo)',
        category: 'Furniture',
        price: 350.00
    }
);
