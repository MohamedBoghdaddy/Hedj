import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';


const AddUser = ({ setUsers }) => {
    const users = {
        fname: "",
        lname: "",
        email: "",
        password: ""
    };

    const [User, setUser] = useState(users);
    const navigate = useNavigate();

    const inputHandler = (e) => {
        const { name, value } = e.target;
        setUser({ ...User, [name]: value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/api/create", User);
            toast.success(response.data.msg, { position: "top-right" });
            setUsers(prevUsers => [...prevUsers, response.data.user]);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='add'>
            <Link to="/">Back</Link>
            <h2>Add new user</h2>
            <form className='adduserform' onSubmit={submitForm}>
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
                    <label htmlFor='password'>Password</label>
                    <input type="password" onChange={inputHandler} id='password' name='password' autoComplete='off' placeholder='Password' />
                </div>
                <div className='inputgroup'>
                    <button type='submit'>ADD USER</button>
                </div>
            </form>
        </div>
    );
};

const UserList = ({ users, setUsers }) => {
    const deleteUser = async (userId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/delete/${userId}`);
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            toast.success(response.data.msg, { position: 'top-right' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='usertable'>
            <Link to="/add" className='addbutton'>Add User</Link>
            <table border={1} cellPadding={10} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Employee Name</th>
                        <th>Employee Email</th>
                        <th>Employee position</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.fname} {user.lname}</td>
                            <td>{user.email}</td>
                            <td className='action'>
                                <button onClick={() => deleteUser(user._id)}><i className="fa-solid fa-trash"></i></button>
                                <Link to={'/edit/' + user._id}><i className="fa-solid fa-pen-to-square"></i></Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EditUser = ({ setUsers }) => {
    const users = {
        fname: "",
        lname: "",
        email: ""
    };

    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(users);

    const inputChangeHandler = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/getone/${id}`);
                setUser(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, [id]);

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:8000/api/update/${id}`, user);
            toast.success(response.data.msg, { position: "top-right" });
            setUsers(prevUsers => prevUsers.map(u => u._id === id ? response.data.user : u));
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='add'>
            <Link to="/">Back</Link>
            <h2>Update user</h2>
            <form className='adduserform' onSubmit={submitForm}>
                <div className='inputgroup'>
                    <label htmlFor='fname'>First Name</label>
                    <input type="text" value={user.fname} onChange={inputChangeHandler} id='fname' name='fname' autoComplete='off' placeholder='First name' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='lname'>Last Name</label>
                    <input type="text" value={user.lname} onChange={inputChangeHandler} id='lname' name='lname' autoComplete='off' placeholder='Last name' />
                </div>
                <div className='inputgroup'>
                    <label htmlFor='email'>Email</label>
                    <input type="text" value={user.email} onChange={inputChangeHandler} id='email' name='email' autoComplete='off' placeholder='Email' />
                </div>
                <div className='inputgroup'>
                    <button type='submit'>UPDATE USER</button>
                </div>
            </form>
        </div>
    );
};

const EmployeeList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/getall");
                setUsers(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <Routes>
            <Route path="/" element={<UserList users={users} setUsers={setUsers} />} />
            <Route path="/add" element={<AddUser setUsers={setUsers} />} />
            <Route path="/edit/:id" element={<EditUser setUsers={setUsers} />} />
        </Routes>
    );
};

export default EmployeeList;
