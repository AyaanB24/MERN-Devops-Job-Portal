/**
 * @file asyncHandler.js
 * @description Utility wrapper that automatically catches errors thrown by
 * async route handlers and forwards them to Express's centralized error handler.
 *
 * WHY ASYNC CONTROLLERS CRASH WITHOUT PROPER HANDLING:
 * ──────────────────────────────────────────────────────
 * Express was designed before async/await existed. It only catches synchronous
 * errors thrown inside route handlers automatically. When an async function
 * throws (or a rejected Promise goes uncaught), Express does NOT intercept it —
 * the error propagates as an unhandled Promise rejection, which:
 *   1. Leaves the HTTP request hanging (no response sent to the client).
 *   2. In Node 15+, crashes the entire process with an UnhandledPromiseRejection.
 *   3. Bypasses the centralized errorHandler middleware entirely.
 *
 * Example of the crash scenario:
 *
 *   // ❌ No try-catch — if User.findById() rejects, Express never knows.
 *   const getUser = async (req, res) => {
 *     const user = await User.findById(req.params.id); // throws → unhandled rejection
 *     res.json(user);
 *   };
 *
 * HOW asyncHandler WORKS INTERNALLY:
 * ─────────────────────────────────────
 * asyncHandler is a higher-order function — it accepts a function (fn) and
 * returns a NEW function that Express registers as the route handler.
 *
 * When the route is hit:
 *   1. The returned function calls fn(req, res, next) and wraps the result
 *      in Promise.resolve() to handle both sync throws and async rejections.
 *   2. If the promise rejects for any reason, .catch(next) automatically
 *      calls next(err), which hands the error to errorHandler.
 *   3. Controllers can now be written without any try-catch boilerplate.
 *
 * Internally equivalent to:
 *
 *   const getUser = async (req, res, next) => {
 *     try {
 *       const user = await User.findById(req.params.id);
 *       res.json(user);
 *     } catch (err) {
 *       next(err); // ← asyncHandler does this automatically
 *     }
 *   };
 */

/**
 * asyncHandler
 *
 * Wraps an async Express route handler so that any thrown error or rejected
 * promise is automatically forwarded to the next error-handling middleware
 * (errorHandler) via next(err).
 *
 * Usage:
 *   router.get('/jobs', asyncHandler(async (req, res) => {
 *     const jobs = await Job.find();
 *     res.json({ success: true, data: jobs });
 *   }));
 *
 * @param   {Function} fn - An async Express route handler (req, res, next) => Promise
 * @returns {Function}    - A standard Express middleware function with error forwarding
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
