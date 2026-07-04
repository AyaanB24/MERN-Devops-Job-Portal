# Phase 10: Saved Jobs — SavedJob Database Schema Model

This phase implemented the `SavedJob.js` Mongoose schema, allowing candidates to bookmark job listings for future reference. It uses a dedicated junction document to track which user saved which job and when.

---

## 📂 File Architecture

```
backend/src/
└── models/
    └── SavedJob.js (Created)
```

---

## 📝 Schema Properties Breakdown

| Field Name | Type | Validation / Options | Purpose |
| :--- | :--- | :--- | :--- |
| **`user`** | ObjectId | `required`, `ref: 'User'`, `index: true` | Links the bookmark to the candidate who saved it. |
| **`job`** | ObjectId | `required`, `ref: 'Job'`, `index: true` | Links the bookmark to the saved job listing. |
| **`savedAt`** | Date | Default: `Date.now` | Exact timestamp when the job was bookmarked. |

---

## 💡 Interview Highlights

### 📁 1. Why a Separate Collection?

**Option A (Embedded Array — Not Used):**
```javascript
// Storing saved jobs inside the User document
userSchema = {
  savedJobs: [{ type: ObjectId, ref: 'Job' }]
}
```
*   ❌ **Document growth:** MongoDB documents have a 16MB size limit. Active candidates who bookmark hundreds of jobs can push the User document to unmanageable sizes.
*   ❌ **Querying difficulty:** Querying "who all saved this job?" requires scanning every User document — an expensive full-collection scan.
*   ❌ **No metadata:** There's no clean way to attach per-save data (like `savedAt` timestamp or notes) to each bookmark.

**Option B (Separate `SavedJob` Collection — Our Implementation):**
*   ✅ **Bounded document size:** Each bookmark is a tiny, lean document (3 fields). Collections grow horizontally instead of bloating user documents.
*   ✅ **Bidirectional queries:** Fast lookup in both directions — "all jobs saved by user X" and "all users who saved job Y" — via indexed fields.
*   ✅ **Extensible metadata:** Easy to add fields like `notes`, `reminderDate`, or `priority` per bookmark without touching the User schema.

---

### 🔄 2. Alternative Approaches

| Approach | Pros | Cons | Best For |
| :--- | :--- | :--- | :--- |
| **Embedded Array in User** | Simple, single query | Unbounded growth, no metadata | Low-volume bookmarks |
| **Separate Collection (Our Choice)** | Scalable, bidirectional, extensible | Extra join/populate needed | Production applications |
| **Redis Set (Cache Layer)** | Ultra-fast read/write | Not persistent by default; data loss risk | Real-time interaction counts |
| **Embedded Array in Job** | Fast "all savers" lookup | Same unbounded growth problem | Job-centric use cases |

---

## 🧪 Testing Guide

### 🏃 Step 1: Create a Temp Test Script
Create `backend/testSavedJob.js`:

```javascript
// backend/testSavedJob.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const SavedJob = require('./src/models/SavedJob');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
    console.log('MongoDB Connected.');

    // 1. Fetch existing candidate and job
    const user = await User.findOne({ role: 'candidate' });
    const job = await Job.findOne();

    if (!user || !job) {
      console.error('❌ No candidate or job found. Run Phase 8 test first.');
      return;
    }

    // 2. Save the job (should SUCCEED)
    const saved = await SavedJob.create({
      user: user._id,
      job: job._id,
    });
    console.log('✅ Job saved at:', saved.savedAt);

    // 3. Try saving again (should FAIL - duplicate index)
    try {
      await SavedJob.create({
        user: user._id,
        job: job._id,
      });
    } catch (err) {
      console.log('✅ Duplicate save blocked by compound unique index.');
    }

    // 4. Fetch all saved jobs for the user with populated job details
    const savedJobs = await SavedJob.find({ user: user._id })
      .populate('job', 'title location salary');

    console.log(`✅ Saved jobs for ${user.name}:`);
    savedJobs.forEach(s => console.log(' -', s.job.title, '|', s.job.location));

    // 5. Unsave (delete) the bookmark
    await SavedJob.deleteOne({ user: user._id, job: job._id });
    console.log('✅ Job unsaved successfully.');

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
node testSavedJob.js
```

**Expected Console Output:**
```
MongoDB Connected.
✅ Job saved at: 2026-07-05T...
✅ Duplicate save blocked by compound unique index.
✅ Saved jobs for Interview Candidate:
 - Senior Node.js Developer | Bangalore
✅ Job unsaved successfully.
```

*(Clean up: Delete `testSavedJob.js` once testing is verified.)*
