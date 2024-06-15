import React from "react";
import "../../Styles/Products.css";
import { Link } from "react-router-dom";

function Products() {
  /*const Menus=['Profile', "apps", "settings"]; */
  return (
    <div className="container">
      <ul className="first">
        <li>News 2024</li>
        <li>KITCHEN</li>
        <li>SOFAS</li>
        <li>DAY COMPLEMENTS</li>
      </ul>
      <div>
        <ul className="second">
          <li>
            {" "}
            <Link to="/Kitchen" className="nav-link">
              Kitchens
            </Link>
          </li>
          <li>
            <Link to="/Bedrooms" className="nav-link">
              Bedrooms
            </Link>{" "}
          </li>
        </ul>
      </div>
    </div>


/*<div className="dropdown">
  <ul>
    {
      Menus.map((menu)=>(

        <li key={menu}>{menu}</li>
      ))
    }
  </ul>
</div>*/



  );
}

export default Products;
