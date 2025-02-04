import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Styles/lists.css';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [ setSelectedCustomer] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/customerslist');
      setCustomers(response.data.users);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setAlertMessage('');
  };

  const handleDeleteClick = (id) => {
    axios.delete(`http://localhost:8000/api/users/${id}`)
      .then(response => {
        setCustomers(customers.filter(c => c._id !== id));
        setAlertMessage(response.data.message);
      })
      .catch(error => {
        console.error('Error deleting customer:', error);
        setAlertMessage('Error deleting customer');
      });
  };

  return (
    <div className="customersList">
      {alertMessage && <div className="alert">{alertMessage}</div>}
      <div className="listheader">
        <h3>Customers</h3>
      </div>
      <table className="listcontainercus" id="customer">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((person, index) => (
            <tr key={index}>
              <td>{person.name}</td>
              <td>{person.email}</td>
              <td>{person.password}</td>
              <td>{person.gender}</td>
              <td className="action">
                <button onClick={() => handleEditClick(person)}>
                  <i className="fa-solid fa-pen-to-square"></i> 
                </button>
                <button onClick={() => handleDeleteClick(person._id)}>
                  <i className="fa-solid fa-trash"></i> 
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersList;
