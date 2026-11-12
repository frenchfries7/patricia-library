import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import LibraryService from "../models/LibraryService.js";

export const timeIn = async (req, res) => {
  try {
    const { memberId, libraryServiceId, activity } = req.body;

    // 1. Validation check
    if (!memberId || !libraryServiceId) {
      return res.status(400).json({
        message: "Member ID and Library Service ID are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(memberId) ||
      !mongoose.Types.ObjectId.isValid(libraryServiceId)
    ) {
      return res.status(400).json({
        message: "Invalid member ID or library service ID.",
      });
    }

    // 2. Active Service & Existing Attendance Check (Parallel Execution)
    const [member, service, existingAttendance] = await Promise.all([
      Member.findOne({
        _id: memberId,
        membershipStatus: "active",
      })
        .select("_id")
        .lean(),

      LibraryService.findOne({
        _id: libraryServiceId,
        isActive: true,
      })
        .select("_id")
        .lean(),

      Attendance.findOne({
        member: memberId,
        libraryService: libraryServiceId,
        timeOut: null,
      })
        .select("_id")
        .lean(),
    ]);
    if (!member) {
      return res.status(404).json({
        message: "Member not found or membership is inactive.",
      });
    }
    if (!service) {
      return res.status(404).json({
        message: "Library service not found or is not active.",
      });
    }

    if (existingAttendance) {
      return res.status(409).json({
        message: "Member already has an active attendance for this service.",
      });
    }

    // 3. Create Attendance Record
    const now = new Date();
    const attendance = await Attendance.create({
      member: memberId,
      libraryService: libraryServiceId,
      activity: activity || "",
      date: now,
      timeIn: now,
      assistedBy: req.user._id,
    });

    return res
      .status(201)
      .json({ message: "Time-in recorded successfully.", attendance });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Member already has an active attendance for this service.",
      });
    }
    console.error("Error recording time-in:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
export const timeOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    // 1. Validation check
    if (!attendanceId) {
      return res.status(400).json({
        message: "Attendance ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({
        message: "Invalid attendance ID format.",
      });
    }

    // 2. Atomic Update using findOneAndUpdate + lean
    const attendance = await Attendance.findOneAndUpdate(
      {
        _id: attendanceId,
        timeOut: null,
      },
      {
        $set: { timeOut: new Date() },
      },
      {
        new: true, // I-return ang na-update na document
      },
    ).lean();

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found or already timed out.",
      });
    }

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
      .select("date timeIn timeOut member libraryService assistedBy") // Kumuha lang ng kailangang fields
      .populate([
        { path: "member", select: "firstName lastName libraryCardNumber" },
        { path: "libraryService", select: "name" },
        { path: "assistedBy", select: "name" },
      ])
      .sort({ timeIn: -1 })
      .lean();

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
