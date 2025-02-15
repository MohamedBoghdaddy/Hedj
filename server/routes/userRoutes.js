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
  getUsersByRole,
} from "../controller/usercontroller.js";
import { isAuthenticated } from "../middleware/AuthMiddleware.js";



const router = express.Router();

// Authentication Routes
router.post("/signup", registerUser); // Ensure it is lowercase
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.put(
  "/update/:userId",
  isAuthenticated,
  upload.single("photoFile"),
  updateUser
); // apply upload middleware here

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:userId", getUser);
router.put("/users/:userId", upload.single("profilePhoto"), updateUser);
router.delete("/users/:userId", deleteUser);
router.get("/filter", getUsersByRole); // GET users filtered by role

// Search Route
router.get("/search", searchUsers);

export default router;
