import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';


const EmployeeList = () => {
    const [view, setView] = useState('list');
    const [employeeList, setEmployeeList] = useState([]);
    const [employee, setEmployee] = useState({ fname: "", lname: "", email: "", department: "" });
    const [editEmployeeId, setEditEmployeeId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const response = await axios.get("http://localhost:8000/api/getall");
        setEmployeeList(response.data);
    };

    const inputHandler = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    const addEmployee = async (e) => {
        e.preventDefault();
        await axios.post("http://localhost:8000/api/create", employee)
            .then((response) => {
                toast.success(response.data.msg, { position: "top-right" });
                setView('list');
                fetchEmployees();
            })
            .catch(error => console.log(error));
    };

    const editEmployee = async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:8000/api/update/${editEmployeeId}`, employee)
            .then((response) => {
                toast.success(response.data.msg, { position: "top-right" });
                setView('list');
                fetchEmployees();
            })
            .catch(error => console.log(error));
    };

    const deleteEmployee = async (employeeId) => {
        await axios.delete(`http://localhost:8000/api/delete/${employeeId}`)
            .then((response) => {
                setEmployeeList(prevEmployee => prevEmployee.filter(employee => employee._id !== employeeId));
                toast.success(response.data.msg, { position: 'top-right' });
            })
            .catch(error => console.log(error));
    };

    const startEditEmployee = async (employeeId) => {
        const response = await axios.get(`http://localhost:8000/api/getone/${employeeId}`);
        setEmployee(response.data);
        setEditEmployeeId(employeeId);
        setView('edit');
    };

    const renderEmployeeList = () => (
        <div className='employeetable'>
            <button className='addbutton' onClick={() => setView('add')}> Add Employee</button>
            <table border={1} cellPadding={10} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Employee name</th>
                        <th>Employee email</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeList.map((employee, index) => (
                        <tr key={employee._id}>
                            <td>{index + 1}</td>
                            <td>{employee.fname} {employee.lname}</td>
                            <td>{employee.email}</td>
                            <td className='action'>
                                <button onClick={() => deleteEmployee(employee._id)}><i className="fa-solid fa-trash"></i></button>
                                <button onClick={() => startEditEmployee(employee._id)}><i className="fa-solid fa-pen-to-square"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderAddEmployee = () => (
        <div className='add'>
            <button onClick={() => setView('list')}>Back</button>
            <h2>Add new employee</h2>
            <form className='addemployeeform' onSubmit={addEmployee}>
                <div className='inputgroup'>
                    <label htmlFor='fname'>First Name</label>
                    <input type="text" onChange={inputHandler} id='fname' name='fname' autoComplete='off' placeholder='First name' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='lname'>Last Name</label>
                    <input type="text" onChange={inputHandler} id='lname' name='lname' autoComplete='off' placeholder='Last name' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='email'>Email</label>
                    <input type="email" onChange={inputHandler} id='email' name='email' autoComplete='off' placeholder='Email' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='password'>Department</label>
                    <input type="password" onChange={inputHandler} id='password' name='password' autoComplete='off' placeholder='department' />
                </div>
                <div className='inputgroup'>
                    <button type='submit'>ADD EMPLOYEE</button>
                </div>
            </form>
        </div>
    );

    const renderEditEmployee = () => (
        <div className='add'>
            <button onClick={() => setView('list')}>Back</button>
            <h2>Update employee</h2>
            <form className='addemployeeform' onSubmit={editEmployee}>
                <div className='inputgroup'>
                    <label htmlFor='fname'>First Name</label>
                    <input type="text" value={employee.fname} onChange={inputHandler} id='fname' name='fname' autoComplete='off' placeholder='First name' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='lname'>Last Name</label>
                    <input type="text" value={employee.lname} onChange={inputHandler} id='lname' name='lname' autoComplete='off' placeholder='Last name' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='email'>Email</label>
                    <input type="text" value={employee.email} onChange={inputHandler} id='email' name='email' autoComplete='off' placeholder='Email' />
                </div>
                <div className='inputgroup'>
                    <button type='submit'>UPDATE EMPLOYEE</button>
                </div>
            </form>
        </div>
    );

    return (
        <div>
            {view === 'list' && renderEmployeeList()}
            {view === 'add' && renderAddEmployee()}
            {view === 'edit' && renderEditEmployee()}
        </div>
    );
};

export default EmployeeList;
