// CustomersList.js

import React, { useEffect, useState } from 'react';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/users/customerslist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched customers data:', data);
        setCustomers(data.users); // Assuming backend responds with { users: [...] }
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  }, []);

  return (
    <div className="customersList">
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
          </tr>
        </thead>
        <tbody>
          {customers.map((person, index) => (
            <tr key={index}>
              <td>{person.name}</td>
              <td>{person.email}</td>
              <td>{person.password}</td>
              <td>{person.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersList;
