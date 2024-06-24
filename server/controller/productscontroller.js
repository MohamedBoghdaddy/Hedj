import Products from "../model/productsmodel.js";
import asyncHandler from "express-async-handler";
import { check, validationResult } from "express-validator";

// Create product
export const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, category, price, images } = req.body;
  const newProduct = new Products({
    name,
    description,
    category,
    price,
    images,
  });

  const product = await newProduct.save();
  res.status(201).json(product);
});

// Validation middleware for createProduct
export const validateProduct = [
  check("name", "Name is required").not().isEmpty(),
  check("description", "Description is required").not().isEmpty(),
  check("category", "Category is required").not().isEmpty(),
  check("price", "Price is required").isNumeric(),
  check("images", "Images is required").isArray(),
];

// Get all products
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Products.find({});
  res.status(200).json({
    count: products.length,
    data: products,
  });
});

// Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ product });
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, category, price, images } = req.body;
  const updatedProduct = await Products.findByIdAndUpdate(
    req.params.id,
    { name, description, category, price, images },
    { new: true }
  );

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ product: updatedProduct });
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Products.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ message: "Product deleted successfully" });
});
