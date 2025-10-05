db.createCollection('products');
db.user.insertOne(
    {
        name: 'paper',
        category: 'wood',
        price: 67
    },
    {
        name: 'got it',
        category: 'i really got it',
        price: 627
    },
    {
        name: 'tv',
        category: 'to watch',
        price: 73
    },
    {
        name: 'shoe',
        category: 'to walk',
        price: 108
    },
    {
        name: 'ball',
        category: 'to play with',
        price: 842
    }
);