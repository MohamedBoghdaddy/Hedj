/**
 * Seed script: creates QA test users for every role + seed employees,
 * departments, attendance records, and leave requests.
 *
 * Usage:
 *   node --experimental-vm-modules server/scripts/seedAllRoles.js
 *   OR (with dotenv/esm):
 *   node -r dotenv/config server/scripts/seedAllRoles.js
 *
 * Password for all test accounts: 12345678
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import User from "../model/usermodel.js";
import Employee from "../model/employeemodel.js";
import AttendanceRecord from "../model/AttendanceRecord.js";
import LeaveRequest from "../model/LeaveRequest.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
if (!MONGO_URI) { console.error("No MONGO_URI set. Exiting."); process.exit(1); }

const QA_PASSWORD = "12345678";
const hash = (pw) => bcrypt.hash(pw, 10);

// ── User accounts (User model) ─────────────────────────────────────────────
const USER_SEEDS = [
  {
    username: "qa_superadmin",
    email: "qa.superadmin@hedj.test",
    firstName: "Sovereign",
    lastName: "Blackwood",
    gender: "male",
    role: "super_admin",
    department: "Executive",
    jobTitle: "Super Administrator",
  },
  {
    username: "qa_admin",
    email: "qa.admin@hedj.test",
    firstName: "Orion",
    lastName: "Voss",
    gender: "male",
    role: "admin",
    department: "Management",
    jobTitle: "System Administrator",
  },
  {
    username: "qa_manager",
    email: "qa.manager@hedj.test",
    firstName: "Celeste",
    lastName: "Harrington",
    gender: "female",
    role: "manager",
    department: "Operations",
    jobTitle: "Operations Manager",
  },
  {
    username: "qa_hr",
    email: "qa.hr@hedj.test",
    firstName: "Nadia",
    lastName: "Kowalski",
    gender: "female",
    role: "HR",
    department: "Human Resources",
    jobTitle: "HR Specialist",
  },
  {
    username: "qa_accountant",
    email: "qa.accountant@hedj.test",
    firstName: "Felix",
    lastName: "Drummond",
    gender: "male",
    role: "accountant",
    department: "Finance",
    jobTitle: "Senior Accountant",
  },
  {
    username: "qa_operations",
    email: "qa.operations@hedj.test",
    firstName: "Remy",
    lastName: "Fontaine",
    gender: "male",
    role: "operations",
    department: "Fulfillment",
    jobTitle: "Operations Coordinator",
  },
  {
    username: "qa_designer",
    email: "qa.designer@hedj.test",
    firstName: "Luna",
    lastName: "Mercer",
    gender: "female",
    role: "designer",
    department: "Design",
    jobTitle: "Interior Designer",
  },
  {
    username: "qa_employee",
    email: "qa.employee@hedj.test",
    firstName: "Theo",
    lastName: "Prescott",
    gender: "male",
    role: "employee",
    department: "Warehouse",
    jobTitle: "Warehouse Associate",
  },
  {
    username: "qa_customer",
    email: "qa.customer@hedj.test",
    firstName: "Ivy",
    lastName: "Thornton",
    gender: "female",
    role: "customer",
    jobTitle: "",
    department: undefined,
  },
];

// ── Employee accounts (Employee model — for staff who log in via Employee model) ──
const EMPLOYEE_SEEDS = [
  {
    fname: "Augustin",
    lname: "Delacroix",
    email: "augustin@hedj.test",
    department: "Design",
    jobTitle: "Lead Designer",
    role: "admin",
  },
  {
    fname: "Yuki",
    lname: "Tanaka",
    email: "yuki@hedj.test",
    department: "Fulfillment",
    jobTitle: "Warehouse Lead",
    role: "operations",
  },
  {
    fname: "Priya",
    lname: "Sharma",
    email: "priya@hedj.test",
    department: "Human Resources",
    jobTitle: "HR Manager",
    role: "HR",
  },
  {
    fname: "Marco",
    lname: "Ricci",
    email: "marco@hedj.test",
    department: "Finance",
    jobTitle: "Financial Analyst",
    role: "accountant",
  },
  {
    fname: "Zara",
    lname: "Okonkwo",
    email: "zara@hedj.test",
    department: "Sales",
    jobTitle: "Sales Associate",
    role: "readonly",
  },
];

const upsertUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    console.log(`  ↻ User already exists: ${data.email}`);
    return existing;
  }

  const payload = {
    ...data,
    password: await hash(QA_PASSWORD),
    status: "active",
  };
  if (payload.role === "customer") delete payload.department;

  const user = await User.create(payload);
  console.log(`  ✓ Created user: ${data.email} [${data.role}]`);
  return user;
};

const upsertEmployee = async (data) => {
  const existing = await Employee.findOne({ email: data.email });
  if (existing) {
    console.log(`  ↻ Employee already exists: ${data.email}`);
    return existing;
  }

  const employee = new Employee({
    ...data,
    password: await hash(QA_PASSWORD),
    status: "active",
  });
  employee.password = QA_PASSWORD; // let pre-save hash it
  await employee.save();
  console.log(`  ✓ Created employee: ${data.email} [${data.role}]`);
  return employee;
};

const seedAttendance = async (employees) => {
  const today = new Date(); today.setHours(0,0,0,0);
  let created = 0;

  for (const emp of employees) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today); date.setDate(date.getDate() - d);
      const clockIn = new Date(date); clockIn.setHours(8, 45, 0, 0);
      const clockOut = new Date(date); clockOut.setHours(17, 15, 0, 0);

      try {
        await AttendanceRecord.findOneAndUpdate(
          { employeeId: emp._id, date },
          {
            $setOnInsert: {
              employeeName: `${emp.fname} ${emp.lname}`,
              employeeEmail: emp.email,
              department: emp.department,
              date,
              clockIn,
              clockOut,
              breakMinutes: 30,
              totalWorkedMinutes: (17 * 60 + 15) - (8 * 60 + 45) - 30,
              status: d === 6 ? "late" : "present",
              source: "system",
            },
          },
          { upsert: true }
        );
        created++;
      } catch {}
    }
  }

  console.log(`  ✓ Seeded ${created} attendance records`);
};

const seedLeaveRequests = async (employees) => {
  if (!employees.length) return;
  const emp = employees[0];

  const requests = [
    {
      type: "vacation",
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-06-22"),
      reason: "Annual family vacation to the coast",
      status: "pending",
    },
    {
      type: "sick_leave",
      startDate: new Date("2026-05-10"),
      endDate: new Date("2026-05-11"),
      reason: "Flu with doctor's note",
      status: "approved",
    },
    {
      type: "leave_early",
      startDate: new Date("2026-05-18"),
      endDate: new Date("2026-05-18"),
      leaveEarlyTime: "14:00",
      reason: "Dentist appointment",
      status: "approved",
    },
    {
      type: "time_off",
      startDate: new Date("2026-05-20"),
      endDate: new Date("2026-05-20"),
      hoursRequested: 2,
      reason: "Personal errand",
      status: "rejected",
      rejectionReason: "Short notice — team coverage unavailable",
    },
  ];

  let created = 0;
  for (const r of requests) {
    try {
      const exists = await LeaveRequest.findOne({ employeeId: emp._id, type: r.type, startDate: r.startDate });
      if (!exists) {
        await LeaveRequest.create({
          ...r,
          employeeId: emp._id,
          employeeName: `${emp.fname} ${emp.lname}`,
          employeeEmail: emp.email,
          department: emp.department,
        });
        created++;
      }
    } catch {}
  }
  console.log(`  ✓ Seeded ${created} leave requests`);
};

const main = async () => {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected.\n");

  console.log("── Seeding Users ─────────────────────────────────────────");
  for (const u of USER_SEEDS) await upsertUser(u);

  console.log("\n── Seeding Employees ─────────────────────────────────────");
  const seededEmployees = [];
  for (const e of EMPLOYEE_SEEDS) {
    const emp = await upsertEmployee(e);
    seededEmployees.push(emp);
  }

  console.log("\n── Seeding Attendance Records ────────────────────────────");
  await seedAttendance(seededEmployees);

  console.log("\n── Seeding Leave Requests ────────────────────────────────");
  await seedLeaveRequests(seededEmployees);

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("Seed complete. QA password for all accounts: 12345678");
  console.log("\nQA Account summary:");
  USER_SEEDS.forEach((u) => console.log(`  ${u.role.padEnd(12)}  ${u.email}`));
  console.log("\nEmployee accounts (Employee model):");
  EMPLOYEE_SEEDS.forEach((e) => console.log(`  ${e.role.padEnd(12)}  ${e.email}`));

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });
