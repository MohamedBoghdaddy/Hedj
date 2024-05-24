import React from "react";
import Conheader from "./conheader";
import "../../Styles/contents.css";
import Card from "./card";
import Employeelist from "./employeelist";
import Customerslist from "./customerslist";
import AppointmentList from "./AppointmentList";



const contents = ()=>{
  return <div className="content">
    <Conheader />
    <Card />
    <Employeelist/>
    <Customerslist/>
    < AppointmentList/>
  </div>;
};
export default contents;