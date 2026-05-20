import AttendanceRecord from "../model/AttendanceRecord.js";
import Employee from "../model/employeemodel.js";
import { resolveEmployee } from "../utils/resolveEmployee.js";

// ── Helpers ────────────────────────────────────────────────────────────────

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

const buildFilter = (query) => {
  const filter = {};
  if (query.employeeId) filter.employeeId = query.employeeId;
  if (query.department) filter.department = query.department;
  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = startOfDay(query.from);
    if (query.to)   filter.date.$lte = endOfDay(query.to);
  }
  return filter;
};

// ── Admin/HR: list all attendance records ──────────────────────────────────
export const listAttendance = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [records, total] = await Promise.all([
      AttendanceRecord.find(filter)
        .sort({ date: -1, employeeName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AttendanceRecord.countDocuments(filter),
    ]);

    res.json({ success: true, records, total, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR: create a record manually ────────────────────────────────────
export const createAttendance = async (req, res) => {
  try {
    const {
      employeeId, date, clockIn, clockOut, breakMinutes,
      status, source, notes,
    } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ success: false, message: "employeeId and date are required." });
    }

    const employee = await Employee.findById(employeeId).lean();
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

    const record = await AttendanceRecord.create({
      employeeId,
      employeeName: `${employee.fname} ${employee.lname}`,
      employeeEmail: employee.email,
      department: employee.department,
      date: startOfDay(date),
      clockIn: clockIn ? new Date(clockIn) : undefined,
      clockOut: clockOut ? new Date(clockOut) : undefined,
      breakMinutes: breakMinutes || 0,
      status: status || "present",
      source: source || "manual",
      notes,
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Attendance record already exists for this employee on this date." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR: update a record ──────────────────────────────────────────────
export const updateAttendance = async (req, res) => {
  try {
    const record = await AttendanceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });

    const allowed = ["clockIn", "clockOut", "breakMinutes", "status", "notes", "source"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) record[f] = req.body[f]; });

    await record.save();
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR: delete a record ──────────────────────────────────────────────
export const deleteAttendance = async (req, res) => {
  try {
    const record = await AttendanceRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });
    res.json({ success: true, message: "Record deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee: view own attendance ──────────────────────────────────────────
export const getMyAttendance = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    if (!actor) return res.status(401).json({ success: false, message: "Not authenticated." });

    // Resolve to an Employee record (handles User→Employee link automatically)
    const emp = await resolveEmployee(actor);
    if (!emp) {
      return res.json({ success: true, records: [], note: "No linked employee record found." });
    }

    const filter = { employeeId: emp._id };
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = startOfDay(req.query.from);
      if (req.query.to)   filter.date.$lte = endOfDay(req.query.to);
    }

    const records = await AttendanceRecord.find(filter).sort({ date: -1 }).limit(90).lean();
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee: clock in ─────────────────────────────────────────────────────
export const clockIn = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    if (!actor) return res.status(401).json({ success: false, message: "Not authenticated." });

    const emp = await resolveEmployee(actor);
    if (!emp) return res.status(404).json({ success: false, message: "No linked employee record found. Contact your administrator." });

    const today = startOfDay(new Date());
    let record = await AttendanceRecord.findOne({ employeeId: emp._id, date: today });

    if (record?.clockIn) {
      return res.status(409).json({ success: false, message: "Already clocked in today." });
    }

    const now = new Date();
    const lateThreshold = new Date(today); lateThreshold.setHours(9, 15, 0, 0);
    const status = now > lateThreshold ? "late" : "present";

    if (record) {
      record.clockIn = now;
      record.status = status;
      await record.save();
    } else {
      record = await AttendanceRecord.create({
        employeeId: emp._id,
        employeeName: `${emp.fname} ${emp.lname}`,
        employeeEmail: emp.email,
        department: emp.department,
        date: today,
        clockIn: now,
        status,
        source: "system",
      });
    }

    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee: clock out ────────────────────────────────────────────────────
export const clockOut = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    if (!actor) return res.status(401).json({ success: false, message: "Not authenticated." });

    const emp = await resolveEmployee(actor);
    if (!emp) return res.status(404).json({ success: false, message: "No linked employee record found." });

    const today = startOfDay(new Date());
    const record = await AttendanceRecord.findOne({ employeeId: emp._id, date: today });

    if (!record?.clockIn) {
      return res.status(400).json({ success: false, message: "No clock-in record found for today." });
    }
    if (record.clockOut) {
      return res.status(409).json({ success: false, message: "Already clocked out today." });
    }

    record.clockOut = new Date();
    if (req.body.breakMinutes !== undefined) record.breakMinutes = req.body.breakMinutes;
    await record.save();

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR: export as JSON (frontend handles XLSX conversion) ────────────
export const exportAttendance = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const records = await AttendanceRecord.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
