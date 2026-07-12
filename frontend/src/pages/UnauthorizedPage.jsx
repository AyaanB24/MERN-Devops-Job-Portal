const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
    <h1 className="text-6xl font-bold text-gray-200">403</h1>
    <p className="mt-4 text-lg">You don&apos;t have access to this page.</p>
    <a href="/" className="mt-6 text-indigo-600 hover:underline text-sm">Go home</a>
  </div>
);
export default UnauthorizedPage;
