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
attendanceSchema.index(
  { member: 1, libraryService: 1 },
  {
    unique: true,
    partialFilterExpression: { timeOut: null },
  },
);
attendanceSchema.index({ date: 1, timeIn: -1 });
attendanceSchema.index({ member: 1, libraryService: 1, timeOut: 1 });
attendanceSchema.index({ activity: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
