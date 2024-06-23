import React, { useState, useEffect } from "react";
import Profileheader from '../dashboard/profileheader';
import "../../Styles/profile.css";
import {
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from 'react-icons/bs';

const Profile = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastAdmins, setLastAdmins] = useState([]);

  useEffect(() => {
    const fetchLastAdmins = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/getlastadmins'); // Adjust the URL as needed
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setLastAdmins(data);
      } catch (error) {
        console.error('Error fetching last admins:', error);
      }
    };

    fetchLastAdmins();
  }, []);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

  return (
    <div className="profile">
      <div
        className={`userprofile ${isCollapsed ? 'collapsed' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Profileheader isCollapsed={isCollapsed} />
        <div className="userdetails">
          <h3 className="username">
            {lastAdmins.map((admin, index) => (
              <span key={index}>
                {admin.fname} {admin.lname}
                {index !== lastAdmins.length - 1 && <br />} {/* Add line break except for the last element */}
              </span>
            ))}
          </h3>
        </div>
        <button className="toggle-button">
          {isCollapsed ? '>' : '<'}
        </button>
        <div className="menulist">
          <a href="#dash" className="itemm">
            <BsGrid1X2Fill className="icon" />
            {!isCollapsed && 'Dashboard'}
          </a>
          <a href="#customer" className="itemm">
            <BsPeopleFill className="icon" />
            {!isCollapsed && 'Customers'}
          </a>
          <a href="#employe" className="itemm">
            <BsPeopleFill className="icon" />
            {!isCollapsed && 'Employees'}
          </a>
          <a href="#Report" className="itemm">
            <BsMenuButtonWideFill className="icon" />
            {!isCollapsed && 'Reports'}
          </a>
          <a href="##" className="itemm">
            <BsFillGearFill className="icon" />
            {!isCollapsed && 'Settings'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
