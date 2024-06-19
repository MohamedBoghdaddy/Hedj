import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees, getEmployee, updateEmployee } from '../controller/employeecontroller.js';
import {createUser} from '../controller/usercontroller.js'
const router = express.Router();

router.post('/create', createEmployee);
router.get('/getall', getAllEmployees);
router.get('/getone/:id', getEmployee);
router.put('/update/:id', updateEmployee);
router.delete('/delete/:id', deleteEmployee);
router.post('/users/signup', createUser);

export default router;
