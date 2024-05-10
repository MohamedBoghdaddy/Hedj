import React from "react";
import Conheader from "../dashboard/conheader";
import "../../Styles/contents.css";
import Card from "../dashboard/card";
import Employeelist from "../dashboard/employeelist";
import Customerslist from "../dashboard/customerslist";
import AppointmentList from "../dashboard/AppointmentList";



const contents = ()=>{
  return <div className="content">
    <Conheader />
    <Card />
    <Employeelist/>
    <Customerslist/>
    <AppointmentList/>
   
  </div>;
};
export default contents;