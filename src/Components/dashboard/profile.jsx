import React, { useState, useRef } from "react";
import Profileheader from '../dashboard/profileheader';
import "../../Styles/profile.css";
import userimage from '../../Assets/Images/simple.jpg';
import { BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsMenuButtonWideFill, BsFillGearFill } from 'react-icons/bs';
import EmployeeList from '../dashboard/employeelist'; // Import the EmployeeList component

const Profile = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEmployeeListVisible, setIsEmployeeListVisible] = useState(false); // State variable to track employee list visibility
  const sidebarRef = useRef(null);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

  const handleEmployeeListToggle = () => {
    setIsEmployeeListVisible(!isEmployeeListVisible);
  };

  return (
    <div className="profile">
      <div
        className={`userprofile ${isCollapsed ? 'collapsed' : ''}`}
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Profileheader isCollapsed={isCollapsed} />
        <div className="userdetails">
          <img src={userimage} alt="" />
          <h3 className="username">Tommy Peter</h3>
        </div>
        
        <div className={`menulist ${isCollapsed ? 'collapsed' : ''}`}>
          {/* Modify the button to toggle employee list visibility */}
          <a className="item" onClick={handleEmployeeListToggle}>
            <BsPeopleFill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Employees'}
          </a>
          
          <a href="#dash" className="item">
            <BsGrid1X2Fill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Dashboard'}
          </a>
          <a href="##" className="item">
            <BsFillArchiveFill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Products'}
          </a>
          <a href="##" className="item">
            <BsFillGrid3X3GapFill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Categories'}
          </a>
          <a href="#cust" className="item">
            <BsPeopleFill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Customers'}
          </a>
          <a href="##" className="item">
            <BsMenuButtonWideFill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Reports'}
          </a>
          <a href="##" className="item">
            <BsFillGearFill className={`icon ${isCollapsed ? 'big-icon' : ''}`} />
            {!isCollapsed && 'Settings'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
