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
} from "../controller/productscontroller.js";
import {
  verifyAdminOrEmployee,
  verifyUser,
} from "../middleware/AuthMiddleware.js";

const router = express.Router();

// ✅ Public Routes (Accessible by all users)
router.get("/", getProducts); // Get all products
router.get("/:id", getProductById); // Get a single product by ID

// ✅ Admin & Employee Routes (Requires Authentication & Role Check)
router.post("/create", verifyAdminOrEmployee, validateProduct, createProduct); // Create a product
router.put(
  "/update/:id",
  verifyAdminOrEmployee,
  validateProduct,
  updateProduct
); // Update product
router.delete("/delete/:id", verifyAdminOrEmployee, deleteProduct); // Delete product

// ✅ User Routes (Requires Authentication)
router.post("/cart/add", verifyUser, addToCart); // Add product to cart
router.post("/cart/checkout", verifyUser, checkout); // Checkout & Purchase

export default router;
