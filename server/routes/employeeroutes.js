import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees, getEmployee, updateEmployee,getLastAdmins} from '../controller/employeecontroller.js';
import {createUser,loginUser,logoutUser,getAllUsers } from '../controller/usercontroller.js'

const router = express.Router();

router.post('/create', createEmployee);
router.get('/getall', getAllEmployees);
router.get('/getone/:id', getEmployee);
router.put('/update/:id', updateEmployee);
router.delete('/delete/:id', deleteEmployee);
router.post('/users/signup', createUser);
router.post('/users/login', loginUser);
router.post('/users/logout', logoutUser);
router.get('/users/customerslist', getAllUsers);
router.get('/getlastadmins', getLastAdmins);

export default router;
