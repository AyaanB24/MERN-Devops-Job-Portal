const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Application = require('../../src/models/Application');
const Job = require('../../src/models/Job');
const User = require('../../src/models/User');

describe('Application API Integration Tests', () => {
  let candidateToken;
  let recruiterToken;
  let candidateId;
  let recruiterId;
  let testJobId;
  let testApplicationId;

  // 1. Global Setup
  beforeAll(async () => {
    const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/jobportal_test';
    await mongoose.connect(testDbUri);
  });

  // 2. State Reset and Seed Data
  beforeEach(async () => {
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});

    // Create a mock Candidate
    const candidate = await User.create({
      name: 'Test Candidate',
      email: 'candidate@example.com',
      password: 'password123',
      role: 'candidate'
    });
    candidateId = candidate._id;

    // Generate JWT token for Candidate
    candidateToken = jwt.sign(
      { id: candidate._id },
      process.env.JWT_SECRET || 'mySuperSecretKey',
      { expiresIn: '1h' }
    );

    // Create a mock Recruiter
    const recruiter = await User.create({
      name: 'Test Recruiter',
      email: 'recruiter@example.com',
      password: 'password123',
      role: 'recruiter'
    });
    recruiterId = recruiter._id;

    // Generate JWT token for Recruiter
    recruiterToken = jwt.sign(
      { id: recruiter._id },
      process.env.JWT_SECRET || 'mySuperSecretKey',
      { expiresIn: '1h' }
    );

    // Create a mock Job posted by the Recruiter
    const job = await Job.create({
      title: 'Backend Developer',
      description: 'Node.js backend role',
      salary: 100000,
      location: 'Remote',
      experience: '1-3 years',
      jobType: 'Full-time',
      company: new mongoose.Types.ObjectId(), // Dummy company ID
      createdBy: recruiterId
    });
    testJobId = job._id;
  });

  // 3. Global Teardown
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/applications', () => {
    it('should allow a candidate to apply for a job', async () => {
      const payload = {
        job: testJobId.toString(),
        coverLetter: 'I am highly interested in this backend role.'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`) // Apply as a candidate
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
    });
  });

  describe('GET /api/applications', () => {
    beforeEach(async () => {
      // Seed an application before testing GET
      await Application.create({
        candidate: candidateId,
        job: testJobId,
        coverLetter: 'Test cover letter'
      });
    });

    it('should retrieve a list of applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${recruiterToken}`); // Typically recruiters view applications

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/applications/:id/status', () => {
    beforeEach(async () => {
      // Seed a pending application
      const appDoc = await Application.create({
        candidate: candidateId,
        job: testJobId,
        coverLetter: 'Test cover letter',
        status: 'pending'
      });
      testApplicationId = appDoc._id;
    });

    it('should accept a candidate application successfully', async () => {
      const res = await request(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`) // Recruiter performs action
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('accepted');
    });

    it('should reject a candidate application successfully', async () => {
      const res = await request(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`) // Recruiter performs action
        .send({ status: 'rejected' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
    });
  });
});
