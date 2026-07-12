const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 px-4">
    <h1 className="text-6xl font-bold text-slate-200">403</h1>
    <p className="mt-4 text-lg font-medium text-slate-600">Access denied</p>
    <p className="mt-1 text-sm text-slate-400">You don't have permission to access this page.</p>
    <a href="/" className="mt-6 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
      Go home
    </a>
  </div>
);
export default UnauthorizedPage;
