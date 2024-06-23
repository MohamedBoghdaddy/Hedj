import React, { useState } from "react";
import { Link } from "react-router-dom";
// import Kitcard from "./Kitchen"
import "../../Styles/Products.css";

const ProductsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        Products
      </button>
      <div className={`dropdown-menu ${isOpen ? "show" : ""}`}>
        <Link to="/news2024" className="dropdown-item">
          NEWS 2024
        </Link>
        <Link to="/kitchen" className="dropdown-item">
          KITCHEN
        </Link>
        <Link to="/systems" className="dropdown-item">
          SYSTEMS
        </Link>
        <Link to="/sofas" className="dropdown-item">
          SOFAS
        </Link>
        <Link to="/day-complements" className="dropdown-item">
          DAY COMPLEMENTS
        </Link>
        <Link to="/night-complements" className="dropdown-item">
          NIGHT COMPLEMENTS
        </Link>
        <Link to="/outdoor" className="dropdown-item">
          OUTDOOR
        </Link>
      </div>
      <div className="products-container">
        {/* Include Kitcard to display kitchen products */}
      </div>

    </div>
  );
};

export default ProductsDropdown;
