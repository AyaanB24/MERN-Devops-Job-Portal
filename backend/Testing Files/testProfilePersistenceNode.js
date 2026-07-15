/**
 * Test Suite: Profile Data Persistence
 * Verifies that bio, skills, and resume updates persist in the database
 * Using Node.js http module for testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API_BASE = 'localhost:5000';

let authToken = '';
let candidateId = '';

// Test data
const testUser = {
  name: 'Test Persistence Candidate',
  email: `persistence-test-${Date.now()}@test.com`,
  password: 'TestPass@123',
  role: 'candidate'
};

const updatedProfile = {
  bio: 'This is my updated bio for persistence testing',
  skills: ['Node.js', 'React', 'MongoDB', 'AWS'],
  name: 'Updated Test Candidate'
};

/**
 * Helper function to make HTTP requests
 */
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Test 1: Register a new candidate
 */
async function testRegisterCandidate() {
  console.log('\n🔐 TEST 1: Registering candidate...');
  try {
    const response = await makeRequest('POST', '/api/auth/register', {}, testUser);
    
    if (response.status !== 201 || !response.data.success) {
      throw new Error(`Registration failed with status ${response.status}`);
    }

    authToken = response.data.data.token;
    candidateId = response.data.data.user._id;

    console.log('✅ Registration successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${candidateId}`);
    
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    throw error;
  }
}

/**
 * Test 2: Update profile (bio, skills, name)
 */
async function testUpdateProfile() {
  console.log('\n📝 TEST 2: Updating profile...');
  try {
    const response = await makeRequest(
      'PUT',
      '/api/auth/profile',
      { 'Authorization': `Bearer ${authToken}` },
      updatedProfile
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(`Update failed with status ${response.status}`);
    }

    const updatedUser = response.data.data;
    
    // Verify the update was applied
    if (updatedUser.bio !== updatedProfile.bio) {
      throw new Error(`Bio mismatch: ${updatedUser.bio} !== ${updatedProfile.bio}`);
    }
    if (updatedUser.name !== updatedProfile.name) {
      throw new Error(`Name mismatch: ${updatedUser.name} !== ${updatedProfile.name}`);
    }

    console.log('✅ Profile update successful');
    console.log(`   Bio: ${updatedUser.bio}`);
    console.log(`   Skills: ${updatedUser.skills.join(', ')}`);
    console.log(`   Name: ${updatedUser.name}`);
    
    return updatedUser;
  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    throw error;
  }
}

/**
 * Test 3: Fetch profile and verify persistence
 */
async function testProfilePersistence() {
  console.log('\n🔄 TEST 3: Verifying profile persists after fetch...');
  try {
    const response = await makeRequest(
      'GET',
      '/api/auth/profile',
      { 'Authorization': `Bearer ${authToken}` }
    );

    if (response.status !== 200) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const user = response.data.data;
    
    // Verify all updates persisted
    if (user.bio !== updatedProfile.bio) {
      throw new Error(`Bio not persisted: ${user.bio} !== ${updatedProfile.bio}`);
    }
    if (user.name !== updatedProfile.name) {
      throw new Error(`Name not persisted: ${user.name} !== ${updatedProfile.name}`);
    }
    if (JSON.stringify(user.skills) !== JSON.stringify(updatedProfile.skills)) {
      throw new Error(`Skills not persisted: ${JSON.stringify(user.skills)} !== ${JSON.stringify(updatedProfile.skills)}`);
    }

    console.log('✅ Profile data persists correctly');
    console.log(`   Bio: ${user.bio}`);
    console.log(`   Skills: ${user.skills.join(', ')}`);
    console.log(`   Name: ${user.name}`);
    
    return user;
  } catch (error) {
    console.error('❌ Profile persistence check failed:', error.message);
    throw error;
  }
}

/**
 * Helper to upload file via multipart form data
 */
function uploadFile(filePath, fieldName, token) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const boundary = crypto.randomBytes(16).toString('hex');
    
    const beforeFile = `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${path.basename(filePath)}"\r\n` +
      `Content-Type: application/pdf\r\n\r\n`;
    
    const afterFile = `\r\n--${boundary}--\r\n`;
    
    const body = Buffer.concat([
      Buffer.from(beforeFile),
      fileContent,
      Buffer.from(afterFile)
    ]);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile/resume',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
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
    
    const response = await uploadFile(testResumePath, 'resume', authToken);

    if (response.status !== 200 || !response.data.success) {
      throw new Error(`Upload failed with status ${response.status}: ${JSON.stringify(response.data)}`);
    }

    if (!response.data.data.path) {
      throw new Error('Resume path not returned');
    }

    const resumePath = response.data.data.path;

    // Verify user object has resume field updated
    const updatedUser = response.data.data.user;
    if (!updatedUser || updatedUser.resume !== resumePath) {
      throw new Error(`User resume field not updated: ${updatedUser?.resume} !== ${resumePath}`);
    }

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
    console.error('❌ Resume upload failed:', error.message);
    throw error;
  }
}

/**
 * Test 5: Fetch profile after resume upload to verify resume path persists
 */
async function testResumePathPersistence() {
  console.log('\n🔄 TEST 5: Verifying resume path persists after fetch...');
  try {
    const response = await makeRequest(
      'GET',
      '/api/auth/profile',
      { 'Authorization': `Bearer ${authToken}` }
    );

    if (response.status !== 200) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const user = response.data.data;

    // Verify resume persisted
    if (!user.resume) {
      throw new Error('Resume field does not exist');
    }
    if (!user.resume.includes('/uploads/resumes/')) {
      throw new Error(`Resume path invalid: ${user.resume}`);
    }

    console.log('✅ Resume path persists correctly');
    console.log(`   Resume: ${user.resume}`);

    return user;
  } catch (error) {
    console.error('❌ Resume persistence check failed:', error.message);
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
