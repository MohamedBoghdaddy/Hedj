import React, { useState } from "react";
import {
  BsCart3,
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from "react-icons/bs";
import { Outlet } from "react-router-dom"; // Include NavLink for internal routing

import "../../Styles/dashboard.css";
import { Link } from "react-router-dom";

function Dashboard() {
  const [showItems, setShowItems] = useState(false);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="menulist">
          <div className="logo">
            <BsCart3 className="logoicon" />
            <h2>HEDJ</h2>
          </div>
          <button
            className="menu-toggle"
            onClick={() => setShowItems(!showItems)}
          >
            <BsMenuButtonWideFill className="toggle-icon" />
          </button>
          {showItems && (
            <React.Fragment>
               <Link to="/" className="nav-link">
              Home
            </Link>
              <a href="#dash" className="item">
                <BsGrid1X2Fill className="icon" />
                Dashboard
              </a>
              <a href="##" className="item">
                <BsFillArchiveFill className="icon" />
                Products
              </a>
              <a href="##" className="item">
                <BsFillGrid3X3GapFill className="icon" />
                Categories
              </a>
              <a href="#cust" className="item">
                <BsPeopleFill className="icon" />
                Customers
              </a>
              <a href="#emplo" className="item">
                <BsPeopleFill className="icon" />
                Employees
              </a>

              <a href="##" className="item">
                <BsMenuButtonWideFill className="icon" />
                Reports
              </a>
              <a href="##" className="item">
                <BsFillGearFill className="icon" />
                Settings
              </a>
            </React.Fragment>
          )}
        </div>
        <div className="content">
          <Outlet /> {/* Where the routed components will be displayed */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
