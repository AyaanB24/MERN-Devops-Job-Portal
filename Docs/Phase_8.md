# Phase 8: Job Module — Job Database Schema Model

This phase kicked off the Job module by implementing the `Job.js` Mongoose schema, which forms the database foundation for all upcoming job operations: create, read, update, delete, search, and pagination.

---

## 📂 File Architecture

Below are the new files during this phase:

```
backend/src/
└── models/
    └── Job.js (Created)
```

---

## 📝 Schema Properties Breakdown

| Field Name | Type | Validation Rules / Options | Purpose |
| :--- | :--- | :--- | :--- |
| **`title`** | String | `required`, `trim`, `maxlength: 100`, `index: true` | The job position name displayed to candidates. |
| **`description`** | String | `required`, `trim`, `maxlength: 5000` | Full job description, responsibilities, and requirements. |
| **`salary`** | Number | `required`, `min: 0` | Annual salary package for the position. |
| **`location`** | String | `required`, `trim`, `index: true` | City or remote/hybrid location for the job. |
| **`experience`** | String | `required`, Enum (`0-1 years`, `1-3 years`, ...) | The experience band required for the role. |
| **`jobType`** | String | Enum (`Full-time`, `Part-time`, `Contract`, ...), Default: `Full-time` | Employment contract type for the position. |
| **`skills`** | [String] | Default: `[]` | Array of required skill keywords. |
| **`company`** | ObjectId | `required`, `ref: 'Company'`, `index: true` | Links job to a registered company via document reference. |
| **`createdBy`** | ObjectId | `required`, `ref: 'User'`, `index: true` | Links job to the recruiter who created it. |
| **`isActive`** | Boolean | Default: `true`, `index: true` | Soft-delete/visibility flag to enable/disable a listing. |

---

## 💡 Interview Highlights (Schema Design Decisions)

### 🗂️ 1. Enum Constraints for `experience` and `jobType`
Using an `enum` whitelist on structured fields prevents free-text anomalies in the database (e.g., "5 yrs", "five years", "5+ y"). This improves filter accuracy and frontend dropdown binding — the database itself enforces the allowed set.

### 🔗 2. Dual Reference Design (`company` + `createdBy`)
*   **`company` (ref: Company):** Links the job listing to a company entity that holds logo, website, and description. Enables JOIN-like `.populate('company')` queries to display company details alongside job cards.
*   **`createdBy` (ref: User):** Records which recruiter posted the job. Critical for authorization: when a recruiter updates or deletes a job, we verify `job.createdBy.equals(req.user._id)` to prevent unauthorized mutations.

### 🔍 3. Compound Text Index for Full-Text Search
```javascript
jobSchema.index({ title: 'text', description: 'text' });
```
MongoDB's native text index enables efficient keyword search across both `title` and `description` fields simultaneously. This powers the `GET /api/jobs?search=React Developer` functionality in future phases without scanning every document.

### 🚩 4. Soft Delete via `isActive` Flag
Instead of permanently removing job documents, setting `isActive: false` lets recruiters deactivate listings without losing historical data. Queries default to filtering `{ isActive: true }` to show only live listings to candidates.

---

## 🗺️ Phase 8 Roadmap

| Step | Feature | Status |
| :--- | :--- | :--- |
| 1 | Job Model | ✅ Done |
| 2 | Create Job | 🔜 Next |
| 3 | Get All Jobs | 🔜 Upcoming |
| 4 | Get Single Job | 🔜 Upcoming |
| 5 | Update Job | 🔜 Upcoming |
| 6 | Delete Job | 🔜 Upcoming |
| 7 | Search | 🔜 Upcoming |
| 8 | Pagination | 🔜 Upcoming |

---

## 🧪 Testing Guide

We can verify the schema using a standalone Node.js test script.

### 🏃 Step 1: Create a Temp Test Script
Create `backend/testJob.js`:

```javascript
// backend/testJob.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Company = require('./src/models/Company');
const Job = require('./src/models/Job');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
    console.log('MongoDB Connected.');

    // 1. Fetch existing recruiter and company
    const recruiter = await User.findOne({ role: 'recruiter' });
    const company = await Company.findOne();

    if (!recruiter || !company) {
      console.error('❌ No recruiter or company found. Run Phase 5 test first.');
      return;
    }

    // 2. Test validation: invalid experience should FAIL
    try {
      await Job.create({
        title: 'Invalid Job',
        description: 'Test',
        salary: 50000,
        location: 'Mumbai',
        experience: '999 years', // Invalid enum value
        company: company._id,
        createdBy: recruiter._id,
      });
    } catch (err) {
      console.log('✅ Validation caught invalid experience enum:', err.message);
    }

    // 3. Create a valid job
    const job = await Job.create({
      title: 'Senior Node.js Developer',
      description: 'Build scalable REST APIs for our platform.',
      salary: 1500000,
      location: 'Bangalore',
      experience: '3-5 years',
      jobType: 'Full-time',
      skills: ['Node.js', 'Express', 'MongoDB'],
      company: company._id,
      createdBy: recruiter._id,
    });
    console.log('✅ Job created successfully:', job.title);

    // 4. Populate both references
    const populated = await Job.findById(job._id).populate('company').populate('createdBy');
    console.log('✅ Company:', populated.company.companyName);
    console.log('✅ Created By:', populated.createdBy.name);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

test();
```

### 📡 Step 2: Run the Test Script
```bash
cd backend
node testJob.js
```

**Expected Console Output:**
```
MongoDB Connected.
✅ Validation caught invalid experience enum: Job validation failed: ...
✅ Job created successfully: Senior Node.js Developer
✅ Company: Tech Corp ...
✅ Created By: Jane Recruiter
```

*(Clean up: Delete `testJob.js` once testing is verified.)*
