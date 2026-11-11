import express from "express";
import {
  timeIn,
  timeOut,
  getAttendanceRecords,
  getAttendanceByService,
  getAttendanceByDate,
  getAttendanceByMemberId,
  getAttendanceSummary,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/timein", protect, timeIn);
router.post("/timeout", timeOut);
router.get("/attendance/:memberId", protect, getAttendanceRecords);
router.get("/attendance/:services", protect, getAttendanceByService);
router.get("/attendance/date", protect, getAttendanceByDate);
router.get("/attendance/:memberId", protect, getAttendanceByMemberId);
router.get("/attenance/summary", protect, getAttendanceSummary);
export default router;
