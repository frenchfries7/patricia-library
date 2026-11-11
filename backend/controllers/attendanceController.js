import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import LibraryService from "../models/LibraryService.js";

export const timeIn = async (req, res) => {
  try {
    const { memberId, libraryServiceId, activity } = req.body;

    if (!memberId || !libraryServiceId) {
      return res.status(400).json({
        message: "Member ID and Library Service ID are required.",
      });
    }

    const member = await Member.findById(memberId);
    if (!member || member.membershipStatus !== "active") {
      return res.status(404).json({
        message: "Member not found or membership is not active.",
      });
    }
    const service = await LibraryService.findOne({
      _id: libraryServiceId,
      isActive: true,
    });
    if (!service) {
      return res.status(404).json({
        message: "Library service not found or is not active.",
      });
    }
    if (!service) {
      return res
        .status(404)
        .json({ message: "Library service not found or is not active." });
    }
    const existingAttendance = await Attendance.findOne({
      member: memberId,
      libraryService: libraryServiceId,
      timeOut: null,
    });
    if (existingAttendance) {
      return res.status(400).json({
        message:
          "Member has already timed in for this service and has not timed out yet.",
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
      .populate("libraryService", "serviceName")
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
