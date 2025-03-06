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

export default verifyToken;
