import React from "react";
import "../../Styles/lists.css";
import employeeimage from '../../Assets/Images/simpl.jpg';


const customers=[
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"10 min"},
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"30 min"},
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"20 min"},
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"24 min"}
];

const customerslist = () => {
    return (
        <div className="customerslist" id="cust">
            <div className="listheader">
                <h3>Customers</h3>
            </div>
            <div className="listcontainer">
                <div className="list12">
                    <div className="detailss">
                        <h3>Name</h3>
                    </div>
                    <div className="detailss">
                        <h3>Email</h3>
                    </div>
                    <div className="detailss">
                        <h3>Time to go out</h3>
                    </div>
                </div>
                {customers.map((person, index) => (
                    <div className="list11" key={index}>
                        <div className="details">
                            <img src={person.image} alt={person.name} />
                            <h3>{person.name}</h3>
                        </div>
                        <span>{person.email}</span>
                        <span>{person.timetogoout}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default customerslist;
