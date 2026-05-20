/**
 * linkUsersToEmployees.js — idempotent migration.
 *
 * 1. Matches User ↔ Employee by email and sets bidirectional links.
 * 2. For staff Users (employee/manager/HR/etc.) with no matching Employee,
 *    creates a stub Employee record and links them.
 *
 * Safe to run multiple times.
 *
 * Usage: node server/scripts/linkUsersToEmployees.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import User from "../model/usermodel.js";
import Employee from "../model/employeemodel.js";
import bcrypt from "bcrypt";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
if (!MONGO_URI) { console.error("No MONGO_URI set."); process.exit(1); }

// Map User.role → Employee.role
const ROLE_MAP = {
  super_admin: "admin", admin: "admin", manager: "manager",
  HR: "HR", accountant: "accountant", operations: "operations",
  designer: "designer", employee: "readonly",
};

const main = async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected.\n");

  // Reload employees after any changes
  const refreshEmpMap = async () => {
    const all = await Employee.find().lean();
    return new Map(all.map(e => [e.email.toLowerCase(), e]));
  };

  let emailToEmployee = await refreshEmpMap();

  const staffUsers = await User.find({
    role: { $in: ["employee", "manager", "HR", "accountant", "operations", "designer", "admin", "super_admin"] }
  }).lean();

  let linked = 0, alreadyLinked = 0, created = 0;

  for (const user of staffUsers) {
    const userEmail = user.email?.toLowerCase();
    let emp = emailToEmployee.get(userEmail);

    if (!emp) {
      // Create a stub Employee record for this User
      const empRole = ROLE_MAP[user.role] || "readonly";
      const hashedPw = await bcrypt.hash("12345678", 10);
      const newEmp = await Employee.create({
        fname:      user.firstName || user.username || "Staff",
        lname:      user.lastName  || "",
        email:      user.email,
        department: user.department || "General",
        jobTitle:   user.jobTitle   || "",
        role:       empRole,
        password:   hashedPw,
        userId:     user._id,
        status:     "active",
      });
      await User.updateOne({ _id: user._id }, { $set: { employeeId: newEmp._id } });
      emailToEmployee = await refreshEmpMap(); // keep map current
      emp = newEmp;
      created++;
      console.log(`  ✚ Created Employee for User ${user.email} [${user.role} → ${empRole}]`);
      continue;
    }

    const userNeedsUpdate = !user.employeeId || String(user.employeeId) !== String(emp._id);
    const empNeedsUpdate  = !emp.userId || String(emp.userId) !== String(user._id);

    if (!userNeedsUpdate && !empNeedsUpdate) { alreadyLinked++; continue; }

    if (userNeedsUpdate) await User.updateOne({ _id: user._id }, { $set: { employeeId: emp._id } });
    if (empNeedsUpdate)  await Employee.updateOne({ _id: emp._id }, { $set: { userId: user._id } });
    linked++;
    console.log(`  ✓ Linked ${user.email} ↔ ${emp.email}`);
  }

  console.log(`\nDone. Linked: ${linked} · Created: ${created} · Already linked: ${alreadyLinked}`);
  await mongoose.disconnect();
  process.exit(0);
};

main().catch(err => { console.error(err); process.exit(1); });
