# Phase 9: Application Module — Application Database Schema Model

This phase kicked off the Application module by implementing the `Application.js` Mongoose schema, establishing the three-way relationship between **Candidates**, **Jobs**, and their **Application Status**. It forms the data foundation for applying to jobs, tracking applications, and accepting/rejecting candidates.

---

## 📂 File Architecture

```
backend/src/
└── models/
    └── Application.js (Created)
```

---

## 📝 Schema Properties Breakdown

| Field Name | Type | Validation / Options | Purpose |
| :--- | :--- | :--- | :--- |
| **`candidate`** | ObjectId | `required`, `ref: 'User'`, `index: true` | Links application to the applying candidate. |
| **`job`** | ObjectId | `required`, `ref: 'Job'`, `index: true` | Links application to the job being applied for. |
| **`status`** | String | Enum (`pending`, `accepted`, `rejected`), Default: `pending`, `index: true` | Current decision state of the application. |
| **`resume`** | String | Default: `""` | URL of the resume submitted with this application. |
| **`coverLetter`** | String | `trim`, `maxlength: 2000`, Default: `""` | Optional letter submitted alongside the application. |

---

## 💡 Interview Highlights (Relationship Design)

### 🔗 1. Three-Way Relationship in MongoDB

The `Application` model is a **Junction/Pivot document** — a design pattern used to express many-to-many relationships in document databases.

```
User (Candidate) ──┐
                   ├──► Application ◄── Status (pending/accepted/rejected)
Job ───────────────┘
```

*   A **Candidate** can apply to **many Jobs** → One-to-Many from Candidate.
*   A **Job** can receive **many Applications** → One-to-Many from Job.
*   Together, via the `Application` document, this becomes a **Many-to-Many** relationship.

Rather than embedding application arrays inside User or Job documents (which causes unbounded document growth), we store each application as a separate, lean document with foreign key references (`ObjectId`) to both sides.

### 🛡️ 2. Compound Unique Index — Preventing Duplicate Applications
```javascript
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
```
This compound index enforces at the **database level** that the same candidate can only apply once per job. Even if the application layer has a bug, MongoDB rejects the duplicate write — a critical safeguard for data integrity.

### ⚡ 3. Indexed `status` Field
Indexing `status` enables performant queries like:
*   "Show all pending applications for this job" → `{ job: jobId, status: 'pending' }`
*   "Show all accepted applications for this candidate" → `{ candidate: userId, status: 'accepted' }`

Without the index, MongoDB would perform a full collection scan on every such query.

---

## 🗺️ Phase 9 Roadmap

| Step | Feature | Status |
| :--- | :--- | :--- |
| 1 | Application Model | ✅ Done |
| 2 | Apply for a Job (`POST`) | 🔜 Next |
| 3 | Track Application Status (`GET`) | 🔜 Upcoming |
| 4 | Accept Candidate (`PATCH`) | 🔜 Upcoming |
| 5 | Reject Candidate (`PATCH`) | 🔜 Upcoming |

---

## 🧪 Testing Guide

### 🏃 Step 1: Create a Temp Test Script
Create `backend/testApplication.js`:

```javascript
// backend/testApplication.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
    console.log('MongoDB Connected.');

    // 1. Fetch existing candidate and job
    const candidate = await User.findOne({ role: 'candidate' });
    const job = await Job.findOne();

    if (!candidate || !job) {
      console.error('❌ No candidate or job found. Run Phase 8 test first.');
      return;
    }

    // 2. Apply to a job (should SUCCEED)
    const application = await Application.create({
      candidate: candidate._id,
      job: job._id,
      coverLetter: 'I am very passionate about this role.',
    });
    console.log('✅ Application submitted:', application.status);

    // 3. Try applying again (should FAIL - duplicate index)
    try {
      await Application.create({
        candidate: candidate._id,
        job: job._id,
      });
    } catch (err) {
      console.log('✅ Duplicate application blocked by compound unique index.');
    }

    // 4. Accept the candidate
    application.status = 'accepted';
    await application.save();
    console.log('✅ Status updated to:', application.status);

    // 5. Populate candidate and job details
    const populated = await Application.findById(application._id)
      .populate('candidate', 'name email')
      .populate('job', 'title location');

    console.log('✅ Candidate:', populated.candidate.name);
    console.log('✅ Job:', populated.job.title);

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
node testApplication.js
```

**Expected Console Output:**
```
MongoDB Connected.
✅ Application submitted: pending
✅ Duplicate application blocked by compound unique index.
✅ Status updated to: accepted
✅ Candidate: John Candidate
✅ Job: Senior Node.js Developer
```

*(Clean up: Delete `testApplication.js` once testing is verified.)*
