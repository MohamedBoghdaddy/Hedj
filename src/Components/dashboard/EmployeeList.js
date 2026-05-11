import { useEffect, useMemo, useState } from "react";
import { BsPersonBadge, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import { commerceApi } from "../../services/api";
import "../../Styles/Employee.css";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      try {
        const data = await commerceApi.getEmployees();
        if (mounted) {
          setEmployees(data);
          setError("");
        }
      } catch {
        if (mounted) setError("Employees could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEmployees();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [employees, searchQuery]
  );

  return (
    <div className="employee-container">
      <div className="header">
        <h2>Employees</h2>
        <div className="search-bar">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {loading && <p className="no-results">Loading employees...</p>}
      {!loading && error && <p className="no-results">{error}</p>}

      {!loading && !error && (
        <div className="employee-list">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div key={employee.id || employee._id} className="employee-card">
                <BsPersonBadge className="employee-icon" />
                <div className="employee-info">
                  <h4>{employee.name}</h4>
                  <p>{employee.email}</p>
                  <span className={`role-badge ${employee.role}`}>{employee.role}</span>
                </div>
                <BsThreeDotsVertical className="options-icon" />
              </div>
            ))
          ) : (
            <p className="no-results">No employees found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
