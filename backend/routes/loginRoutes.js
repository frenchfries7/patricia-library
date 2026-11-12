import express from "express";
import { registerAdmin, login } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new library member
router.post("/login", login);
router.post("/register", protect, authorizeRoles("admin"), registerAdmin);

export default router;
