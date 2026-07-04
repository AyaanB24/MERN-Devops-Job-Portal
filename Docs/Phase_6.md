# Phase 6: Candidate Profile - Update Profile Service

This phase implemented the business logic for candidate profile updates, establishing a secure service function that handles partial updates and filters out sensitive field updates (like password, role, and email).

---

## 📂 File Architecture

Below are the new files during this phase:

```
backend/src/
└── services/
    └── userService.js (Created)
```

---

## 💡 Industry Concepts & Design Decisions

### ⚡ 1. Why Partial Updates are Needed
*   **Bandwidth Efficiency:** Candidates typically update only one section of their profile at a time (e.g., adding a new internship or updating their resume link). Sending the entire profile object back and forth wastes network bandwidth.
*   **Race Conditions:** If two processes attempt to update different fields on the same document simultaneously, full document updates can overwrite each other's changes. Partial updates using MongoDB atomic operators like `$set` modify only target fields, preventing data loss.
*   **Client Flexibility:** Allows the frontend to have separate modal forms (e.g., "Edit Biography", "Add Education") without needing to gather, bundle, and send the user's entire profile state.

### 🛡️ 2. Industry Update Patterns

In production-grade APIs, profile updates generally follow one of two patterns:

#### A. Whitelisted PATCH Pattern (Our Implementation)
*   **Mechanism:** The client submits a HTTP `PATCH` request containing only the modified fields. The service function compares keys against a strict whitelist of candidate-modifiable properties, builds a dynamic `$set` update payload, and updates the database.
*   **Pros:** Highly secure; prevents malicious users from escalating privileges (e.g., changing their role from `candidate` to `admin` or changing their email without verification).

#### B. Sub-document Specific Endpoints
*   **Mechanism:** Instead of a generic profile endpoint, complex properties (like `education`, `projects`, and `internships`) are treated as nested sub-resources with dedicated routes:
    *   `POST /api/users/profile/education` (Append item)
    *   `PUT /api/users/profile/education/:eduId` (Modify item)
    *   `DELETE /api/users/profile/education/:eduId` (Remove item)
*   **Pros:** Easier to handle validation and ordering on arrays; highly scalable for complex nested datasets.

---

## 🧪 Testing Guide

We can test the profile update business logic using a standalone node verification script.

### 🏃 Step 1: Create a Temp Test Script
Create a file named `testUserUpdate.js` inside your `backend` directory:

```javascript
// backend/testUserUpdate.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
const { updateProfile } = require('./src/services/userService');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
    console.log('MongoDB Connected.');

    // 1. Fetch or create a test candidate
    let user = await User.findOne({ role: 'candidate' });
    if (!user) {
      user = await User.create({
        name: 'John Candidate',
        email: 'candidate@example.com',
        password: 'securepassword123',
        role: 'candidate'
      });
    }

    console.log('Original User Bio:', user.bio || 'None');

    // 2. Perform a partial update on the bio and skills
    const updatePayload = {
      bio: 'Enthusiastic software engineer working with Node.js and MongoDB.',
      skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
      role: 'admin', // Should be ignored by whitelist
      email: 'hacker@example.com' // Should be ignored by whitelist
    };

    const updatedUser = await updateProfile(user._id, updatePayload);
    console.log('✅ Update Profile Succeeded.');
    console.log('Updated Bio:', updatedUser.bio);
    console.log('Updated Skills:', updatedUser.skills);
    console.log('Role unchanged (Whitelist verified):', updatedUser.role);
    console.log('Email unchanged (Whitelist verified):', updatedUser.email);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal'); // Ensure connection is active
    await mongoose.connection.close();
  }
};

test();
```

### 📡 Step 2: Run the Test Script
In your terminal, execute:
```bash
cd backend
node testUserUpdate.js
```

**Expected Console Output:**
```
MongoDB Connected.
Original User Bio: ...
✅ Update Profile Succeeded.
Updated Bio: Enthusiastic software engineer working with Node.js and MongoDB.
Updated Skills: [ 'JavaScript', 'Node.js', 'Express', 'MongoDB' ]
Role unchanged (Whitelist verified): candidate
Email unchanged (Whitelist verified): candidate@example.com
```

*(Clean up: Delete `testUserUpdate.js` once testing is verified)*
