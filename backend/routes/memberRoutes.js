import express from "express";
import {
  createMember,
  getMemberByLibraryNumber,
  getAllMembers,
  getMemberByName,
  updateMember,
} from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Register a new library member
router.post(
  "/create-member",
  protect,
  authorizeRoles("admin", "librarian"),
  upload.single("profilePicture"),
  createMember,
);
router.get(
  "/get-members",
  protect,
  authorizeRoles("admin", "librarian"),
  getAllMembers,
);
router.get(
  "/get-members/search",
  protect,
  authorizeRoles("admin", "librarian"),
  getMemberByName,
);

router.get(
  "/get-members/:libraryNumber",
  protect,
  authorizeRoles("admin", "librarian"),
  getMemberByLibraryNumber,
);
router.post(
  "/get-members/update/:libraryNumber",
  protect,
  authorizeRoles("admin", "librarian"),
  updateMember,
);

export default router;
