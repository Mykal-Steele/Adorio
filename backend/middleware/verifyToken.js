import jwt from "jsonwebtoken";

// my auth middleware to check if the token is valid
// this was a pain to debug but finally got it working
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // gotta split the bearer token format to get just the actual token
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // if jwt validation fails just kick them out
        return res.status(403).json({ message: "Token is not valid!" });
      }
      req.user = { id: decoded.userId }; // attach the user id so we can use it in other routes
      next();
    });
  } else {
    // no auth header = unauthorized, pretty straightforward
    return res.status(401).json({ message: "You are not authenticated!" });
  }
};

// Optional middleware that allows requests to proceed even without auth
const optional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Try to verify the token but don't block the request if it fails
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
    } catch (error) {
      // Just log the error but don't block the request
      console.error("Token verification failed, proceeding as guest:", error);
    }
  }

  // Continue regardless of whether a valid token exists
  next();
};

// Admin middleware - checks if the user is an admin after verification
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// Set up aliases for the names that gameRoutes.js might be expecting
const protect = verifyToken;

export default verifyToken;
export { verifyToken, protect, admin, optional };
