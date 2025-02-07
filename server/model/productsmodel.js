import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addToCart,
  checkout,
  validateProduct,
} from "../controllers/productsController.js";
import {
  isAdminOrEmployee,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/cart/add", isAuthenticated, addToCart);
router.post("/cart/checkout", isAuthenticated, checkout);

// Admin & Employee Routes
router.post("/create", isAdminOrEmployee, validateProduct, createProduct);
router.put("/update/:id", isAdminOrEmployee, validateProduct, updateProduct);
router.delete("/delete/:id", isAdminOrEmployee, deleteProduct);

export default router;
