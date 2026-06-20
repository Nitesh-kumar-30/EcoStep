import assert from 'assert';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { dbConnect } from '../database.js';
import authMiddleware from '../middleware/auth.js';
import errorHandler from '../middleware/errorHandler.js';

// Import Route Handlers
import authRoutes from '../routes/auth.js';
import calculatorRoutes from '../routes/calculator.js';
import chatRoutes from '../routes/chat.js';

console.log('🧪 Starting API Integration Tests...');

// Setup test app
const app = express();
app.use(express.json());

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/chat', chatRoutes);
app.use(errorHandler);

const TEST_PORT = 5099;
let server;

// Start Server
const startTestServer = () => {
  return new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}`);
      resolve();
    });
  });
};

const stopTestServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Test server stopped.');
      resolve();
    });
  });
};

// Test Runner
const runTests = async () => {
  await dbConnect();
  await startTestServer();

  const baseUrl = `http://localhost:${TEST_PORT}/api`;
  let authToken = '';
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Password123' // Conforms to complexity requirements
  };

  try {
    // --- TEST 1: Password Strength Restriction Check ---
    console.log('Running Test 1: Password complexity enforcement...');
    const regFailRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'failuser',
        email: 'fail@example.com',
        password: 'weak' // Too short, no numbers/uppercase
      })
    });
    assert.strictEqual(regFailRes.status, 400, 'Weak password registration should return 400 Bad Request');
    const regFailData = await regFailRes.json();
    assert.ok(regFailData.message.includes('Password must be at least 6 characters'), 'Error message should describe password rule');
    console.log('✅ Test 1 Passed.');

    // --- TEST 2: Valid Registration ---
    console.log('Running Test 2: Valid user registration...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    assert.strictEqual(regRes.status, 201, 'Valid registration should return 201 Created');
    const regData = await regRes.json();
    assert.ok(regData.token, 'Token should be returned on registration');
    assert.strictEqual(regData.user.username, testUser.username, 'Returned username matches input');
    console.log('✅ Test 2 Passed.');

    // --- TEST 3: User Login ---
    console.log('Running Test 3: User login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    assert.strictEqual(loginRes.status, 200, 'Valid login should return 200 OK');
    const loginData = await loginRes.json();
    assert.ok(loginData.token, 'Token should be returned on login');
    authToken = loginData.token;
    console.log('✅ Test 3 Passed.');

    // --- TEST 4: Calculate Carbon Footprint (Protected Route) ---
    console.log('Running Test 4: Protected Carbon footprint calculation...');
    
    // Test unauthorized request first
    const calcUnauthRes = await fetch(`${baseUrl}/calculator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transport: { car: 100, publicTransport: 0, flights: 0 },
        energy: { electricity: 200 },
        food: { habit: 'vegan' },
        waste: { generation: 10, recycled: true }
      })
    });
    assert.strictEqual(calcUnauthRes.status, 401, 'Unauthorized request should be blocked with 401');

    // Test authorized request
    const calcRes = await fetch(`${baseUrl}/calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        transport: { car: 100, publicTransport: 50, flights: 10 },
        energy: { electricity: 250 },
        food: { habit: 'vegetarian' },
        waste: { generation: 15, recycled: true }
      })
    });
    assert.strictEqual(calcRes.status, 201, 'Authorized calculation should return 201 Created');
    const calcData = await calcRes.json();
    assert.ok(calcData.footprint, 'Logged footprint object should be returned');
    assert.ok(calcData.breakdown, 'Emissions breakdown should be returned');
    assert.ok(calcData.footprint.totalEmissions > 0, 'Total emissions score should be positive');
    console.log('✅ Test 4 Passed.');

    // --- TEST 5: Chatbot Fallback Response ---
    console.log('Running Test 5: Chatbot fallback matching...');
    const chatRes = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ message: 'How do I earn points?' })
    });
    assert.strictEqual(chatRes.status, 200, 'Chat request should return 200 OK');
    const chatData = await chatRes.json();
    assert.ok(chatData.reply, 'Reply should be returned');
    assert.ok(chatData.source.startsWith('fallback') || chatData.source === 'gemini', 'Response source should represent cache, fallback or gemini');
    console.log('✅ Test 5 Passed.');

    console.log('\n🎉 All API Integration Tests Passed Successfully!');
  } catch (err) {
    console.error('❌ Integration Tests Failed:', err.message);
    if (err.stack) console.error(err.stack);
    await stopTestServer();
    process.exit(1);
  }

  await stopTestServer();
  process.exit(0);
};

runTests();
