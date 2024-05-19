import React from "react";
import{BsSearch} from 'react-icons/bs';
import{BiNotification} from 'react-icons/bi';

const conheader = ()=>{
  return <div className="contenth"id="dash">
            <h1 className="htitle" >Dashboard</h1>
            <div className="activity">
                        <div className="searchbox">
                                <input type="text" class="text" placeholder="Search Here" />
                                <BsSearch className="iconn"/>
                        </div>
                    <div className="notify">
                        <BiNotification className="icon"/>
                    </div>
            </div>
  </div>;
};
export default conheader;
