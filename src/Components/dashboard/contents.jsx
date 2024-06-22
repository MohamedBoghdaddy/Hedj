import React from "react";
import Conheader from "./conheader";
import "../../Styles/contents.css";

import Employeelist from "./employeelist";
import Customerslist from "./customerslist";




const contents = ()=>{
  return <div className="content">
    <Conheader />
    <Employeelist/>
    <Customerslist/>
  
  </div>;
};
export default contents;