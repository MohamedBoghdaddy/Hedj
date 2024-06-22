import React, { useState, useRef } from "react";
import Profileheader from "../dashboard/profileheader";
import userimage from "../../Assets/Images/simple.jpg";
import {
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from "react-icons/bs";
import "../../Styles/profile.css";

const Profile = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
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
        <button className="toggle-button">{isCollapsed ? ">" : "<"}</button>
        <div className="menulist">
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
          <a href="#emplo" className="item">
            <BsPeopleFill className="icon" />
            {!isCollapsed && "Employees"}
          </a>
          <a href="##" className="item">
            <BsMenuButtonWideFill className="icon" />
            {!isCollapsed && "Reports"}
          </a>
          <a href="##" className="item">
            <BsFillGearFill className="icon" />
            {!isCollapsed && "Settings"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
