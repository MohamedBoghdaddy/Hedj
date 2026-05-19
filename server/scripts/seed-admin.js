/**
 * One-time admin seed script.
 * Run: node server/scripts/seed-admin.js
 * Upserts a single admin user. Safe to re-run — won't create duplicates.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in server/.env");
  process.exit(1);
}

const AdminEmail = "admin@hedj.com";
const AdminPassword = "HEDJAdmin2024!";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["customer", "employee", "admin"], default: "customer" },
  status: { type: String, default: "active" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const run = async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB.");

  const existing = await User.findOne({ email: AdminEmail });
  if (existing) {
    if (existing.role !== "admin") {
      await User.updateOne({ _id: existing._id }, { role: "admin" });
      console.log(`Updated existing user ${AdminEmail} to role=admin.`);
    } else {
      console.log(`Admin user already exists: ${AdminEmail} (role=admin)`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(AdminPassword, 10);
  await User.create({
    username: "hedj_admin",
    email: AdminEmail,
    password: hashed,
    gender: "male",
    firstName: "Hedj",
    lastName: "Admin",
    role: "admin",
    status: "active",
  });

  console.log(`Admin user created: ${AdminEmail}`);
  console.log(`Password: ${AdminPassword}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
