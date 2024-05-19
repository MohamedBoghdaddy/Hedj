import React, { useState, useEffect } from "react";
import "../../Styles/lists.css"
const EmployeeList = () => {
    const [employees, setEmployees] = useState(() => {
        const savedEmployees = localStorage.getItem('employees');
        return savedEmployees ? JSON.parse(savedEmployees) : [];
    });

    useEffect(() => {
        localStorage.setItem('employees', JSON.stringify(employees));
    }, [employees]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState({ index: null, show: false });
    
    // State variables for form validation
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [positionError, setPositionError] = useState('');

    const handleUpdate = (index) => {
        setShowUpdateForm({ index, show: true });
    };

    const handleDelete = (index) => {
        const updatedEmployees = [...employees];
        updatedEmployees.splice(index, 1);
        setEmployees(updatedEmployees);
    };

    const handleAdd = () => {
        setShowAddForm(true);
    };

    const handleAddSubmit = (newEmployee) => {
        if (!validateForm(newEmployee)) {
            return; // Do not submit if form is invalid
        }
        setEmployees([...employees, newEmployee]);
        setShowAddForm(false);
    };

    const handleUpdateSubmit = (index, updatedEmployee) => {
        if (!validateForm(updatedEmployee)) {
            return; // Do not submit if form is invalid
        }
        const updatedEmployees = [...employees];
        updatedEmployees[index] = updatedEmployee;
        setEmployees(updatedEmployees);
        setShowUpdateForm({ index: null, show: false });
    };

    const validateForm = (employee) => {
        let isValid = true;
        if (!employee.name.trim()) {
            setNameError('Name is required');
            isValid = false;
        } else {
            setNameError('');
        }
        if (!employee.email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else {
            setEmailError('');
        }
        if (!employee.position.trim()) {
            setPositionError('Position is required');
            isValid = false;
        } else {
            setPositionError('');
        }
        return isValid;
    };

    return (
        <div className="employeesList">
            <div className="listheader">
                <h3>Employees</h3>
                <button className="add" onClick={() => handleAdd()}>+ Add</button>
            </div>
            {showAddForm && (
                <EmployeeForm 
                    onSubmit={handleAddSubmit} 
                    onCancel={() => setShowAddForm(false)} 
                    nameError={nameError}
                    emailError={emailError}
                    positionError={positionError}
                />
            )}
            {showUpdateForm.show && (
                <EmployeeForm
                    employee={employees[showUpdateForm.index]}
                    onSubmit={(updatedEmployee) => handleUpdateSubmit(showUpdateForm.index, updatedEmployee)}
                    onCancel={() => setShowUpdateForm({ index: null, show: false })}
                    nameError={nameError}
                    emailError={emailError}
                    positionError={positionError}
                />
            )}
            <table className="listcontaineremp">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee, index) => (
                        <tr key={index}>
                            <td>{employee.name}</td>
                            <td className="emailemp">{employee.email}</td>
                            <td>{employee.position}</td>
                            <td>
                                <button className="button update" onClick={() => handleUpdate(index)}>Update</button>
                                <button className="button delete" onClick={() => handleDelete(index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EmployeeForm = ({ employee = { name: "", email: "", position: "" }, onSubmit, onCancel, nameError, emailError, positionError }) => {
    const [name, setName] = useState(employee.name);
    const [email, setEmail] = useState(employee.email);
    const [position, setPosition] = useState(employee.position);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, email, position });
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            {nameError && <span className="error">{nameError}</span>}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            {emailError && <span className="error">{emailError}</span>}
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" />
            {positionError && <span className="error">{positionError}</span>}
            <button type="submit">Submit</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default EmployeeList;
