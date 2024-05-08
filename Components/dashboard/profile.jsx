import React from "react";
import Profileheader from "./profileheader";
import "../../Styles/profile.css";
import userimage from "../../Assets/Images/simple.jpg.jpg";
const profile = () => {
  return (
    <div className="profile">
      <div className="userprofile">
        <Profileheader />
        <div className="userdetails">
          <img src={userimage} alt="" />
          <h3 className="username">tommy Peter</h3>
        </div>
      </div>
    </div>
  );
};
export default profile;
