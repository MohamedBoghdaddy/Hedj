import xlsx from "xlsx";
import Employee from "../model/employeemodel.js";
import AttendanceRecord from "../model/AttendanceRecord.js";
import LeaveRequest from "../model/LeaveRequest.js";
import User from "../model/usermodel.js";

// ── Helpers ────────────────────────────────────────────────────────────────

const sheetToRows = (workbook, sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return null;
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
};

const autoDetectType = (headers) => {
  const h = headers.map((x) => String(x).toLowerCase());
  if (h.some((x) => x.includes("clockin") || x.includes("clock_in"))) return "attendance";
  if (h.some((x) => x.includes("leavetype") || x.includes("leave_type") || x.includes("startdate"))) return "leave";
  if (h.some((x) => x.includes("sku") || x.includes("stock"))) return "products";
  if (h.some((x) => x.includes("fname") || x.includes("firstname") || x.includes("first_name") || x.includes("department"))) return "employees";
  if (h.some((x) => x.includes("company") || x.includes("leadstatus") || x.includes("lead_status"))) return "leads";
  return null;
};

// ── Excel export helpers ───────────────────────────────────────────────────

const sendXlsx = (res, data, sheetName, filename) => {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
  const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buf);
};

// ── Export endpoints ───────────────────────────────────────────────────────

export const exportEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password -__v").lean();
    const rows = employees.map((e) => ({
      id: e._id,
      firstName: e.fname,
      lastName: e.lname,
      email: e.email,
      department: e.department,
      jobTitle: e.jobTitle || "",
      role: e.role,
      status: e.status,
      phone: e.phone || "",
      createdAt: e.createdAt,
    }));
    sendXlsx(res, rows, "Employees", "employees.xlsx");
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportAttendanceXlsx = async (req, res) => {
  try {
    const filter = {};
    if (req.query.from) filter["date"] = { ...filter.date, $gte: new Date(req.query.from) };
    if (req.query.to)   filter["date"] = { ...filter.date, $lte: new Date(req.query.to) };

    const records = await AttendanceRecord.find(filter).sort({ date: -1 }).lean();
    const rows = records.map((r) => ({
      employeeName: r.employeeName,
      employeeEmail: r.employeeEmail,
      department: r.department,
      date: r.date ? r.date.toISOString().split("T")[0] : "",
      clockIn: r.clockIn ? r.clockIn.toISOString() : "",
      clockOut: r.clockOut ? r.clockOut.toISOString() : "",
      breakMinutes: r.breakMinutes,
      totalWorkedMinutes: r.totalWorkedMinutes,
      status: r.status,
      source: r.source,
      notes: r.notes || "",
    }));
    sendXlsx(res, rows, "Attendance", "attendance.xlsx");
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportLeaveXlsx = async (req, res) => {
  try {
    const records = await LeaveRequest.find().sort({ createdAt: -1 }).lean();
    const rows = records.map((r) => ({
      employeeName: r.employeeName,
      employeeEmail: r.employeeEmail,
      department: r.department,
      type: r.type,
      startDate: r.startDate ? r.startDate.toISOString().split("T")[0] : "",
      endDate: r.endDate ? r.endDate.toISOString().split("T")[0] : "",
      status: r.status,
      reason: r.reason || "",
      rejectionReason: r.rejectionReason || "",
      createdAt: r.createdAt,
    }));
    sendXlsx(res, rows, "LeaveRequests", "leave_requests.xlsx");
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Import endpoints ───────────────────────────────────────────────────────

export const importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });

    const summary = {
      sheets: [],
      totalInserted: 0,
      totalUpdated: 0,
      totalSkipped: 0,
      totalFailed: 0,
    };

    for (const sheetName of workbook.SheetNames) {
      const rows = sheetToRows(workbook, sheetName);
      if (!rows || rows.length === 0) {
        summary.sheets.push({ sheet: sheetName, type: "empty", rows: [] });
        continue;
      }

      const headers = Object.keys(rows[0]);
      let type = req.query.type || autoDetectType(headers);
      if (!type) type = sheetName.toLowerCase().replace(/\s/g, "_");

      let sheetResult;
      if (type === "employees") sheetResult = await importEmployees(rows);
      else if (type === "attendance") sheetResult = await importAttendance(rows);
      else if (type === "leave") sheetResult = await importLeave(rows);
      else sheetResult = { inserted: 0, updated: 0, skipped: rows.length, failed: 0, rows: rows.map((_, i) => ({ row: i + 2, status: "skipped", reason: `Unknown sheet type: ${type}` })) };

      summary.sheets.push({ sheet: sheetName, type, ...sheetResult });
      summary.totalInserted += sheetResult.inserted || 0;
      summary.totalUpdated  += sheetResult.updated  || 0;
      summary.totalSkipped  += sheetResult.skipped  || 0;
      summary.totalFailed   += sheetResult.failed   || 0;
    }

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee import ────────────────────────────────────────────────────────
const importEmployees = async (rows) => {
  const result = { inserted: 0, updated: 0, skipped: 0, failed: 0, rows: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const email = (row.email || row.Email || "").toLowerCase().trim();
    const fname = (row.fname || row.firstName || row.first_name || row.FirstName || "").trim();
    const lname = (row.lname || row.lastName || row.last_name || row.LastName || "").trim();
    const department = (row.department || row.Department || "").trim();

    if (!email) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: "Missing email" });
      continue;
    }
    if (!fname || !lname) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: "Missing first or last name" });
      continue;
    }
    if (!department) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: "Missing department" });
      continue;
    }

    try {
      const existing = await Employee.findOne({ email });
      if (existing) {
        existing.fname = fname;
        existing.lname = lname;
        existing.department = department;
        if (row.jobTitle || row.job_title) existing.jobTitle = row.jobTitle || row.job_title;
        if (row.phone) existing.phone = String(row.phone);
        await existing.save();
        result.updated++;
        result.rows.push({ row: rowNum, status: "updated", email });
      } else {
        await Employee.create({
          fname, lname, email, department,
          jobTitle: row.jobTitle || row.job_title || "",
          phone: row.phone ? String(row.phone) : "",
          role: "readonly",
          password: "ChangeMe123!",
        });
        result.inserted++;
        result.rows.push({ row: rowNum, status: "inserted", email });
      }
    } catch (err) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: err.message, email });
    }
  }

  return result;
};

