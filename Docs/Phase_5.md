# Phase 5: Company Database Schema Model

This phase implemented the database schema model for Companies using Mongoose, establishing strict validation rules, indexing strategies, and database-level relationships between Companies and Owners (Users).

---

## 📂 File Architecture

Below are the new files during this phase:

```
backend/src/
└── models/
    └── Company.js (Created)
```

---

## 📝 Schema Properties Breakdown

| Field Name | Data Type | Validation Rules / Options | Purpose |
| :--- | :--- | :--- | :--- |
| **`companyName`** | String | `required`, `unique`, `trim`, `maxlength: 100`, `index: true` | The unique name identifying the company. |
| **`description`** | String | `trim`, `maxlength: 1000` | Detailed company bio or background text. |
| **`website`** | String | `trim`, RegExp (URL Match Validation) | Official website link of the company. |
| **`logo`** | String | Default: `""` | Safe URL pointing to uploaded logo image file. |
| **`owner`** | ObjectId | `required`, `ref: 'User'`, `index: true` | Reference link to the recruiter/user account who created it. |

---

## 💡 Interview Highlights (Core Concepts)

### 📊 1. Relational Mapping in MongoDB (`ref`)
MongoDB is a non-relational document database. To link companies with users (recruiters), we use the Mongoose `ref` property. The `owner` field stores a MongoDB `ObjectId` that references the `User` model, enabling the use of `.populate('owner')` to retrieve full recruiter details in queries.

### ⚡ 2. Database Indexing
Setting `index: true` on fields like `companyName` and `owner` informs MongoDB to create indexing structures. This guarantees fast retrieval times for:
*   Search/filter actions by company name.
*   Fetching all companies owned by a specific Recruiter profile.

### 🛡️ 3. Built-in Schema Sanitation (`trim`)
We use Mongoose's built-in `trim: true` to prevent storage anomalies (e.g., matching search terms failing due to leading/trailing spaces). It automatically strips white space from user inputs prior to saving.

---

## 🧪 Testing Guide

Since no controllers or routes have been mapped yet, we can test the Mongoose schema constraints by creating a quick scratch script to verify MongoDB insertion, validation, and reference resolution.

### 🏃 Step 1: Create a Temp Test Script
Create a file named `testCompany.js` inside your `backend` directory:

```javascript
// backend/testCompany.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Company = require('./src/models/Company');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
    console.log('MongoDB Connected.');

    // 1. Fetch or create a test user (owner)
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Test Owner',
        email: 'owner@example.com',
        password: 'securepassword123',
        role: 'recruiter'
      });
    }

    // 2. Try creating a company with invalid website format (should FAIL)
    try {
      await Company.create({
        companyName: 'Bad Format Inc',
        website: 'not-a-valid-url',
        owner: user._id
      });
    } catch (err) {
      console.log('✅ Validation properly caught invalid URL format:', err.message);
    }

    // 3. Create a valid company (should SUCCEED)
    const company = await Company.create({
      companyName: 'Tech Corp ' + Date.now(),
      description: 'A leading tech company',
      website: 'https://techcorp.com',
      owner: user._id
    });
    console.log('✅ Company created successfully:', company);

    // 4. Query & populate reference
    const queriedCompany = await Company.findById(company._id).populate('owner');
    console.log('✅ Populated Owner Details:', queriedCompany.owner.name);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

test();
```

### 📡 Step 2: Run the Test Script
In your terminal, execute:
```bash
cd backend
node testCompany.js
```

**Expected Console Output:**
```
MongoDB Connected.
✅ Validation properly caught invalid URL format: Company validation failed: website: Please provide a valid website URL
✅ Company created successfully: { ... }
✅ Populated Owner Details: Test Owner
```

*(Clean up: Delete `testCompany.js` once testing is verified)*
