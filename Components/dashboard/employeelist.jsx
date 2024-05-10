import React, { useState, useEffect } from "react";
import "../../Styles/lists.css";

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
        setEmployees([...employees, newEmployee]);
        setShowAddForm(false);
    };

    const handleUpdateSubmit = (index, updatedEmployee) => {
        const updatedEmployees = [...employees];
        updatedEmployees[index] = updatedEmployee;
        setEmployees(updatedEmployees);
        setShowUpdateForm({ index: null, show: false });
    };

    return (
        <div className="employeesList">
            <div className="listheader">
                <h3>Employees</h3>
                <button className="add" onClick={() => handleAdd()}>+ Add</button>
            </div>
            {showAddForm && (
                <EmployeeForm onSubmit={handleAddSubmit} onCancel={() => setShowAddForm(false)} />
            )}
            {showUpdateForm.show && (
                <EmployeeForm
                    employee={employees[showUpdateForm.index]}
                    onSubmit={(updatedEmployee) => handleUpdateSubmit(showUpdateForm.index, updatedEmployee)}
                    onCancel={() => setShowUpdateForm({ index: null, show: false })}
                />
            )}
            <div className="listcontainer">
                <div className="list122">
                    <div className="detailss">
                        <h3>Name</h3>
                    </div>
                    <div className="detailss">
                        <h3>Email</h3>
                    </div>
                    <div className="detailss">
                        <h3>Position</h3>
                    </div>
                    <div className="detailss">
                        <h3>Actions</h3>
                    </div>
                </div>
                {employees.map((employee, index) => (
                    <div className="list111" key={index}>
                        <div className="details">
                            <h3>{employee.name}</h3>
                        </div>
                        <span className="email">{employee.email}</span>
                        <span className="pos">{employee.position}</span>
                        <div className="actions">
                            <button className="button update" onClick={() => handleUpdate(index)}>Update</button>
                            <button className="button delete" onClick={() => handleDelete(index)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmployeeForm = ({ employee = { name: "", email: "", position: "" }, onSubmit, onCancel }) => {
    const [name, setName] = useState(employee.name);
    const [email, setEmail] = useState(employee.email);
    const [position, setPosition] = useState(employee.position);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, email, position });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" />
            <button type="submit">Submit</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default EmployeeList;
