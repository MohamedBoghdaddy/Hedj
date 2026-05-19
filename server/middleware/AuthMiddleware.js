import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../model/usermodel.js";
import Employee from "../model/employeemodel.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hedj-demo-jwt-secret";

const getTokenFromRequest = (req) => {
  const authHeader = req.header("Authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return req.cookies?.token || headerToken;
};

const requireDatabase = (res) => {
  if (mongoose.connection.readyState === 1) return true;

  res.status(503).json({
    success: false,
    message: "Authentication database is unavailable. Please try again later.",
  });
  return false;
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password -__v");
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication.",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized access." });
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -__v");

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Users only.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Forbidden access." });
  }
};

export const verifyAdminOrEmployee = async (req, res, next) => {
  try {
    if (!requireDatabase(res)) return;

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const employee = await Employee.findById(decoded.id).select("-password -__v");

    if (
      !employee ||
      (employee.role !== "admin" && employee.role !== "readonly")
    ) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Admins and employees only.",
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Forbidden." });
  }
};
