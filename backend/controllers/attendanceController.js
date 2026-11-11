import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import LibraryService from "../models/LibraryService.js";

export const timeIn = async (req, res) => {
  try {
    const { memberId, libraryServiceId, activity } = req.body;
    // 1. Required fields validation
    if (!memberId || !libraryServiceId) {
      return res.status(400).json({
        message: "Member ID and Library Service ID are required.",
      });
    }

    // 2. ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(memberId) ||
      !mongoose.Types.ObjectId.isValid(libraryServiceId)
    ) {
      return res.status(400).json({
        message: "Invalid member ID or library service ID.",
      });
    }

    if (!memberId || !libraryServiceId) {
      return res.status(400).json({
        message: "Member ID and Library Service ID are required.",
      });
    }

    const [member, service] = await Promise.all([
      Member.findById(memberId).select("membershipStatus"),
      LibraryService.findOne({
        _id: libraryServiceId,
        isActive: true,
      }).select("_id"),
    ]);
    if (!service) {
      return res.status(404).json({
        message: "Library service not found or is not active.",
      });
    }

    const existingAttendance = await Attendance.findOne({
      member: memberId,
      libraryService: libraryServiceId,
      timeOut: null,
    });

    if (existingAttendance) {
      return res.status(409).json({
        message: "Member already has an active attendance for this service.",
      });
    }

    const attendance = await Attendance.create({
      member: memberId,
      libraryService: libraryServiceId,
      activity: activity || "",
      date: new Date(),
      timeIn: new Date(),
      assistedBy: req.user._id,
    });
    return res
      .status(201)
      .json({ message: "Time-in recorded successfully.", attendance });
  } catch (error) {
    console.error("Error recording time-in:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
export const timeOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({
        message: "Attendance ID is required.",
      });
    }
    const attendance = await Attendance.findOne({
      _id: attendanceId,
      timeOut: null,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found or already timed out.",
      });
    }
    attendance.timeOut = new Date();
    await attendance.save();
    return res.status(200).json({
      message: "Time-out recorded successfully.",
      attendance,
    });
  } catch (error) {
    console.error("Error recording time-out:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getAttendanceRecords = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .populate("member", "firstName lastName libraryCardNumber")
      .populate("libraryService", "name")
      .populate("assistedBy", "name")
      .sort({ timeIn: -1 });

    return res.status(200).json({
      message: "Attendance records retrieved successfully.",
      totalRecords: attendanceRecords.length,
      attendanceRecords,
    });
  } catch (error) {
    console.error("Error retrieving attendance records:", error);

    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getAttendanceByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;
    const records = await Attendance.find({ member: memberId })
      .populate("libraryService")
      .sort({ date: -1 });
    return res.status(200).json({
      totalRecords: records.length,
      records,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
export const getAttendanceByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const records = await Attendance.find({ message: memberId }).populate(
      "member",
      "firstName lastName",
    );
    return res.status(200).json({
      totalRecords: records.length,
      records,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const records = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("member", "firstName lastName")
      .populate("libraryService")
      .sort({ timeIn: -1 });

    return res.status(200).json({
      totalRecords: records.length,
      records,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
export const getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const totalAttendance = await Attendance.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalTimeIn = totalAttendance;

    const totalTimeOut = await Attendance.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
      timeOut: { $ne: null },
    });

    const activeAttendance = await Attendance.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
      timeOut: null,
    });

    return res.status(200).json({
      totalAttendance,
      totalTimeIn,
      totalTimeOut,
      activeAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "From and to dates are required." });
    }

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T23:59:59.999`);

    if (isNaN(start) || isNaN(end) || start > end) {
      return res.status(400).json({ message: "Invalid date range." });
    }

    const breakdown = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { service: "$libraryService", activity: "$activity" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "libraryservices",
          localField: "_id.service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          _id: 0,
          serviceName: "$service.name",
          activity: "$_id.activity",
          count: 1,
        },
      },
      { $sort: { serviceName: 1, activity: 1 } },
    ]);

    const total = breakdown.reduce((sum, row) => sum + row.count, 0);

    return res.status(200).json({ from, to, total, breakdown });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
