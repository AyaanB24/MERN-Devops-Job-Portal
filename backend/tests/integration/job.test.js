const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Job = require('../../src/models/Job');
const User = require('../../src/models/User');

describe('Job API Integration Tests', () => {
  let token;
  let recruiterId;
  let testJobId;

  // 1. Global Setup
  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/jobportal_test';
    await mongoose.connect(testDbUri);
  });

  // 2. State Reset and Seed Data
  beforeEach(async () => {
    await Job.deleteMany({});
    await User.deleteMany({});

    // Create a mock recruiter in the database
    const recruiter = await User.create({
      name: 'Test Recruiter',
      email: 'recruiter@example.com',
      password: 'password123',
      role: 'recruiter'
    });

    recruiterId = recruiter._id;

    // Manually sign a JWT token for the mock recruiter
    token = jwt.sign(
      { id: recruiter._id }, 
      process.env.JWT_SECRET || 'mySuperSecretKey', 
      { expiresIn: '1h' }
    );
  });

  // 3. Global Teardown
  afterAll(async () => {
    await mongoose.connection.close();
  });

  const validJobPayload = {
    title: 'Software Developer',
    description: 'Building amazing scalable backend systems in Node.js.',
    salary: 120000,
    location: 'Remote',
    experience: '1-3 years',
    jobType: 'Full-time'
  };

  describe('POST /api/jobs', () => {
    it('should create a new job successfully when authorized as recruiter', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`) // Attach JWT token
        .send(validJobPayload);

      // Note: Depending on controller implementation, this expects 201 Created
      // If the controller demands a valid Company ID in the DB, mock it here if needed.
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(validJobPayload.title);
      
      testJobId = res.body.data.id || res.body.data._id;
    });

    it('should fail to create a job if no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send(validJobPayload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      // Seed a job before testing the GET route
      await Job.create({
        ...validJobPayload,
        company: new mongoose.Types.ObjectId(), // Dummy company ID
        createdBy: recruiterId
      });
    });

    it('should retrieve a list of all jobs', async () => {
      const res = await request(app).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    beforeEach(async () => {
      const job = await Job.create({
        ...validJobPayload,
        company: new mongoose.Types.ObjectId(),
        createdBy: recruiterId
      });
      testJobId = job._id;
    });

    it('should update a job successfully when authorized', async () => {
      const updatePayload = { salary: 150000 };

      const res = await request(app)
        .put(`/api/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.salary).toBe(150000);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    beforeEach(async () => {
      const job = await Job.create({
        ...validJobPayload,
        company: new mongoose.Types.ObjectId(),
        createdBy: recruiterId
      });
      testJobId = job._id;
    });

    it('should delete a job successfully when authorized', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's actually deleted from the database
      const jobInDb = await Job.findById(testJobId);
      expect(jobInDb).toBeNull();
    });
  });
});
