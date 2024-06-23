import Employee from '../model/employemodel.js';

export const createEmployee = async (req, res) => {
    try {
        const { role, email } = req.body;

        // Check if there are already two admins
        if (role === 'admin') {
            const adminCount = await Employee.countDocuments({ role: 'admin' });
            if (adminCount >= 2) {
                return res.status(400).json({ error: "There can only be two admins" });
            }
        }

        const employeeData = new Employee(req.body);
        
        try {
            const savedEmployee = await employeeData.save();
            res.status(201).json({ msg: "Employee added successfully", employee: savedEmployee });
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                return res.status(400).json({ error: "Email must be unique" });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ msg: "Employee not found" });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role === 'admin') {
            const adminCount = await Employee.countDocuments({ role: 'admin' });
            const currentEmployee = await Employee.findById(id);
            if (adminCount >= 2 && currentEmployee.role !== 'admin') {
                return res.status(400).json({ error: "There can only be two admins" });
            }
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEmployee) {
            return res.status(404).json({ msg: "Employee not found" });
        }
        res.status(200).json({ msg: "Employee updated successfully", employee: updatedEmployee });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) {
            return res.status(404).json({ msg: "Employee not found" });
        }
        res.status(200).json({ msg: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// employeecontroller.js

export const getLastAdmins = async (req, res) => {
    try {
        const admins = await Employee.find({ role: 'admin' }).sort({ _id: -1 }).limit(2).select('fname lname');
        if (!admins || admins.length === 0) {
            return res.status(404).json({ msg: "No admins found" });
        }
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

