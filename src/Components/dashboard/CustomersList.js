import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BsPerson, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import { commerceApi } from "../../services/api";
import "../../Styles/Customer.css";

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCustomers = async () => {
      try {
        const data = await commerceApi.getCustomers();
        if (mounted) {
          setCustomers(data);
          setError("");
        }
      } catch {
        if (mounted) setError("Customers could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCustomers();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [customers, searchQuery]
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
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {loading && <p className="no-results">Loading customers...</p>}
      {!loading && error && <p className="no-results">{error}</p>}

      {!loading && !error && (
        <div className="customers-list">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <Link key={customer.id} className="customer-card" to={`/admin/customers/${customer.id}`}>
                <BsPerson className="customer-icon" />
                <div className="customer-info">
                  <h4>{customer.name}</h4>
                  <p>{customer.email}</p>
                </div>
                <BsThreeDotsVertical className="options-icon" />
              </Link>
            ))
          ) : (
            <p>No customers found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomersList;
