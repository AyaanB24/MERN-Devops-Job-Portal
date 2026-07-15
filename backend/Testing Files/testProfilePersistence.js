/**
 * Test Suite: Profile Data Persistence
 * Verifies that bio, skills, and resume updates persist in the database
 */

const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let candidateId = '';

// Test data
const testUser = {
  name: 'Test Persistence Candidate',
  email: `persistence-test-${Date.now()}@test.com`,
  password: 'TestPass@123'
};

const updatedProfile = {
  bio: 'This is my updated bio for persistence testing',
  skills: ['Node.js', 'React', 'MongoDB', 'AWS'],
  name: 'Updated Test Candidate'
};

/**
 * Test 1: Register a new candidate
 */
async function testRegisterCandidate() {
  console.log('\n🔐 TEST 1: Registering candidate...');
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: 'candidate'
    });

    assert.strictEqual(response.status, 201, 'Registration should return 201');
    assert.strictEqual(response.data.success, true, 'Success flag should be true');
    
    authToken = response.data.data.token;
    candidateId = response.data.data.user._id;

    console.log('✅ Registration successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${candidateId}`);
    
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 2: Update profile (bio, skills, name)
 */
async function testUpdateProfile() {
  console.log('\n📝 TEST 2: Updating profile...');
  try {
    const response = await axios.put(
      `${API_BASE}/auth/profile`,
      updatedProfile,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    assert.strictEqual(response.status, 200, 'Update should return 200');
    assert.strictEqual(response.data.success, true, 'Success flag should be true');
    
    const updatedUser = response.data.data;
    
    // Verify the update was applied
    assert.strictEqual(updatedUser.bio, updatedProfile.bio, 'Bio should be updated');
    assert.strictEqual(updatedUser.name, updatedProfile.name, 'Name should be updated');
    assert.deepStrictEqual(updatedUser.skills, updatedProfile.skills, 'Skills should be updated');
    
    console.log('✅ Profile update successful');
    console.log(`   Bio: ${updatedUser.bio}`);
    console.log(`   Skills: ${updatedUser.skills.join(', ')}`);
    console.log(`   Name: ${updatedUser.name}`);
    
    return updatedUser;
  } catch (error) {
    console.error('❌ Profile update failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 3: Fetch profile and verify persistence
 */
async function testProfilePersistence() {
  console.log('\n🔄 TEST 3: Verifying profile persists after fetch...');
  try {
    const response = await axios.get(
      `${API_BASE}/auth/profile`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    assert.strictEqual(response.status, 200, 'Fetch should return 200');
    
    const user = response.data.data;
    
    // Verify all updates persisted
    assert.strictEqual(user.bio, updatedProfile.bio, 'Bio should persist in database');
    assert.strictEqual(user.name, updatedProfile.name, 'Name should persist in database');
    assert.deepStrictEqual(user.skills, updatedProfile.skills, 'Skills should persist in database');
    
    console.log('✅ Profile data persists correctly');
    console.log(`   Bio: ${user.bio}`);
    console.log(`   Skills: ${user.skills.join(', ')}`);
    console.log(`   Name: ${user.name}`);
    
    return user;
  } catch (error) {
    console.error('❌ Profile persistence check failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 4: Upload resume and verify persistence
 */
async function testResumeUpload() {
  console.log('\n📄 TEST 4: Uploading resume...');
  try {
    // Create a test PDF file
    const testResumePath = path.join(__dirname, 'test-resume.pdf');
    
    // Create a simple PDF buffer (minimal valid PDF)
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n' +
      'trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n199\n%%EOF'
    );
    
    fs.writeFileSync(testResumePath, pdfContent);
    
    const formData = new FormData();
    const fileStream = fs.createReadStream(testResumePath);
    formData.append('resume', fileStream);
    
    const response = await axios.post(
      `${API_BASE}/auth/profile/resume`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    assert.strictEqual(response.status, 200, 'Upload should return 200');
    assert.strictEqual(response.data.success, true, 'Success flag should be true');
    assert(response.data.data.path, 'Resume path should be returned');
    
    const resumePath = response.data.data.path;
    
    // Verify user object has resume field updated
    const updatedUser = response.data.data.user;
    assert.strictEqual(updatedUser.resume, resumePath, 'User resume field should be updated');
    
    console.log('✅ Resume upload successful');
    console.log(`   File: ${response.data.data.filename}`);
    console.log(`   Path: ${resumePath}`);
    
    // Cleanup test file
    try {
      fs.unlinkSync(testResumePath);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return updatedUser;
  } catch (error) {
    console.error('❌ Resume upload failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 5: Fetch profile after resume upload to verify resume path persists
 */
async function testResumePathPersistence() {
  console.log('\n🔄 TEST 5: Verifying resume path persists after fetch...');
  try {
    const response = await axios.get(
      `${API_BASE}/auth/profile`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    assert.strictEqual(response.status, 200, 'Fetch should return 200');
    
    const user = response.data.data;
    
    // Verify resume persisted
    assert(user.resume, 'Resume field should exist');
    assert(user.resume.includes('/uploads/resumes/'), 'Resume path should contain uploads directory');
    
    console.log('✅ Resume path persists correctly');
    console.log(`   Resume: ${user.resume}`);
    
    return user;
  } catch (error) {
    console.error('❌ Resume persistence check failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('=' .repeat(60));
  console.log('🧪 PROFILE DATA PERSISTENCE TEST SUITE');
  console.log('=' .repeat(60));
  
  try {
    await testRegisterCandidate();
    await testUpdateProfile();
    await testProfilePersistence();
    await testResumeUpload();
    await testResumePathPersistence();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED - Profile data persistence verified!');
    console.log('='.repeat(60));
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ TEST SUITE FAILED');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run tests
runAllTests();
