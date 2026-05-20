import LeaveRequest from "../model/LeaveRequest.js";
import AttendanceRecord from "../model/AttendanceRecord.js";
import Employee from "../model/employeemodel.js";
import { resolveEmployee } from "../utils/resolveEmployee.js";

// ── Helpers ────────────────────────────────────────────────────────────────

const buildFilter = (query) => {
  const filter = {};
  if (query.employeeId) filter.employeeId = query.employeeId;
  if (query.department) filter.department = query.department;
  if (query.status)     filter.status = query.status;
  if (query.type)       filter.type = query.type;
  if (query.from || query.to) {
    filter.startDate = {};
    if (query.from) filter.startDate.$gte = new Date(query.from);
    if (query.to)   filter.startDate.$lte = new Date(query.to);
  }
  return filter;
};

// ── Employee: list own requests ────────────────────────────────────────────
export const getMyLeaveRequests = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    const emp = await resolveEmployee(actor);

    // Search by either the Employee._id (if resolved) or the raw actor._id
    const employeeIdFilter = emp ? emp._id : actor._id;
    const requests = await LeaveRequest.find({ employeeId: employeeIdFilter })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee: submit a request ─────────────────────────────────────────────
export const submitLeaveRequest = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    const { type, startDate, endDate, leaveEarlyTime, hoursRequested, reason } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "type, startDate, endDate are required." });
    }

    // Resolve to Employee for consistent ID storage
    const emp = await resolveEmployee(actor);
    const storedId   = emp ? emp._id : actor._id;
    const storedName = emp
      ? `${emp.fname} ${emp.lname}`
      : (actor.firstName ? `${actor.firstName} ${actor.lastName}` : (actor.fname ? `${actor.fname} ${actor.lname}` : actor.username || ""));
    const storedEmail = actor.email || emp?.email || "";
    const storedDept  = actor.department || emp?.department || "";

    const request = await LeaveRequest.create({
      employeeId: storedId,
      employeeName: storedName,
      employeeEmail: storedEmail,
      department: storedDept,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      leaveEarlyTime,
      hoursRequested,
      reason,
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Employee: cancel own pending request ──────────────────────────────────
export const cancelLeaveRequest = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    const emp = await resolveEmployee(actor);
    const employeeIdFilter = emp ? emp._id : actor._id;
    const request = await LeaveRequest.findOne({ _id: req.params.id, employeeId: employeeIdFilter });

    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be cancelled." });
    }

    request.status = "cancelled";
    await request.save();
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR/Manager: list all requests ───────────────────────────────────
export const listLeaveRequests = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LeaveRequest.countDocuments(filter),
    ]);

    res.json({ success: true, requests, total, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR/Manager: get one request ─────────────────────────────────────
export const getLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id).lean();
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR/Manager: approve ──────────────────────────────────────────────
export const approveLeaveRequest = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (!["pending", "escalated"].includes(request.status)) {
      return res.status(400).json({ success: false, message: "Request cannot be approved in its current state." });
    }

    request.status = "approved";
    request.decidedBy = actor._id;
    request.decidedAt = new Date();
    await request.save();

    // Mark attendance as "leave" for each day in the range
    const start = new Date(request.startDate);
    const end   = new Date(request.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d); day.setHours(0,0,0,0);
      await AttendanceRecord.findOneAndUpdate(
        { employeeId: request.employeeId, date: day },
        {
          $setOnInsert: {
            employeeName: request.employeeName,
            employeeEmail: request.employeeEmail,
            department: request.department,
            date: day,
            source: "system",
          },
          $set: { status: "leave" },
        },
        { upsert: true }
      );
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR/Manager: reject ───────────────────────────────────────────────
export const rejectLeaveRequest = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    const { rejectionReason } = req.body;

    if (!rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: "A rejection reason is required." });
    }

    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (!["pending", "escalated"].includes(request.status)) {
      return res.status(400).json({ success: false, message: "Request cannot be rejected in its current state." });
    }

    request.status = "rejected";
    request.decidedBy = actor._id;
    request.decidedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin/HR/Manager: escalate ─────────────────────────────────────────────
export const escalateLeaveRequest = async (req, res) => {
  try {
    const actor = req.actor || req.employee || req.user;
    const { nextApproverId } = req.body;

    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be escalated." });
    }

    request.status = "escalated";
    if (nextApproverId) request.currentApproverId = nextApproverId;
    request.approvalSteps.push({
      stepName: "Escalated",
      assigneeId: actor._id,
      assigneeName: actor.fname ? `${actor.fname} ${actor.lname}` : actor.username,
      status: "skipped",
      decidedAt: new Date(),
      comment: req.body.comment || "Escalated for higher approval",
    });
    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Export as JSON ─────────────────────────────────────────────────────────
export const exportLeaveRequests = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
