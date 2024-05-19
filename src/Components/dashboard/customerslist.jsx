import React from "react";
import "../../Styles/list.css";
import employeeimage from '../../Assets/Images/simple.jpg';

const customers = [
    { image: employeeimage, name: "Tommy", email: "Tommypeter24@gmail.com", timetogoout: "10 min" },
    { image: employeeimage, name: "Tommy", email: "Tommypeter24@gmail.com", timetogoout: "30 min" },
    { image: employeeimage, name: "Tommy P", email: "Tommypeter24@gmail.com", timetogoout: "20 min" },
    { image: employeeimage, name: "Tommy", email: "Tommypeter24@gmail.com", timetogoout: "24 min" }
];

const CustomersList = () => {
    return (
        <div className="customersList">
            <div className="listheader">
                <h3>Customers</h3>
            </div>
            <table className="listcontainercus">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Time to go out</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((person, index) => (
                        <tr key={index}>
                            <td>
                                <div className="details">
                                    <img src={person.image} alt={person.name} />
                                    <h3 className="nameee">{person.name}</h3>
                                </div>
                            </td>
                            <td className="emailemp">{person.email}</td>
                            <td>{person.timetogoout}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomersList;
