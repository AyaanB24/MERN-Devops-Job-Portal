/**
 * Middleware to restrict access to routes based on user roles (Role-Based Access Control).
 * This middleware MUST be placed after the authentication middleware (`protect`), 
 * as it relies on `req.user` being populated.
 *
 * @param {...string} allowedRoles - The roles permitted to access this route (e.g., 'candidate', 'recruiter', 'admin')
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if the user object is attached to the request (set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, login required',
      });
    }

    // 2. Check if the user's role matches any of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource`,
      });
    }

    // 3. Authorized, pass execution to the next handler
    return next();
  };
};

module.exports = {
  authorize,
};
