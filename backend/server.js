import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import memberRoutes from "./routes/memberRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import libraryServiceRoutes from "./routes/LibraryServiceRoutes.js";
import attendanceMemberRoutes from "./routes/attendanceMemberRoutes.js";
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/library-services", libraryServiceRoutes);
app.use("/api", memberRoutes);
app.use("/api", loginRoutes);
app.use("/api", attendanceMemberRoutes);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
