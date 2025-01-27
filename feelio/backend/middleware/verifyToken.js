const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json("Token is not valid!");
      }

      console.log("Decoded token:", decoded); // Log the decoded token for debugging
      req.user = { id: decoded.userId }; // Ensure `userId` is stored in `req.user.id`
      next();
    });
  } else {
    console.error("Authorization header not found");
    return res.status(401).json("You are not authenticated");
  }
};

module.exports = verifyToken;
