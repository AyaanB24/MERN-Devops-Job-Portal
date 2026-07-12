import { Link } from 'react-router-dom';
import { JOB_TYPE_COLORS } from '../../config/constants';
import { formatSalaryShort } from '../../utils/formatSalary';
import { formatRelativeDate } from '../../utils/formatDate';

// ─────────────────────────────────────────────────────────────────────────────
// JobCard — Presentational component. Receives one job object as a prop.
// ─────────────────────────────────────────────────────────────────────────────

const JobCard = ({ job }) => {
  const {
    _id,
    title,
    location,
    salary,
    jobType,
    experience,
    skills = [],
    company,
    createdAt,
  } = job;

  const badgeClass = JOB_TYPE_COLORS[jobType] || 'bg-slate-100 text-slate-700';

  return (
    <Link
      to={`/jobs/${_id}`}
      className="block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{company?.companyName || 'Company'}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
          {jobType}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {location}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z" />
          </svg>
          {experience}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M12 3v3m6-3v9m-9 0V9.75C9 9.336 8.664 9 8.25 9H6.75c-.414 0-.75.336-.75.75v6c0 .414.336.75.75.75h1.5c.414 0 .75-.336.75-.75V9z" />
          </svg>
          {formatSalaryShort(salary)}
        </span>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-xs text-slate-400">+{skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">Posted {formatRelativeDate(createdAt)}</span>
        <span className="text-xs font-medium text-blue-600 group-hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
