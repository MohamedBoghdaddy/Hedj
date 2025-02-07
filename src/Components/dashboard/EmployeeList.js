import  { useEffect, useState } from "react";
import { BsPersonBadge, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import "../../Styles/dashboard.css";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get("/api/employees");
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="employee-list">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="employee-card">
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
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
