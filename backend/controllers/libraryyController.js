import LibraryService from "../models/LibraryService.js";

export const getAllLibraryServices = async (req, res) => {
  try {
    const services = await LibraryService.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      message: "Library services retrieved successfully.",
      services,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve library services.",
      error: error.message,
    });
  }
};
