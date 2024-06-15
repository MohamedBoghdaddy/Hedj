import Employee from '../model/employemodel.js';

export const createEmployee = async (req, res) => {
    try {
        const employeeData = new Employee(req.body);
        const savedEmployee = await employeeData.save();
        res.status(201).json({ msg: "Employee added successfully", employee: savedEmployee });
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
        const id = req.params.id;
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
