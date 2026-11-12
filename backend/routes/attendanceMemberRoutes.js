import express from "express";
import {
  timeIn,
  timeOut,
  getAttendanceRecords,
  getAttendanceByService,
  getAttendanceByDate,
  getAttendanceByMemberId,
  getAttendanceSummary,
  getAttendanceReport,
} from "../controllers/attendanceController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Time In / Time Out
router.post("/timein", protect, authorizeRoles("admin", "librarian"), timeIn);
router.post("/timeout", protect, authorizeRoles("admin", "librarian"), timeOut);

// Get all attendance records
router.get(
  "/attendance",
  protect,
  authorizeRoles("admin", "librarian"),
  getAttendanceRecords,
);

// Filter attendance
router.get(
  "/attendance/date",
  protect,
  authorizeRoles("admin", "librarian"),
  getAttendanceByDate,
);
router.get(
  "/attendance/service/:serviceId",
  protect,
  authorizeRoles("admin", "librarian"),
  getAttendanceByService,
);
router.get(
  "/attendance/member/:memberId",
  protect,
  authorizeRoles("admin", "librarian"),
  getAttendanceByMemberId,
);

// Attendance summary
router.get(
  "/attendance/summary",
  protect,
  authorizeRoles("admin", "librarian"),
  getAttendanceSummary,
);
router.get(
  "/attendance/report",
  protect,
  authorizeRoles("admin", "librarian"),
  getAttendanceReport,
);
export default router;
