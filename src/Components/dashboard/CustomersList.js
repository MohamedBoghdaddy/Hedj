import { useState } from "react";
import { BsPerson, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import useDashboard from "../../hooks/useDashboard";
import "../../Styles/Customer.css";

const CustomersList = () => {
  const { state } = useDashboard(); // Get customers from context

  const [searchQuery, setSearchQuery] = useState("");

  // Filter customers based on search query
  const filteredCustomers =
    state.customers?.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="customers-container">
      <div className="header">
        <h2>Customers</h2>
        <div className="search-bar">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-list">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <BsPerson className="customer-icon" />
              <div className="customer-info">
                <h4>{customer.name}</h4>
                <p>{customer.email}</p>
              </div>
              <BsThreeDotsVertical className="options-icon" />
            </div>
          ))
        ) : (
          <p>No customers found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomersList;
