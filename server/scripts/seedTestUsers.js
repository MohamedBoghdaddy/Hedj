/**
 * Hedj Commerce — Test User Seed Script
 * Usage: node server/scripts/seedTestUsers.js
 *
 * Creates/updates three test accounts (admin, employee, customer) in MongoDB.
 * Idempotent: upserts by email so safe to re-run.
 * Never stores plaintext passwords.
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URL = process.env.MONGO_URI || process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URI / MONGO_URL not set in server/.env");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["customer", "employee", "admin"], default: "customer" },
    department: { type: String },
    receiveNotifications: { type: Boolean, default: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const TEST_PASSWORD = "TestPass123!";
const SALT_ROUNDS = 10;

const testUsers = [
  {
    username: "admin_tester",
    email: "admin.tester+hedj@example.com",
    firstName: "Admin",
    lastName: "Tester",
    gender: "prefer-not-to-say",
    role: "admin",
    department: "IT",
  },
  {
    username: "employee_tester",
    email: "employee.tester+hedj@example.com",
    firstName: "Employee",
    lastName: "Tester",
    gender: "prefer-not-to-say",
    role: "employee",
    department: "Sales",
  },
  {
    username: "customer_tester",
    email: "customer.tester+hedj@example.com",
    firstName: "Customer",
    lastName: "Tester",
    gender: "prefer-not-to-say",
    role: "customer",
  },
];

async function seed() {
  console.log("🔌  Connecting to MongoDB …");
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected\n");

  const hashed = await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);

  for (const userData of testUsers) {
    const update = { ...userData, password: hashed };
    const result = await User.findOneAndUpdate(
      { email: userData.email },
      update,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`✅  ${userData.role.toUpperCase().padEnd(10)} ${result.email} (${result._id})`);
  }

  console.log(`\n📋  Test credentials (all use password: ${TEST_PASSWORD})`);
  console.log("  admin    → admin.tester+hedj@example.com");
  console.log("  employee → employee.tester+hedj@example.com");
  console.log("  customer → customer.tester+hedj@example.com");

  await mongoose.disconnect();
  console.log("\n✅  Seed complete.");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
