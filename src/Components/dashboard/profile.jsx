import React, { useState, useRef } from "react";
import Profileheader from "../dashboard/profileheader";
import "../../Styles/profile.css";
<<<<<<< HEAD
import userimage from "../../Assets/Images/simple.jpg";
import {
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from "react-icons/bs";
import EmployeeList from "../dashboard/profileheader";
=======
import userimage from '../../Assets/Images/simple.jpg';
import { BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsMenuButtonWideFill, BsFillGearFill } from 'react-icons/bs';
import EmployeeList from '../dashboard/employeelist'; // Import the EmployeeList component
>>>>>>> 2cd65af907eab3a1f14042d341d8e298f6fd10b1

const Profile = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEmployeeListVisible, setIsEmployeeListVisible] = useState(false); // State variable to track employee list visibility
  const sidebarRef = useRef(null);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

<<<<<<< HEAD
  // Function to toggle the visibility of the employee list
  const toggleEmployeeList = () => {
    setIsEmployeeListVisible((prevState) => !prevState);
=======
  const handleEmployeeListToggle = () => {
    setIsEmployeeListVisible(!isEmployeeListVisible);
>>>>>>> 2cd65af907eab3a1f14042d341d8e298f6fd10b1
  };

  return (
    <div className="profile">
      <div
        className={`userprofile ${isCollapsed ? "collapsed" : ""}`}
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Profileheader isCollapsed={isCollapsed} />
        <div className="userdetails">
          <img src={userimage} alt="" />
          <h3 className="username">Tommy Peter</h3>
        </div>
<<<<<<< HEAD
        <button className="toggle-button">{isCollapsed ? ">" : "<"}</button>
        <div className="menulist">
          {/* Modify the button to toggle employee list visibility */}
          <button className="item" onClick={toggleEmployeeList}>
            <BsPeopleFill className="icon" />
            {!isCollapsed && "Employees"}
          </button>
          {/* Render EmployeeList component based on visibility state */}
          {isEmployeeListVisible && <EmployeeList />}
          {/* Other menu items */}
          <a href="#dash" className="item">
            <BsGrid1X2Fill className="icon" />
            {!isCollapsed && "Dashboard"}
          </a>
          <a href="##" className="item">
            <BsFillArchiveFill className="icon" />
            {!isCollapsed && "Products"}
          </a>
          <a href="##" className="item">
            <BsFillGrid3X3GapFill className="icon" />
            {!isCollapsed && "Categories"}
          </a>
          <a href="#cust" className="item">
            <BsPeopleFill className="icon" />
            {!isCollapsed && "Customers"}
          </a>
          <a href="##" className="item">
            <BsMenuButtonWideFill className="icon" />
            {!isCollapsed && "Reports"}
          </a>
          <a href="##" className="item">
            <BsFillGearFill className="icon" />
            {!isCollapsed && "Settings"}
=======
        
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
>>>>>>> 2cd65af907eab3a1f14042d341d8e298f6fd10b1
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
