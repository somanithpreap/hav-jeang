import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
<<<<<<< HEAD
    
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
=======
    const decoded = jwt.verify(token, JWT_SECRET);
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
    req.user = decoded; // { id, usertype }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
