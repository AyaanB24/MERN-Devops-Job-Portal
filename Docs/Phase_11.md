# Phase 11: Admin Module — Dashboard Analytics Service

This phase implemented the Admin analytics service (`adminService.js`), which aggregates platform-wide metrics for the admin dashboard. It uses parallel query execution and MongoDB's native `$group` aggregation stage to efficiently compute user, job, and application statistics.

---

## 📂 File Architecture

```
backend/src/
└── services/
    └── adminService.js (Created)
```

---

## 📝 Analytics Metrics

| Metric | Query Method | Description |
| :--- | :--- | :--- |
| **Total Users** | `countDocuments()` | All registered accounts. |
| **Total Recruiters** | `countDocuments({ role: 'recruiter' })` | Users with the recruiter role. |
| **Total Candidates** | `countDocuments({ role: 'candidate' })` | Users with the candidate role. |
| **Total Jobs** | `countDocuments()` | All job listings (active + inactive). |
| **Active Jobs** | `countDocuments({ isActive: true })` | Only live, visible job listings. |
| **Total Applications** | `countDocuments()` | All submitted applications. |
| **Applications by Status** | `aggregate([$group])` | Breakdown: pending / accepted / rejected. |
| **Recent Jobs** | `find().sort().limit(5).populate()` | Last 5 active job postings. |

---

## 💡 Aggregation Logic Explained

### ⚡ 1. Parallel Execution via `Promise.all`
All 8 database queries run **simultaneously** instead of sequentially:

```javascript
// ❌ Sequential (slow) — total time = sum of all query times
const a = await User.countDocuments();
const b = await Job.countDocuments();
const c = await Application.countDocuments();

// ✅ Parallel (fast) — total time = slowest single query
const [a, b, c] = await Promise.all([
  User.countDocuments(),
  Job.countDocuments(),
  Application.countDocuments(),
]);
```
This reduces response time from N × average_query_time to ≈ max(query_time).

---

### 📊 2. MongoDB `$group` Aggregation Stage
The `applicationsByStatus` metric uses the aggregation pipeline to group documents by their `status` field and count entries per group:

```javascript
Application.aggregate([
  {
    $group: {
      _id: '$status',     // Group key: unique values of the status field
      count: { $sum: 1 }, // Accumulator: add 1 for each document in the group
    },
  },
])
```

**Input Documents:**
```
{ status: 'pending' }
{ status: 'pending' }
{ status: 'accepted' }
{ status: 'rejected' }
```

**Aggregation Output:**
```json
[
  { "_id": "pending",  "count": 2 },
  { "_id": "accepted", "count": 1 },
  { "_id": "rejected", "count": 1 }
]
```

**Post-Transform (in service):**
```json
{ "pending": 2, "accepted": 1, "rejected": 1 }
```
The array is converted to a flat key-value map using `forEach` to make the API response easier for the frontend to consume.

---

## 🗺️ Phase 11 Roadmap

| Step | Feature | Status |
| :--- | :--- | :--- |
| 1 | Dashboard Analytics Service | ✅ Done |
| 2 | Admin — Manage Users | 🔜 Next |
| 3 | Admin — Manage Jobs | 🔜 Upcoming |

---

## 🧪 Testing Guide

### 🏃 Step 1: Create a Temp Test Script
Create `backend/testAdminAnalytics.js`:

```javascript
// backend/testAdminAnalytics.js
const mongoose = require('mongoose');
const { getDashboardAnalytics } = require('./src/services/adminService');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
    console.log('MongoDB Connected.');

    const analytics = await getDashboardAnalytics();

    console.log('\n📊 Admin Dashboard Analytics');
    console.log('================================');
    console.log('👥 Users');
    console.log('   Total:', analytics.users.total);
    console.log('   Recruiters:', analytics.users.recruiters);
    console.log('   Candidates:', analytics.users.candidates);

    console.log('\n💼 Jobs');
    console.log('   Total:', analytics.jobs.total);
    console.log('   Active:', analytics.jobs.active);
    console.log('   Inactive:', analytics.jobs.inactive);

    console.log('\n📋 Applications');
    console.log('   Total:', analytics.applications.total);
    console.log('   By Status:', analytics.applications.byStatus);

    console.log('\n🆕 Recent Jobs');
    analytics.recentJobs.forEach(j => {
      console.log(`   - ${j.title} | ${j.location} | ₹${j.salary}`);
    });

    console.log('\n✅ Analytics fetched successfully.');
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
node testAdminAnalytics.js
```

**Expected Console Output:**
```
MongoDB Connected.

📊 Admin Dashboard Analytics
================================
👥 Users
   Total: 4
   Recruiters: 1
   Candidates: 1

💼 Jobs
   Total: 2
   Active: 2
   Inactive: 0

📋 Applications
   Total: 1
   By Status: { pending: 0, accepted: 1, rejected: 0 }

🆕 Recent Jobs
   - Senior Node.js Developer | Bangalore | ₹1500000

✅ Analytics fetched successfully.
```

*(Clean up: Delete `testAdminAnalytics.js` once testing is verified.)*

---

## 🛠️ Troubleshooting & Fixes

### 🐛 Issue: `MissingSchemaError: Schema hasn't been registered for model "Company"`

When running the analytics test script, the following error occurred:
```
MissingSchemaError: Schema hasn't been registered for model "Company".
Use mongoose.model(name, schema)
    at async Promise.all (index 7)
```

#### Cause:
The test script only imported `adminService.js`. The service uses `Job.find().populate('company')` to resolve company references. However, Mongoose's `populate()` needs the `Company` model's **schema to be registered** in memory before it can perform the join. Since `Company.js` was never `require`d anywhere in the script's import chain, Mongoose had no knowledge of that schema at runtime.

#### Rule:
> In any standalone Node.js script (outside of the Express server), **you must explicitly `require` every model whose schema is referenced by `populate()`**, even if you never call that model directly.

#### Fix:
Add the explicit `require` of the `Company` model at the top of the test script:
```javascript
const mongoose = require('mongoose');
// Explicitly register all schemas referenced via populate()
require('./src/models/Company');  // ← This was the missing line
const { getDashboardAnalytics } = require('./src/services/adminService');
```
After adding this line, Mongoose registers the `Company` schema in the model registry and `populate('company')` resolves correctly.
