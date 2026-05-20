/**
 * resolveEmployee(actor) → Employee document or null
 *
 * The actor may be a User-model document (req.user) or an Employee-model
 * document (req.employee). This helper returns the canonical Employee record
 * needed to look up AttendanceRecord / LeaveRequest rows, which are all
 * keyed to Employee._id.
 *
 * Resolution order:
 *  1. If actor IS an Employee model doc → return it directly.
 *  2. If actor is a User with actor.employeeId → load that Employee.
 *  3. Search Employee collection by matching email.
 *  4. Return null (no linked employee record exists).
 */

import Employee from "../model/employeemodel.js";

export const resolveEmployee = async (actor) => {
  if (!actor) return null;

  // Actor is already an Employee model instance (has fname/lname fields)
  if (actor.fname !== undefined) return actor;

  // Actor is a User — check the employeeId link first (fastest path)
  if (actor.employeeId) {
    const emp = await Employee.findById(actor.employeeId).lean();
    if (emp) return emp;
  }

  // Fallback: match by email (covers cases where link is not yet set)
  if (actor.email) {
    const emp = await Employee.findOne({ email: actor.email }).lean();
    if (emp) {
      // Opportunistically persist the link on the User record (fire-and-forget)
      if (actor._id && !actor.employeeId) {
        try {
          const User = (await import("../model/usermodel.js")).default;
          await User.updateOne({ _id: actor._id }, { $set: { employeeId: emp._id } });
          await Employee.updateOne({ _id: emp._id }, { $set: { userId: actor._id } });
        } catch {}
      }
      return emp;
    }
  }

  return null;
};
