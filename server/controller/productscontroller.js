import asyncHandler from "express-async-handler";
import { check, validationResult } from "express-validator";
import Product from "../model/productsmodel.js";
import User from "../model/usermodel.js";

// Validation middleware for product operations
export const validateProduct = [
  check("name", "Name is required").not().isEmpty(),
  check("description", "Description is required").not().isEmpty(),
  check("category", "Category is required").not().isEmpty(),
  check("price", "Price must be a number").isFloat({ min: 0 }),
  check("images", "Images must be an array").isArray(),
];

// Create Product (Admins & Employees Only)
export const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, category, price, images } = req.body;
  const newProduct = new Product({
    name,
    description,
    category,
    price,
    images,
    createdBy: req.user.id, // Captures the employee/admin who created the product
  });

  await newProduct.save();
  res
    .status(201)
    .json({ message: "Product created successfully", product: newProduct });
});

// Get all products (Public Access)
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({ count: products.length, data: products });
});

// Get single product by ID (Public Access)
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

// Update product (Admins & Employees Only)
export const updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, category, price, images } = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, category, price, images },
    { new: true }
  );

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }
  res
    .status(200)
    .json({ message: "Product updated successfully", product: updatedProduct });
});

// Delete product (Admins & Employees Only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ message: "Product deleted successfully" });
});

// Add product to cart (Users Only)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = req.session.cart || [];
  const existingItem = cart.find(
    (item) => item.productId.toString() === productId
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  req.session.cart = cart;
  res.status(200).json({ message: "Added to cart", cart });
});

// Checkout and Purchase (Users Only)
export const checkout = asyncHandler(async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Process payment logic (to be implemented later)
  req.session.cart = [];
  res.status(200).json({ message: "Purchase successful" });
});


// ✅ Add to Wishlist Function
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?._id; // Ensure user is authenticated

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // ✅ Check if Product Exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Find User & Update Wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Prevent Duplicate Wishlist Entries
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      message: "Product added to wishlist successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("❌ Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
