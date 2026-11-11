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
export const createLibraryService = async (req, res) => {
  try {
    const { name, subServices } = req.body;

    // Check required service name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Library service name is required.",
      });
    }

    // Check if service already exists
    const existingService = await LibraryService.findOne({
      name: name.trim(),
    });

    if (existingService) {
      return res.status(409).json({
        message: "Library service already exists.",
      });
    }

    // Create new library service
    const newService = await LibraryService.create({
      name: name.trim(),
      subServices: subServices || [],
    });

    return res.status(201).json({
      message: "Library service created successfully.",
      service: newService,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create library service.",
      error: error.message,
    });
  }
};
