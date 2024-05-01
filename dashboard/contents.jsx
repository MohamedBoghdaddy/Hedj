import React from "react";
import Conheader from "./conheader";
import "../dashboard/contents.css";
import Card from "./card";
import Employeelist from "./employeelist";
import Customerslist from "./customerslist";



const contents = ()=>{
  return <div className="content">
    <Conheader />
    <Card />
    <Employeelist/>
    <Customerslist/>
   
  </div>;
};
export default contents;