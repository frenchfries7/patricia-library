import { randomUUID } from "crypto";
import Member from "../models/Member.js";

export const createMember = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    // 1. I-generate MUNA ang libraryNumber
    const currentYear = new Date().getFullYear();
    const totalMembers = await Member.countDocuments();
    const sequenceNumber = String(totalMembers + 1).padStart(3, "0");
    const libraryNumber = `LIB-${currentYear}-${sequenceNumber}`;

    // 2. (Optional) Check kung may kapareho na (ngayon lang ito pwedeng gamitin)
    const existingMember = await Member.findOne({ libraryNumber });
    if (existingMember) {
      return res.status(400).json({
        message: "Member with this library number already exists",
      });
    }

    // 3. I-generate ang barcode
    const barcode = `LIB-MEM-${randomUUID()
      .replaceAll("-", "")
      .slice(0, 12)
      .toUpperCase()}`;

    // 4. I-save sa database
    const newMember = await Member.create({
      firstName,
      lastName,
      libraryNumber,
      barcode,
      profilePicture: req.file ? req.file.path : "",
    });

    return res.status(201).json({
      message: "Member created successfully",
      member: newMember,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getMemberByLibraryNumber = async (req, res) => {
  try {
    const { libraryNumber } = req.params;

    const member = await Member.findOne({ libraryNumber });

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Error retrieving member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ lastName: 1, firstName: 1 });

    if (!members || members.length === 0) {
      return res.status(404).json({
        message: "No members found",
      });
    }
    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error("Error retrieving members:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getMemberByName = async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    const members = await Member.find({
      firstName: { $regex: firstName.trim(), $options: "i" },
      lastName: { $regex: lastName.trim(), $options: "i" },
    });

    if (members.length === 0) {
      return res.status(404).json({
        message: "No members found",
      });
    }

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error("Error retrieving member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { libraryNumber } = req.params;
    const { firstName, lastName, membershipStatus } = req.body;

    if (!firstName || !lastName || !membershipStatus) {
      return res.status(400).json({
        message: "First name, last name, and membership status are required",
      });
    }
    const updatedMember = await Member.findOneAndUpdate(
      { libraryNumber },
      { firstName, lastName, membershipStatus },
      { new: true },
    );
    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }
    return res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { libraryNumber } = req.params;
    if (!libraryNumber) {
      return res.status(400).json({
        message: "Library number is required",
      });
    }
    const deletedMember = await Member.findOneAndDelete({ libraryNumber });
    if (!deletedMember) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    return res.status(200).json({
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!memberId) {
      return res.status(400).json({
        message: "Member ID is required",
      });
    }
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    return res
      .status(200)
      .json({ message: "Member retrieved successfully", member });
  } catch (error) {
    console.error("Error retrieving member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
