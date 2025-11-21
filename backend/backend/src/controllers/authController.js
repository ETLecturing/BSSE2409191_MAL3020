import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @desc Register a new user (customer, admin, worker)
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: role || "customer", // default role = customer
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ error: "Server error while registering" });
  }
};

/**
 * @desc Login user & return JWT token
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "Invalid email or password" });

    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: "Invalid email or password" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Server error while logging in" });
  }
};

/**
 * @desc Get logged-in user's profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    // Fetch user from DB using ID from JWT
    const user = await User.findById(req.user.id).select("name email role");

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};
