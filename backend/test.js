const request = require('supertest');
const { expect } = require('chai');
const app = require('./server.js'); // Updated path to match your structure 

describe('API Server Functional Tests', function() {
  
  it('should return a 200 OK status code on the root path', async function() {
    const response = await request(app).get('/');
    expect(response.status).to.equal(200);
    expect(response.text).to.include('Welcome'); 
  });

  // --- New Test Case for POST /api/products ---
  it('should create a new product and return 201', async function() {
    const newProduct = {
      name: "Dockerized Mug",
      category: "Merchandise",
      price: 15.99
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .set('Accept', 'application/json');

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('_id');
    expect(response.body.name).to.equal(newProduct.name);
    expect(response.body.price).to.equal(15.99);
  });

  it('should return 400 if product name is missing', async function() {
    const invalidProduct = { category: "Tech", price: 100 };
    const response = await request(app)
      .post('/api/products')
      .send(invalidProduct);

    expect(response.status).to.equal(400);
  });
});