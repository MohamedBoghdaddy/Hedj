import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  NavDropdown,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import logo from "../../Assets/Images/eco-logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/Navbar.css";

const NavBar = () => {
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = () => {
    console.log(`Searching for: ${searchText}`); // Example search action
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <Navbar expand="lg" className="navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "40px", height: "auto" }}
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="navbarScroll"
          className="navbar-toggler"
        />
        <Navbar.Collapse id="navbarScroll" className="navbar-collapse">
          <Nav className="navbar-nav" navbarScroll>
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            <div className="dropdown">
              <button
                onClick={toggleDropdown}
                className="dropdown-toggle allcategories"
              >
                Products
              </button>
              {showDropdown && (
                <div className="dropdown-content show">
                  <Link to="/news2024" className="item">
                    NEWS 2024
                  </Link>
                  <Link to="/kitchen" className="item">
                    KITCHEN
                  </Link>
                  <Link to="/systems" className="item">
                    SYSTEMS
                  </Link>
                  <Link to="/sofas" className="item">
                    SOFAS
                  </Link>
                  <Link to="/day-complements" className="item">
                    DAY COMPLEMENTS
                  </Link>
                  <Link to="/night-complements" className="item">
                    NIGHT COMPLEMENTS
                  </Link>
                  <Link to="/outdoor" className="item">
                    OUTDOOR
                  </Link>
                </div>
              )}
            </div>

            <Link to="/cart" className="nav-link">
              <FontAwesomeIcon icon={faCartShopping} />
              <span className="count">0</span>
            </Link>

            <Link to="/favorites" className="nav-link">
              Favorites
            </Link>
            <Link to="/contact" className="nav-link">
              Contact Us
            </Link>
            <Link to="/Login" className="nav-link">
              Login
            </Link>
            <Link to="/Signup" className="nav-link">
              Signup
            </Link>
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="text"
              placeholder="Search"
              className="form-control"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="search-button" onClick={handleSearch}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
