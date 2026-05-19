import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import Employee from "../model/employeemodel.js";

const publicFields = "-password -__v";
const roles = ["readonly", "admin"];
const statuses = ["active", "inactive", "invited", "suspended"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const toEmployeePayload = (body, { partial = false } = {}) => {
  const allowed = [
    "fname",
    "lname",
    "email",
    "department",
    "jobTitle",
    "seniorityLevel",
    "phone",
    "role",
    "status",
  ];
  const payload = {};

  allowed.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  });

  if (payload.email) payload.email = payload.email.toLowerCase();
  if (!partial && !body.password) payload.password = crypto.randomBytes(16).toString("hex");
  if (body.password) payload.password = body.password;

  return payload;
};

const validateEmployeePayload = (payload, { partial = false } = {}) => {
  if (!partial) {
    const missing = ["fname", "lname", "email", "department"].filter(
      (field) => !payload[field]
    );
    if (missing.length) return `${missing.join(", ")} required.`;
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "A valid email is required.";
  }
  if (payload.role && !roles.includes(payload.role)) return "Invalid employee role.";
  if (payload.status && !statuses.includes(payload.status)) return "Invalid employee status.";

  return null;
};

const handleDuplicate = (error, res) => {
  if (error?.code !== 11000) return false;
  res.status(409).json({ success: false, message: "Employee email must be unique." });
  return true;
};

export const listEmployees = async (req, res) => {
  const { status, q, department } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (department) filter.department = new RegExp(`^${String(department).trim()}$`, "i");
  if (q) {
    filter.$or = [
      { fname: new RegExp(String(q), "i") },
      { lname: new RegExp(String(q), "i") },
      { email: new RegExp(String(q), "i") },
      { department: new RegExp(String(q), "i") },
      { jobTitle: new RegExp(String(q), "i") },
    ];
  }

  const employees = await Employee.find(filter).select(publicFields).sort({ createdAt: -1 });
  return res.json({ success: true, count: employees.length, employees });
};

export const getEmployeeById = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid employee id." });
  }

  const employee = await Employee.findById(req.params.id).select(publicFields);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
  return res.json({ success: true, employee });
};

export const createEmployee = async (req, res) => {
  try {
    const payload = toEmployeePayload(req.body);
    const validationError = validateEmployeePayload(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (payload.role === "admin") {
      const adminCount = await Employee.countDocuments({ role: "admin", status: { $ne: "inactive" } });
      if (adminCount >= 2) {
        return res.status(400).json({ success: false, message: "There can only be two active admins." });
      }
    }

    const employee = await Employee.create(payload);
    const safeEmployee = await Employee.findById(employee._id).select(publicFields);
    return res.status(201).json({ success: true, employee: safeEmployee });
  } catch (error) {
    if (handleDuplicate(error, res)) return;
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid employee id." });
  }

  try {
    const payload = toEmployeePayload(req.body, { partial: true });
    const validationError = validateEmployeePayload(payload, { partial: true });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (payload.role === "admin") {
      const currentEmployee = await Employee.findById(req.params.id);
      const adminCount = await Employee.countDocuments({ role: "admin", status: { $ne: "inactive" } });
      if (adminCount >= 2 && currentEmployee?.role !== "admin") {
        return res.status(400).json({ success: false, message: "Maximum admin limit reached." });
      }
    }

    if (payload.password) payload.password = await bcrypt.hash(payload.password, 10);
    const employee = await Employee.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select(publicFields);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

    return res.json({ success: true, employee });
  } catch (error) {
    if (handleDuplicate(error, res)) return;
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateEmployee = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid employee id." });
  }

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: "inactive" },
    { new: true }
  ).select(publicFields);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
  return res.json({ success: true, employee, message: "Employee deactivated." });
};
