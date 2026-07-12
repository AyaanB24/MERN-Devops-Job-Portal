const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 px-4">
    <h1 className="text-6xl font-bold text-slate-200">404</h1>
    <p className="mt-4 text-lg font-medium text-slate-600">Page not found</p>
    <p className="mt-1 text-sm text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" className="mt-6 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
      Go home
    </a>
  </div>
);
export default NotFoundPage;
