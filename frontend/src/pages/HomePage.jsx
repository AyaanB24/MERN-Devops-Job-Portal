const HomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <h1 className="text-4xl font-bold text-indigo-600">Job Portal</h1>
    <p className="mt-3 text-gray-500">Find your next opportunity.</p>
    <div className="mt-6 flex gap-4">
      <a href="/login" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">Sign in</a>
      <a href="/register" className="px-5 py-2.5 rounded-lg border border-indigo-600 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition">Register</a>
    </div>
  </div>
);
export default HomePage;
