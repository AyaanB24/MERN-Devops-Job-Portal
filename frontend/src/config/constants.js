// ─────────────────────────────────────────────────────────────────────────────
// Application Constants
// Centralized enums and config values used across the app.
// ─────────────────────────────────────────────────────────────────────────────

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export const EXPERIENCE_LEVELS = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'];

export const USER_ROLES = ['candidate', 'recruiter', 'admin'];

export const ROLE_DASHBOARD = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const DEFAULT_PAGE_SIZE = 10;

export const RESUME_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const JOB_TYPE_COLORS = {
  'Full-time': 'bg-emerald-100 text-emerald-700',
  'Part-time': 'bg-amber-100 text-amber-700',
  Contract: 'bg-blue-100 text-blue-700',
  Internship: 'bg-purple-100 text-purple-700',
  Remote: 'bg-cyan-100 text-cyan-700',
};

export const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export const ROLE_COLORS = {
  candidate: 'bg-emerald-100 text-emerald-700',
  recruiter: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
};
