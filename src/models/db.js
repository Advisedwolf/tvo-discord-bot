// src/models/db.js
import mongoose from "mongoose";
import { MONGODB_URI } from "../config/index.js";

/**
 * Connects to MongoDB via Mongoose.
 * Exits the process if the URI is missing or connection fails.
 * Suppresses Mongoose deprecation warnings.
 */
export async function connectDB() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not defined in environment");
    process.exit(1);
  }

  // Prevent deprecation warning for strictQuery in Mongoose v7
  mongoose.set("strictQuery", false);

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