// ── Attendance import ──────────────────────────────────────────────────────
const importAttendance = async (rows) => {
  const result = { inserted: 0, updated: 0, skipped: 0, failed: 0, rows: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const email = (row.email || row.Email || row.employeeEmail || "").toLowerCase().trim();
    const dateRaw = row.date || row.Date || row.attendanceDate;

    if (!email || !dateRaw) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: "Missing email or date" });
      continue;
    }

    try {
      const employee = await Employee.findOne({ email }).lean();
      if (!employee) {
        result.skipped++;
        result.rows.push({ row: rowNum, status: "skipped", reason: `No employee found with email ${email}` });
        continue;
      }

      const date = new Date(dateRaw); date.setHours(0,0,0,0);
      const parseTime = (v) => v ? new Date(v) : undefined;

      await AttendanceRecord.findOneAndUpdate(
        { employeeId: employee._id, date },
        {
          $set: {
            employeeName: `${employee.fname} ${employee.lname}`,
            employeeEmail: employee.email,
            department: employee.department,
            clockIn: parseTime(row.clockIn || row.clock_in || row.ClockIn),
            clockOut: parseTime(row.clockOut || row.clock_out || row.ClockOut),
            breakMinutes: parseInt(row.breakMinutes || row.break_minutes || 0) || 0,
            status: (row.status || row.Status || "present").toLowerCase(),
            source: "import",
            notes: row.notes || row.Notes || "",
          },
        },
        { upsert: true, new: true }
      );

      result.inserted++;
      result.rows.push({ row: rowNum, status: "inserted", email, date: date.toISOString().split("T")[0] });
    } catch (err) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: err.message });
    }
  }

  return result;
};

// ── Leave import ───────────────────────────────────────────────────────────
const importLeave = async (rows) => {
  const result = { inserted: 0, updated: 0, skipped: 0, failed: 0, rows: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const email = (row.email || row.Email || row.employeeEmail || "").toLowerCase().trim();
    const type = (row.type || row.leaveType || row.leave_type || row.LeaveType || "").trim();
    const startDate = row.startDate || row.start_date || row.StartDate;
    const endDate = row.endDate || row.end_date || row.EndDate;

    if (!email || !type || !startDate || !endDate) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: "Missing email, type, startDate, or endDate" });
      continue;
    }

    try {
      const employee = await Employee.findOne({ email }).lean();
      if (!employee) {
        result.skipped++;
        result.rows.push({ row: rowNum, status: "skipped", reason: `No employee found with email ${email}` });
        continue;
      }

      await LeaveRequest.create({
        employeeId: employee._id,
        employeeName: `${employee.fname} ${employee.lname}`,
        employeeEmail: employee.email,
        department: employee.department,
        type: type.toLowerCase().replace(/\s+/g, "_"),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: row.reason || row.Reason || "",
        status: (row.status || row.Status || "pending").toLowerCase(),
      });

      result.inserted++;
      result.rows.push({ row: rowNum, status: "inserted", email });
    } catch (err) {
      result.failed++;
      result.rows.push({ row: rowNum, status: "failed", reason: err.message });
    }
  }

  return result;
};

// ── Template downloads ─────────────────────────────────────────────────────

export const downloadTemplate = (req, res) => {
  const { type } = req.params;
  const templates = {
    employees: [{ fname: "John", lname: "Doe", email: "john@example.com", department: "Engineering", jobTitle: "Engineer", phone: "+1234567890" }],
    attendance: [{ email: "john@example.com", date: "2026-05-01", clockIn: "2026-05-01 09:00", clockOut: "2026-05-01 17:00", breakMinutes: 30, status: "present", notes: "" }],
    leave: [{ email: "john@example.com", leaveType: "vacation", startDate: "2026-06-01", endDate: "2026-06-07", reason: "Annual holiday" }],
  };

  const data = templates[type];
  if (!data) return res.status(404).json({ success: false, message: `No template for type: ${type}` });

  sendXlsx(res, data, type, `${type}_template.xlsx`);
};
