import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { AdminShell } from "../Components/AdminShell";
import { useAuthContext } from "../context/AuthContext";
import { can } from "../utils/permissions";
import { getAuthHeaders } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const STATUS_COLORS = {
  present: "#22c55e",
  late: "#f59e0b",
  absent: "#ef4444",
  half_day: "#a78bfa",
  leave: "#6366f1",
  holiday: "#0ea5e9",
  remote: "#06b6d4",
};

const STATUS_OPTIONS = ["present", "late", "absent", "half_day", "leave", "holiday", "remote"];

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const formatTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

const getEmployeeId = (employee) => {
  if (!employee) return "";
  if (typeof employee === "string") return employee;
  return employee._id || employee.id || "";
};

const getEmployeeName = (employee) => {
  if (!employee || typeof employee === "string") return "";
  const fullName =
    employee.fullName ||
    employee.name ||
    [employee.fname || employee.firstName, employee.lname || employee.lastName]
      .filter(Boolean)
      .join(" ");
  return fullName.trim() || employee.email || "Unnamed employee";
};

const getEmployeeMeta = (employee) => {
  if (!employee || typeof employee === "string") return "";
  return [
    employee.employeeCode || employee.staffCode || employee.code,
    employee.department,
    employee.jobTitle || employee.role,
  ]
    .filter(Boolean)
    .join(" · ");
};

