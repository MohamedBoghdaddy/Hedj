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
  checkAuth,
} from "../controller/usercontroller.js";
import { isAuthenticated } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/checkAuth", checkAuth);

router.put(
  "/update/:userId",
  isAuthenticated,
  upload.single("photoFile"),
  updateUser
);

router.get("/filter", isAuthenticated, getUsersByRole);
router.get("/search", isAuthenticated, searchUsers);
router.get("/", isAuthenticated, getAllUsers);

// Legacy /api/users/users routes kept for compatibility with older clients.
router.get("/users", isAuthenticated, getAllUsers);
router.get("/users/:userId", isAuthenticated, getUser);
router.put(
  "/users/:userId",
  isAuthenticated,
  upload.single("profilePhoto"),
  updateUser
);
router.delete("/users/:userId", isAuthenticated, deleteUser);

router.get("/:id", isAuthenticated, getUser);
router.put("/:id", isAuthenticated, upload.single("profilePhoto"), updateUser);
router.delete("/:id", isAuthenticated, deleteUser);

export default router;
