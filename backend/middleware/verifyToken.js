import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid!" });
      }
      req.user = { id: decoded.userId }; // Attach user ID to the request
      next();
    });
  } else {
    return res.status(401).json({ message: "You are not authenticated!" });
  }
};

export default verifyToken;
