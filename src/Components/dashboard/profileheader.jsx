import React from "react";
import { BiEdit } from "react-icons/bi";


const Profileheader = ({ isCollapsed }) => {
  return (
    <div className={`proheader ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 className="profiletitle">{!isCollapsed && 'Profile'}</h2>
     
    </div>
  );
};

export default Profileheader;
