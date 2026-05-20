import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { performance } from "node:perf_hooks";
import User from "../model/usermodel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "hedj-demo-jwt-secret";
const isProduction = process.env.NODE_ENV === "production";
const DEBUG_AUTH_TIMING = process.env.DEBUG_AUTH_TIMING === "true";
const USER_ROLES = ["customer", "employee", "admin"];

const startAuthTimer = (label) => {
  if (!DEBUG_AUTH_TIMING) return () => {};
  const startedAt = performance.now();
  return () => {
    const elapsedMs = performance.now() - startedAt;
    console.info(`${label}: ${elapsedMs.toFixed(1)}ms`);
  };
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const requireAuthDatabase = (res) => {
  if (isDatabaseReady()) return true;

  res.status(503).json({
    success: false,
    message: "Authentication database is unavailable. Please try again later.",
  });
  return false;
};

const publicUserFields = "-password -__v";

const toPublicUser = (user) => ({
  _id: user._id,
  id: user._id,
  name:
    [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || user.username,
  username: user.username,
  email: user.email,
  role: user.role,
  gender: user.gender,
  firstName: user.firstName,
  middleName: user.middleName,
  lastName: user.lastName,
  department: user.department,
  receiveNotifications: user.receiveNotifications,
  profilePhoto: user.profilePhoto,
  profilePhotoUrl: user.profilePhotoUrl,
  profilePhotoAssetId: user.profilePhotoAssetId,
  jobTitle: user.jobTitle,
  seniorityLevel: user.seniorityLevel,
  phone: user.phone,
  status: user.status,
  invitedAt: user.invitedAt,
  invitationEmailStatus: user.invitationEmailStatus,
  invitationEmailOutboxId: user.invitationEmailOutboxId,
  employeeId: user.employeeId || null,
  managerId: user.managerId || null,
  permissions: user.permissions || [],
  deniedPermissions: user.deniedPermissions || [],
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getTokenFromRequest = (req) => {
  const authHeader = req.header("Authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return req.cookies?.token || headerToken;
};

const getRequestedUserId = (req) => req.params.id || req.params.userId;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 30,
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, authCookieOptions);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

export const upload = multer({ storage });

export const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    middleName,
    lastName,
    gender,
  } = req.body;

  if (!username || !email || !password || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!requireAuthDatabase(res)) return;

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existingUser) {
      const message =
        existingUser.email === normalizedEmail
          ? "Email already in use"
          : "Username already in use";
      return res.status(400).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      middleName,
      lastName,
      gender,
    });
    await user.save();

    const token = createToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const endTotalTimer = startAuthTimer("login-total");
  res.on("finish", endTotalTimer);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (!requireAuthDatabase(res)) return;

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    let user;
    const endFindTimer = startAuthTimer("login-db-user-find");
    try {
      user = await User.findOne({ email: normalizedEmail });
    } finally {
      endFindTimer();
    }
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    let isMatch;
    const endBcryptTimer = startAuthTimer("login-bcrypt-compare");
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } finally {
      endBcryptTimer();
    }
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const endJwtTimer = startAuthTimer("login-jwt-sign");
    const token = createToken(user);
    endJwtTimer();
    setAuthCookie(res, token);
    res.status(200).json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

export const getAllUsers = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  try {
    const users = await User.find().select(publicUserFields).sort({ createdAt: -1 });
    res.status(200).json(users.map(toPublicUser));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUser = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  const userId = getRequestedUserId(req);
  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  try {
    const user = await User.findById(userId).select(publicUserFields);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({ success: true, user: toPublicUser(user) });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  try {
    const userId = getRequestedUserId(req);
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select(publicUserFields);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({
        message: "User updated successfully",
        user: toPublicUser(updatedUser),
      });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  try {
    const userId = getRequestedUserId(req);
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).select(publicUserFields);
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users.map(toPublicUser));
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkAuth = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select(publicUserFields);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const getUsersByRole = async (req, res) => {
  if (!requireAuthDatabase(res)) return;

  try {
    const { role } = req.query;
    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select(publicUserFields)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users: users.map(toPublicUser) });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
