import mongoose from "mongoose";

const libraryServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    subServices: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const LibraryService = mongoose.model("LibraryService", libraryServiceSchema);

export default LibraryService;
