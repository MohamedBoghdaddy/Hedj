// Employee Controller
import Employee from "../model/employeemodel.js";
import bcrypt from "bcrypt";

export const createEmployee = async (req, res) => {
  try {
    const { fname, lname, email, department, password, role } = req.body;
    if (!fname || !lname || !email || !department || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (role === "admin") {
      const adminCount = await Employee.countDocuments({ role: "admin" });
      if (adminCount >= 2) {
        return res.status(400).json({ error: "There can only be two admins" });
      }
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee)
      return res.status(400).json({ error: "Email must be unique" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = new Employee({
      fname,
      lname,
      email,
      department,
      password: hashedPassword,
      role,
    });
    await employee.save();

    res.status(201).json({ msg: "Employee added successfully", employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.role === "admin") {
      const adminCount = await Employee.countDocuments({ role: "admin" });
      const currentEmployee = await Employee.findById(id);
      if (adminCount >= 2 && currentEmployee.role !== "admin") {
        return res.status(400).json({ error: "Maximum admin limit reached" });
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");
    if (!updatedEmployee)
      return res.status(404).json({ msg: "Employee not found" });
    res
      .status(200)
      .json({
        msg: "Employee updated successfully",
        employee: updatedEmployee,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.status(200).json({ msg: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLastAdmins = async (req, res) => {
  try {
    const admins = await Employee.find({ role: "admin" })
      .sort({ createdAt: -1 })
      .limit(2)
      .select("fname lname");
    if (!admins.length) return res.status(404).json({ msg: "No admins found" });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
