import { useEffect, useState } from "react";
import { BsPerson, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import "../../Styles/dashboard.css";

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get("/api/customers");
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <BsPerson className="customer-icon" />
            <div className="customer-info">
              <h4>{customer.name}</h4>
              <p>{customer.email}</p>
            </div>
            <BsThreeDotsVertical className="options-icon" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersList;
