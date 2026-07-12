// ─────────────────────────────────────────────────────────────────────────────
// Salary formatting utilities (Indian numbering system)
// ─────────────────────────────────────────────────────────────────────────────

export const formatSalary = (salary) => {
  if (!salary && salary !== 0) return 'Not disclosed';
  return `₹${salary.toLocaleString('en-IN')}`;
};

export const formatSalaryShort = (salary) => {
  if (!salary && salary !== 0) return 'Not disclosed';
  if (salary >= 10000000) return `₹${(salary / 10000000).toFixed(1)}Cr`;
  if (salary >= 100000) return `₹${(salary / 100000).toFixed(1)}L`;
  return `₹${salary.toLocaleString('en-IN')}`;
};
