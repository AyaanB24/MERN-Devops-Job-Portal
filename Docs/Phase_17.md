# Phase 17 — Public Job Portal

## What Was Built

| File | Purpose |
|---|---|
| `services/jobApi.js` | Two API functions → `GET /api/jobs` and `GET /api/jobs/:id` |
| `features/jobs/jobService.js` | Strips empty filters, builds clean query params |
| `features/jobs/jobSlice.js` | Redux slice — job list, detail, filters, pagination |
| `store/rootReducer.js` | Registered `jobReducer` |
| `features/jobs/JobCard.jsx` | Presentational card — renders one job, links to detail |
| `features/jobs/JobFilters.jsx` | Search + jobType + location filter panel |
| `features/jobs/JobListPage.jsx` | Main listing page — grid + filters + pagination |
| `features/jobs/JobDetailPage.jsx` | Full job detail — description, skills, apply CTA |
| `pages/HomePage.jsx` | Marketing landing page with hero, stats, features |
| `routes/index.jsx` | Wired `/jobs` and `/jobs/:id` as public routes |

---

## Architecture Decisions

**Three-layer API flow** — `jobSlice thunk → jobService → jobApi → apiClient`. Each layer has one job. Adding a sort param = edit only `jobService.js`.

**Filters in Redux, form in local state** — Keyword input uses local `useState` to avoid an API call on every keystroke. Filters are committed to Redux (and API fired) only on form submit or Enter. This means navigating back to `/jobs` from a detail page restores your exact search.

**`clearCurrentJob` on unmount** — Prevents stale data from flashing when navigating between two different job detail pages.

**`JobCard` is purely presentational** — Zero Redux, zero API calls. Receives one `job` prop. Independently testable.

---

## Data Flow

```
/jobs route loads
  → JobListPage mounts → dispatch(fetchJobsList())
    → jobService.getJobs() strips empty filters
      → jobApi.fetchJobs({ page: 1 })
        → GET /api/jobs?page=1
          → { data: Job[], pagination: { page, totalPages } }
            → jobSlice.jobs populated → JobCard grid renders

User types keyword → submits
  → setFilter({ key: 'keyword', value: 'react' }) + dispatch(fetchJobsList())
    → GET /api/jobs?keyword=react&page=1

User clicks JobCard
  → navigate to /jobs/:id
    → JobDetailPage mounts → dispatch(fetchJobDetail(id))
      → GET /api/jobs/:id
        → { data: Job with company populated }

User leaves detail page
  → clearCurrentJob() dispatched → Redux cleared
```

---

## Steps to Test

### 1. Visit the home page
- Go to `http://localhost:5173`
- Verify hero, stats bar, feature cards, and CTA render

### 2. Browse Jobs
- Click "Browse Jobs" → `/jobs`
- Verify skeleton loaders appear briefly, then job cards render
- Check Redux DevTools: `jobs.jobs[]` populated, `jobs.listStatus: 'succeeded'`

### 3. Test Search & Filters
| Action | Expected |
|---|---|
| Type keyword → press Enter | Jobs re-fetched with `?keyword=...` |
| Select a Job Type | Immediate re-fetch with `?jobType=...` |
| Type location → press Enter | Re-fetch with `?location=...` |
| Click "Clear Filters" | All filters reset, full list reloaded |

### 4. Pagination
- If more than 10 jobs exist, pagination buttons appear
- Clicking a page number scrolls to top and loads correct page
- Check `pagination.currentPage` in Redux DevTools

### 5. Job Detail
- Click any job card → `/jobs/:id`
- Verify title, salary, location, experience, skills, description render
- Company card shows name, description, website
- **Without login:** "Sign in to Apply" button visible
- **As candidate:** "Apply Now" button visible

### 6. Apply CTA (Auth-aware)
| Auth State | Expected on Detail Page |
|---|---|
| Guest | "Sign in to Apply" + "Create Account" buttons |
| Logged in as candidate | "Apply Now" button |
| Logged in as recruiter | "Sign in to Apply" (candidates only apply) |
