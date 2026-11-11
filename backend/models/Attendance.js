import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    libraryService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryService",
      required: true,
    },

    activity: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    timeIn: {
      type: Date,
      default: Date.now,
    },

    timeOut: {
      type: Date,
      default: null,
    },

    assistedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
