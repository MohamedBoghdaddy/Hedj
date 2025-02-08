import jwt from "jsonwebtoken";
import User from "../model/usermodel.js";
import Employee from "../model/employeemodel.js";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user)
      return res.status(401).json({ message: "Invalid authentication." });

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized access." });
  }
};

// ✅ Middleware to check if user is a regular user (not an admin or employee)
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(403).json({ message: "Access forbidden. Users only." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden access." });
  }
};

// ✅ Middleware to check if user is an admin or employee
export const verifyAdminOrEmployee = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const employee = await Employee.findById(decoded.id).select("-password");

    if (
      !employee ||
      (employee.role !== "admin" && employee.role !== "readonly")
    ) {
      return res
        .status(403)
        .json({ message: "Access forbidden. Admins and employees only." });
    }

    req.employee = employee;
    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden." });
  }
};