const employeeMatches = (employee, searchTerm) => {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;

  return [
    getEmployeeName(employee),
    employee?.email,
    employee?.department,
    employee?.role,
    employee?.jobTitle,
    employee?.employeeCode,
    employee?.staffCode,
    employee?.code,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
};

const getRecordEmployee = (record, employees = []) => {
  const populated = typeof record.employeeId === "object" ? record.employeeId : null;
  const employeeFromRecord = record.employee || populated;
  const employeeId = getEmployeeId(employeeFromRecord) || getEmployeeId(record.employeeId);
  const employeeFromList = employees.find((employee) => getEmployeeId(employee) === String(employeeId));

  if (employeeFromRecord || employeeFromList) {
    const employee = employeeFromRecord || employeeFromList;
    return {
      id: getEmployeeId(employee),
      name: getEmployeeName(employee),
      email: employee.email || record.employeeEmail || "",
      department: employee.department || record.department || "",
      meta: getEmployeeMeta(employee),
    };
  }

  return {
    id: employeeId,
    name: record.employeeName || "Employee unavailable",
    email: record.employeeEmail || "",
    department: record.department || "",
    meta: record.department || "",
  };
};

const toFriendlyAttendanceError = (message) => {
  if (!message) return "Save failed";
  const lower = String(message).toLowerCase();
  if (
    lower.includes("employeeid") ||
    lower.includes("objectid") ||
    lower.includes("cast to") ||
    lower.includes("employee not found")
  ) {
    return "Selected employee could not be found. Please choose another employee.";
  }
  return message;
};

const emptyForm = {
  employeeId: "",
  date: new Date().toISOString().split("T")[0],
  clockIn: "",
  clockOut: "",
  breakMinutes: 0,
  status: "present",
  notes: "",
};

function EmployeePicker({
  employees,
  selectedEmployeeId,
  search,
  onSearchChange,
  onSelect,
  loading,
  error,
}) {
  const filteredEmployees = useMemo(
    () => employees.filter((employee) => employeeMatches(employee, search)).slice(0, 40),
    [employees, search]
  );
  const selectedEmployee = employees.find(
    (employee) => getEmployeeId(employee) === String(selectedEmployeeId || "")
  );

  return (
    <div className="admin-form-group attendance-employee-picker">
      <label htmlFor="att-employee-search">Employee *</label>
      {selectedEmployee && (
        <div className="attendance-selected-employee" aria-live="polite">
          <span className="material-symbols-outlined">badge</span>
          <div>
            <strong>{getEmployeeName(selectedEmployee)}</strong>
            <small>{selectedEmployee.email || "No email on file"}</small>
            {getEmployeeMeta(selectedEmployee) && <em>{getEmployeeMeta(selectedEmployee)}</em>}
          </div>
        </div>
      )}
      <div className="attendance-employee-search-wrap">
        <span className="material-symbols-outlined">search</span>
        <input
          id="att-employee-search"
          type="search"
          className="admin-input"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search employee by name, email, or department"
          autoComplete="off"
        />
      </div>
      <div className="attendance-employee-options" role="listbox" aria-label="Employees">
        {loading ? (
          <div className="attendance-employee-state">Loading employees...</div>
        ) : error ? (
          <div className="attendance-employee-state attendance-employee-state-error">{error}</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="attendance-employee-state">No employees found.</div>
        ) : (
          filteredEmployees.map((employee) => {
            const employeeId = getEmployeeId(employee);
            const active = employeeId === selectedEmployeeId;
            return (
              <button
                key={employeeId}
                type="button"
                className={`attendance-employee-option${active ? " is-selected" : ""}`}
                onClick={() => onSelect(employee)}
                role="option"
                aria-selected={active}
              >
                <span className="attendance-employee-avatar" aria-hidden="true">
                  {getEmployeeName(employee)
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "HE"}
                </span>
                <span>
                  <strong>{getEmployeeName(employee)}</strong>
                  <small>{employee.email || "No email on file"}</small>
                  {getEmployeeMeta(employee) && <em>{getEmployeeMeta(employee)}</em>}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminAttendance() {
  const { state } = useAuthContext();
  const user = state.user;

  const canCreate = can(user, "attendance.create");
  const canEdit   = can(user, "attendance.update");
  const canDelete = can(user, "attendance.delete");
  const canExport = can(user, "attendance.exportExcel");
  const canImport = can(user, "attendance.importExcel");

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({ status: "", from: "", to: "", department: "" });
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (filters.status) params.set("status", filters.status);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.department) params.set("department", filters.department);

      const res = await fetch(`${API_URL}/api/admin/attendance?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        setTotal(data.total);
      } else {
        toast.error(data.message || "Failed to load attendance records");
      }
    } catch {
      toast.error("Network error loading attendance");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/employees`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load employees.");
      }
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
    } catch (error) {
      setEmployeesError(error.message || "Could not load employees.");
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => {
    if (modal) fetchEmployees();
  }, [modal, fetchEmployees]);

  const openAdd = () => {
    setForm(emptyForm);
    setEmployeeSearch("");
    setModal("add");
  };
  const openEdit = (rec) => {
    const recordEmployee = getRecordEmployee(rec, employees);
    setForm({
      _id: rec._id,
      employeeId: recordEmployee.id || getEmployeeId(rec.employeeId),
      date: rec.date ? new Date(rec.date).toISOString().split("T")[0] : "",
      clockIn: rec.clockIn ? new Date(rec.clockIn).toISOString().slice(0, 16) : "",
      clockOut: rec.clockOut ? new Date(rec.clockOut).toISOString().slice(0, 16) : "",
      breakMinutes: rec.breakMinutes || 0,
      status: rec.status || "present",
      notes: rec.notes || "",
    });
    setEmployeeSearch(recordEmployee.name || "");
    setModal("edit");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = modal === "edit"
        ? `${API_URL}/api/admin/attendance/${form._id}`
        : `${API_URL}/api/admin/attendance`;
      const method = modal === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(modal === "edit" ? "Record updated" : "Record created");
        setModal(null);
        fetchRecords();
      } else {
        toast.error(data.message || "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/attendance/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Record deleted");
        fetchRecords();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      window.open(`${API_URL}/api/admin/export/attendance.xlsx?${params}&token=${localStorage.getItem("token")}`, "_blank");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await fetch(`${API_URL}/api/admin/import?type=attendance`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setImportResult(data.summary);
        toast.success(`Imported: ${data.summary.totalInserted} inserted, ${data.summary.totalUpdated} updated`);
        fetchRecords();
      } else {
        toast.error(data.message || "Import failed");
      }
    } catch {
      toast.error("Network error during import");
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

  const LIMIT = 50;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminShell
      active="Attendance"
      title="Attendance"
      subtitle="Track and manage employee attendance records."
      actions={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canImport && (
            <label className="admin-btn admin-btn-secondary" style={{ cursor: "pointer" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
              Import Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files[0])}
              />
            </label>
          )}
          {canImport && importFile && (
            <button className="admin-btn admin-btn-primary" onClick={handleImport} disabled={importing}>
              {importing ? "Importing…" : `Confirm Import: ${importFile.name}`}
            </button>
          )}
          {canExport && (
            <button className="admin-btn admin-btn-secondary" onClick={handleExport}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Export Excel
            </button>
          )}
          {canCreate && (
            <button className="admin-btn admin-btn-primary" onClick={openAdd}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Add Record
            </button>
          )}
        </div>
      }
    >
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="admin-select"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="admin-input"
          placeholder="From date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          className="admin-input"
          placeholder="To date"
        />
        <input
          type="text"
          value={filters.department}
          onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          className="admin-input"
          placeholder="Department"
        />
        <button className="admin-btn admin-btn-secondary" onClick={() => { setFilters({ status: "", from: "", to: "", department: "" }); setPage(1); }}>
          Clear
        </button>
      </div>

      {/* Import result summary */}
      {importResult && (
        <div className="admin-card" style={{ marginBottom: 16, padding: 16 }}>
          <strong>Import Result:</strong> {importResult.totalInserted} inserted · {importResult.totalUpdated} updated · {importResult.totalSkipped} skipped · {importResult.totalFailed} failed
          <button style={{ marginLeft: 12, fontSize: 12, cursor: "pointer" }} onClick={() => setImportResult(null)}>Dismiss</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="admin-empty-state">Loading attendance records…</div>
      ) : records.length === 0 ? (
        <div className="admin-empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>event_available</span>
          <p>No attendance records found.</p>
          {canCreate && <button className="admin-btn admin-btn-primary" onClick={openAdd}>Add First Record</button>}
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Break</th>
                <th>Worked (min)</th>
                <th>Status</th>
                <th>Source</th>
                {(canEdit || canDelete) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.employeeName || "—"}<br /><small style={{ color: "#94a3b8" }}>{rec.employeeEmail}</small></td>
                  <td>{rec.department || "—"}</td>
                  <td>{formatDate(rec.date)}</td>
                  <td>{formatTime(rec.clockIn)}</td>
                  <td>{formatTime(rec.clockOut)}</td>
                  <td>{rec.breakMinutes || 0}m</td>
                  <td>{rec.totalWorkedMinutes || "—"}</td>
                  <td>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: STATUS_COLORS[rec.status] + "20",
                      color: STATUS_COLORS[rec.status],
                    }}>
                      {rec.status?.replace("_", " ") || "—"}
                    </span>
                  </td>
                  <td>{rec.source || "—"}</td>
                  {(canEdit || canDelete) && (
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {canEdit && (
                          <button
                            className="admin-btn admin-btn-ghost"
                            onClick={() => openEdit(rec)}
                            title="Edit record"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-danger"
                            onClick={() => handleDelete(rec._id)}
                            title="Delete record"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <button
            className="admin-btn admin-btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span style={{ lineHeight: "36px", color: "#94a3b8" }}>
            Page {page} of {totalPages} ({total} records)
          </span>
          <button
            className="admin-btn admin-btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="admin-modal-overlay">
          <button
            type="button"
            aria-label="Close modal"
            className="admin-modal-backdrop-btn"
            onClick={() => setModal(null)}
          />
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{modal === "edit" ? "Edit Attendance Record" : "Add Attendance Record"}</h2>
              <button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close modal">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-form">
              {modal === "add" && (
                <EmployeePicker
                  employees={employees}
                  selectedEmployeeId={form.employeeId}
                  search={employeeSearch}
                  onSearchChange={setEmployeeSearch}
                  onSelect={(emp) => {
                    setForm((f) => ({ ...f, employeeId: getEmployeeId(emp) }));
                    setEmployeeSearch(getEmployeeName(emp));
                  }}
                  loading={employeesLoading}
                  error={employeesError}
                />
              )}
              <div className="admin-form-group">
                <label htmlFor="att-date">Date *</label>
                <input
                  id="att-date"
                  type="date"
                  className="admin-input"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="att-clockIn">Clock In</label>
                  <input
                    id="att-clockIn"
                    type="datetime-local"
                    className="admin-input"
                    value={form.clockIn}
                    onChange={(e) => setForm((f) => ({ ...f, clockIn: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="att-clockOut">Clock Out</label>
                  <input
                    id="att-clockOut"
                    type="datetime-local"
                    className="admin-input"
                    value={form.clockOut}
                    onChange={(e) => setForm((f) => ({ ...f, clockOut: e.target.value }))}
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="att-break">Break (minutes)</label>
                  <input
                    id="att-break"
                    type="number"
                    className="admin-input"
                    value={form.breakMinutes}
                    min={0}
                    onChange={(e) => setForm((f) => ({ ...f, breakMinutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="att-status">Status</label>
                  <select
                    id="att-status"
                    className="admin-select"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label htmlFor="att-notes">Notes</label>
                <textarea
                  id="att-notes"
                  className="admin-input"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : (modal === "edit" ? "Save Changes" : "Create Record")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
