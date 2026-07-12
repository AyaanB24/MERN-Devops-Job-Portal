import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// JobCard — Presentational component. Receives one job object as a prop.
// Rendered by JobListPage in a grid. Clicking navigates to /jobs/:id.
//
// Job shape (from backend Job model):
//   { _id, title, location, salary, jobType, experience, skills,
//     company: { companyName }, createdAt }
// ─────────────────────────────────────────────────────────────────────────────

// Map jobType values to Tailwind badge colors
const JOB_TYPE_COLORS = {
  'Full-time': 'bg-green-100 text-green-700',
  'Part-time': 'bg-yellow-100 text-yellow-700',
  Contract: 'bg-blue-100 text-blue-700',
  Internship: 'bg-purple-100 text-purple-700',
  Remote: 'bg-cyan-100 text-cyan-700',
};

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

  const badgeClass = JOB_TYPE_COLORS[jobType] || 'bg-gray-100 text-gray-600';

  const postedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      to={`/jobs/${_id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{company?.companyName || 'Company'}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
          {jobType}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          📍 {location}
        </span>
        <span className="flex items-center gap-1">
          💼 {experience}
        </span>
        <span className="flex items-center gap-1">
          💰 ₹{salary?.toLocaleString('en-IN')}/yr
        </span>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-xs text-gray-400">+{skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">Posted {postedDate}</span>
        <span className="text-xs font-medium text-indigo-600 group-hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
