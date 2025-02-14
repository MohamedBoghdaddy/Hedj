import { useState } from "react";
import { BsPersonBadge, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import useDashboard from "../../hooks/useDashboard";
import "../../Styles/Employee.css";

const EmployeeList = () => {
  const { state } = useDashboard(); // Get employees from DashboardContext
  const [searchQuery, setSearchQuery] = useState("");

  // Filter employees based on search query
  const filteredEmployees =
    state.employees?.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="employee-list">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div key={employee._id} className="employee-card">
              <BsPersonBadge className="employee-icon" />
              <div className="employee-info">
                <h4>{employee.name}</h4>
                <p>{employee.email}</p>
                <span className={`role-badge ${employee.role}`}>
                  {employee.role}
                </span>
              </div>
              <BsThreeDotsVertical className="options-icon" />
            </div>
          ))
        ) : (
          <p className="no-results">No employees found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
