import React from "react";
import{BsCart3,BsGrid1X2Fill,BsFillArchiveFill,BsFillGrid3X3GapFill,BsPeopleFill,BsListCheck,BsMenuButtonWideFill,BsFillGearFill} from 'react-icons/bs';
import "../src/sidebar.css";

function Sidebar(){
    return(
        <div className="menul">
            <div className="logo">
                <BsCart3 className="logoicon"/>
                <h2>company name</h2>
            </div>
            <div className="menulist">
                <a href="##" className="item">
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

                <a href="##" className="item">
                    <BsPeopleFill className="icon" />
                    Customers
                </a>

                <a href="##" className="item">
                    <BsListCheck className="icon" />
                    inventory
                </a>

                <a href="##" className="item">
                    <BsMenuButtonWideFill className="icon"/>
                    Reports
                </a>

                <a href="##" className="item">
                    <BsFillGearFill className="icon" />
                    Settings
                </a>
            </div>
        </div>
    )
}
export default Sidebar