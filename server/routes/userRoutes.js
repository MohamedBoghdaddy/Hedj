import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUsers,
  upload,
} from "../controller/usercontroller.js";

const router = express.Router();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:userId", getUser);
router.put("/users/:userId", upload.single("profilePhoto"), updateUser);
router.delete("/users/:userId", deleteUser);

// Search Route
router.get("/search", searchUsers);

export default router;
