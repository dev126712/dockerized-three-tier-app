// This file assumes your tests are in a 'test' folder

// 1. Import dependencies (like your server, and an assertion library)
const request = require('supertest'); // Used to make HTTP requests to the server
const { expect } = require('chai');
const app = require('/app/server.js'); // Assuming your server exports the Express app

// 2. Define the Test Suite using describe()
describe('API Server Health Check', function() {
  
  // 3. Define the Test Case using it()
  it('should return a 200 OK status code on the root path', async function() {
    
    // Make a request to the server
    const response = await request(app).get('/');
    
    // 4. Use an Assertion to check the result
    expect(response.status).to.equal(200);
    expect(response.text).to.include('Welcome'); 
    
  });
  
  it('should handle missing routes with a 404 error', async function() {
    const response = await request(app).get('/nonexistent-page');
    expect(response.status).to.equal(404);
  });
  
});
