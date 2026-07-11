const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth API Integration Tests', () => {
  // 1. Setup: Connect to a dedicated test database before all tests run
  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/jobportal_test';
    await mongoose.connect(testDbUri);
  });

  // 2. Clean State: Wipe the User collection before EACH test so tests don't interfere with each other
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // 3. Teardown: Disconnect from the database after all tests are finished
  afterAll(async () => {
    await mongoose.connection.close();
  });

  const validUser = {
    name: 'Jane Doe',
    email: 'jane.test@example.com',
    password: 'securePassword123',
    role: 'candidate'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Act: Send a request to the register endpoint
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Assert: Verify the response matches expected output
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe(validUser.email);
    });

    it('should fail when registering with a duplicate email', async () => {
      // Arrange: Create the user first
      await request(app).post('/api/auth/register').send(validUser);

      // Act: Attempt to register the exact same user again
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Assert: Verify it throws a 409 Conflict error
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/duplicate/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Arrange: Pre-register the user before each login test runs
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should login successfully with valid credentials', async () => {
      // Act: Send valid login credentials
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      // Assert: Verify a token and user data are returned
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should fail login with an invalid password', async () => {
      // Act: Send invalid password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongPassword!@#',
        });

      // Assert: Verify it throws a 401 Unauthorized error
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
