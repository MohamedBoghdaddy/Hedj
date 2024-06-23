import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees, getEmployee, updateEmployee, getLastAdmins } from '../controller/employeecontroller.js';
import { createUser, loginUser, logoutUser, getAllUsers, updateUser,deleteUser } from '../controller/usercontroller.js';
import { createProduct,getProducts,getProductById,updateProduct,deleteProduct} from '../controller/productscontroller.js';

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
router.put('/users/update/:id', updateUser);  // Add this line
router.get('/getlastadmins', getLastAdmins);
router.delete('/users/:id', deleteUser);
router.post('/Products',createProduct);
router.get('/Products',getProducts);
router.get('/Products/:id',getProductById);
router.put('/Products/:id',updateProduct);
router.delete('Products/:id',deleteProduct)


export default router;
