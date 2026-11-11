import express from "express";
import { getAllLibraryServices } from "../controllers/libraryyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllLibraryServices);

export default router;
