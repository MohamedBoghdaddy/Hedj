import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ProfileHeader from "../dashboard/ProfileHeader";
import "../../Styles/profile.css";
import {
  BsGrid1X2Fill,
  BsPeopleFill,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from "react-icons/bs";

const Profile = ({ photoUrl }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastAdmins, setLastAdmins] = useState([]);

  useEffect(() => {
    const fetchLastAdmins = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/getlastadmins");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setLastAdmins(data);
      } catch (error) {
        console.error("Error fetching last admins:", error);
      }
    };
    fetchLastAdmins();
  }, []);

  return (
    <div className="profile">
      <div
        className={`userprofile ${isCollapsed ? "collapsed" : ""}`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <ProfileHeader isCollapsed={isCollapsed} />
        <div className="userdetails">
          <h3 className="username">
            {lastAdmins.map((admin) => (
              <span key={admin.id}>
                {admin.fname} {admin.lname}
              </span>
            ))}
          </h3>
          {photoUrl && (
            <img
              src={`http://localhost:8000/uploads/${photoUrl}`}
              alt="Profile"
            />
          )}
        </div>
        <button className="toggle-button">{isCollapsed ? ">" : "<"}</button>
        <nav className="menulist">
          {[
            { id: "dash", icon: BsGrid1X2Fill, text: "Dashboard" },
            { id: "customer", icon: BsPeopleFill, text: "Customers" },
            { id: "employee", icon: BsPeopleFill, text: "Employees" },
            { id: "report", icon: BsMenuButtonWideFill, text: "Reports" },
            { id: "photo", icon: BsFillGearFill, text: "Upload Photo" },
          ].map(({ id, icon: Icon, text }) => (
            <a key={id} href={`#${id}`} className="menu-item">
              <Icon className="icon" />
              {!isCollapsed && text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

Profile.propTypes = {
  photoUrl: PropTypes.string,
};

export default Profile;
