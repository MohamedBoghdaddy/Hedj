import React from "react";
import {BiEdit} from "react-icons/bi"
const profileheader = ()=>{
  return ( 
        <div className="proheader">
            <h2 className="profiletitle">Profile</h2>
            <div className="edit">
                <BiEdit className="icon"/>
            </div>
        </div>
  );
};
export default profileheader;