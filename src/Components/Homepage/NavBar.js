import React, { useState } from "react";
import { Navbar, Nav, Container, Form, NavLink, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"; // Import the correct icon
import "../../Styles/Navbar.css"; // CSS for the NavBar
import logo from "../../Assets/Images/eco-logo.png"; // Your company logo
import { Link } from "react-router-dom";
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';







const NavBar = () => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    console.log(`Searching for: ${searchText}`); // Example search action
  };

  return (
<Navbar expand="lg" className="navbar">
  <Container fluid>
    <Navbar.Brand as={NavLink} to="/" className="navbar-brand">
      <img src={logo} alt="Company Logo" style={{ width: "40px", height: "auto" }} />
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="navbarScroll" className="navbar-toggler" /> 
         <Navbar.Collapse id="navbarScroll" className="navbar-collapse">


          <Nav className="navbar-nav" navbarScroll>
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            <Link to="/Products" className="nav-link">
             <Button className="allcategories">Products</Button> 
            </Link>
           
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
              login
            </Link>
            <Link to="/Signup" className="nav-link">
              Signup
            </Link>
          </Nav>
          <Form className="d-flex ">
         
            {/* Flexbox with vertical alignment */}
            <Form.Control
              type="text"
              placeholder="Search"
              className="form-control"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="search-button" onClick={handleSearch}>
             
              {/* Button-like icon */}
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;


