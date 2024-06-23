import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../Styles/lists.css' 

const EmployeeList = () => {
    const [view, setView] = useState('list');
    const [employeeList, setEmployeeList] = useState([]);
    const [employee, setEmployee] = useState({ fname: "", lname: "", email: "", department: "", password: "", role: "readonly" });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (view === 'list') {
            fetchEmployeeList();
        }
    }, [view]);

    const fetchEmployeeList = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/getall');
            setEmployeeList(response.data);
        } catch (error) {
            console.error("Error fetching employee list:", error);
        }
    };

    const fetchEmployee = async (employeeId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/getone/${employeeId}`);
            setEmployee(response.data);
        } catch (error) {
            console.error("Error fetching employee:", error);
        }
    };

    const deleteEmployee = async (employeeId) => {
        try {
            await axios.delete(`http://localhost:8000/api/delete/${employeeId}`);
            toast.success('Employee deleted successfully', { position: "top-right" });
            fetchEmployeeList();
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const openForm = (employeeId = null) => {
        if (employeeId) {
            fetchEmployee(employeeId);
            setEditingId(employeeId);
        } else {
            setEmployee({ fname: "", lname: "", email: "", department: "", password: "", role: "readonly" });
            setEditingId(null);
        }
        setView('form');
    };

    const inputHandler = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting form with data:", employee);
        if (editingId) {
            try {
                const response = await axios.put(`http://localhost:8000/api/update/${editingId}`, employee);
                toast.success(response.data.msg, { position: "top-right" });
                setView('list');
            } catch (error) {
                console.error("Error updating employee:", error);
            }
        } else {
            try {
                const response = await axios.post("http://localhost:8000/api/create", employee);
                toast.success(response.data.msg, { position: "top-right" });
                setView('list');
            } catch (error) {
                console.error("Error creating employee:", error);
            }
        }
    };

    const renderEmployeeList = () => (
        <div className='employeetable' id='employe'>
            <button className='addbutton' onClick={() => openForm()}>Add Employee</button>
            <table border={1} cellPadding={10} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Employee name</th>
                        <th>Employee email</th>
                        <th>Department</th>
                        <th>Password</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeList.map((employee, index) => (
                        <tr key={employee._id}>
                            <td>{index + 1}</td>
                            <td className='nameeee'>{employee.fname} {employee.lname}</td>
                            <td className='emaillll'>{employee.email}</td>
                            <td>{employee.department}</td>
                            <td>{employee.password}</td>
                            <td>{employee.role}</td>
                            <td className='action'>
                                <button onClick={() => deleteEmployee(employee._id)}><i className="fa-solid fa-trash"></i></button>
                                <button onClick={() => openForm(employee._id)}><i className="fa-solid fa-pen-to-square"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderEmployeeForm = () => (
        <div>
            <button onClick={() => setView('list')}>Back</button>
            <h2>{editingId ? 'Update Employee' : 'Add New Employee'}</h2>
            <div className='form-box'>
                <form className='employee-form' onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <label htmlFor='fname'>First Name</label>
                        <input type="text" value={employee.fname} onChange={inputHandler} id='fname' name='fname' autoComplete='off' placeholder='First name' />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='lname'>Last Name</label>
                        <input type="text" value={employee.lname} onChange={inputHandler} id='lname' name='lname' autoComplete='off' placeholder='Last name' />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='email'>Email</label>
                        <input type="email" value={employee.email} onChange={inputHandler} id='email' name='email' autoComplete='off' placeholder='Email' />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='department'>Department</label>
                        <input type="text" value={employee.department} onChange={inputHandler} id='department' name='department' autoComplete='off' placeholder='Department' />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='password'>Password</label>
                        <input type="password" value={employee.password} onChange={inputHandler} id='password' name='password' autoComplete='off' placeholder='Password' />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='role'>Role</label>
                        <select id='role' name='role' value={employee.role} onChange={inputHandler}>
                            <option value="readonly">Readonly</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className='input-group'>
                        <button type='submit'>{editingId ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className='employeesList'>
            <h1 className='listheader'>Employee Management System</h1>
            {view === 'list' ? renderEmployeeList() : renderEmployeeForm()}
        </div>
    );
}

export default EmployeeList;
