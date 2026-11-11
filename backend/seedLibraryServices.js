import mongoose from "mongoose";
import connectDB from "./config/db.js";
import seedLibraryServices from "./seeders/LibraryServiceSeeders.js";

const runSeeder = async () => {
  try {
    await connectDB();

    await seedLibraryServices();

    console.log("Seeding completed.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

runSeeder();
