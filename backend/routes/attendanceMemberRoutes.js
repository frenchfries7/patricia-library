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
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Time In / Time Out
router.post("/timein", protect, timeIn);
router.post("/timeout", protect, timeOut);

// Get all attendance records
router.get("/attendance", protect, getAttendanceRecords);

// Filter attendance
router.get("/attendance/date", protect, getAttendanceByDate);
router.get("/attendance/service/:serviceId", protect, getAttendanceByService);
router.get("/attendance/member/:memberId", protect, getAttendanceByMemberId);

// Attendance summary
router.get("/attendance/summary", protect, getAttendanceSummary);
router.get("/attendance/report", protect, getAttendanceReport);
export default router;
