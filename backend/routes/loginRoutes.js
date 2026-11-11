import express from "express";
import { registerAdmin, login } from "../controllers/authController.js";

const router = express.Router();

// Register a new library member
router.post("/login", login);
router.post("/register", registerAdmin);

export default router;
