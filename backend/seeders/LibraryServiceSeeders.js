import LibraryService from "../models/LibraryService.js";

const libraryServices = [
  { name: "Books" },
  { name: "Computer/Tablet with Internet" },
  { name: "WiFi Users" },
  { name: "Digital Literacy" },
  { name: "E-Government Assistance" },
  { name: "E-resources" },
  { name: "Library Orientation" },
  {
    name: "Library Space",
    subServices: [
      "Dance Rehearsal",
      "Play Rehearsal",
      "Group Study",
      "Group Meeting",
      "Seminar/Training",
      "Reviewee",
      "Staff",
    ],
  },
  { name: "Periodical Users" },
  { name: "Reading Buddy" },
  {
    name: "Tutorials",
    subServices: ["Reading", "Writing", "Spelling", "Math", "Board Games"],
  },
  {
    name: "Library Extension",
    subServices: [
      "Art Activities",
      "Storytelling",
      "Educational Games",
      "Film Showing",
    ],
  },
];

const seedLibraryServices = async () => {
  for (const service of libraryServices) {
    await LibraryService.findOneAndUpdate(
      { name: service.name },
      { $set: service },
      { upsert: true, new: true },
    );
  }
  console.log("Library services seeded successfully.");
};

export default seedLibraryServices;
