import jwt from "jsonwebtoken";

/**
 * @desc Verify JWT token
 * @usage Protect routes that require login
 */
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * @desc Allow only Admins or Workers
 * @usage Protect admin routes
 */
export const requireAdmin = (req, res, next) => {
  if (!["admin", "worker"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin/Worker only" });
  }
  next();
};

/**
 * @desc Allow only Customers
 * @usage Protect customer routes (optional)
 */
export const requireCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Customer access only" });
  }
  next();
};
