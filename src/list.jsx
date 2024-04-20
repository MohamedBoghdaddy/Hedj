import React from "react";
import "../src/list.css";
import imag1 from '/assets/bah.jpg';

const llist=[
    {image:imag1,name:"bahig mahmoud"},
    {image:imag1,name:"bahig mahmoud"},
    {image:imag1,name:"bahig mahmoud"}
]

const list=()=>{
    <div className="userlist">
         <div className="listheader">
            <h2>Users</h2>
         </div>
         <div className="listcontainer">
            {llist.map((user)=>(
                <div className="list">
                    <img src={user.image}alt={user.name} />
                </div>
            ) )}
         </div>
    </div>
};

export default list;