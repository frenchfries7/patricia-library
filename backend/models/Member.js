import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 1,
      max: 120,
      required: true,
    },

    libraryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    barcode: {
      type: String,
      required: true,
      unique: true,
    },

    membershipStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const Member = mongoose.model("Member", memberSchema);

export default Member;
