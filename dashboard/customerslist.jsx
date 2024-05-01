import React from "react";
import "../dashboard/lists.css";
import employeeimage from '../dashboard/simple.jpg.jpg';


const customers=[
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"10 min"},
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"30 min"},
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"20 min"},
    {image: employeeimage, name:"Tommy Peter", email:"Tommypeter24@gmail.com", timetogoout:"24 min"}
];

const customerslist =()=>{
    return(
        <div className="customerslist" id="cust">
            <div className="listheader">
                <h3>Customers</h3>
            </div>
            <div className="listcontainer">
               {customers.map((person)=>(
                    <div className="list1">
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