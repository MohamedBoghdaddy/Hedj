import React from "react";
import Profileheader from "./profileheader";
import  "../src/profile.css";
import userimage from '../src/bah.jpg'
const profile = ()=>{
  return <div className="profile">
    <Profileheader/>
    <div className="userprofile">
      <div className="userdetails">
        <img src={userimage}alt="" />
        <h3 className="username">bahig mahmoud</h3>
      </div>
    </div>
  </div>
};
export default profile;