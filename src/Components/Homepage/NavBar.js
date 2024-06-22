import React, { useState } from "react";
import { Navbar, Nav, Container, Form, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import logo from "../../Assets/Images/eco-logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/Navbar.css";

const NavBar = () => {
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = () => {
    console.log(`Searching for: ${searchText}`);
    // Implement your search logic here
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <Navbar expand="lg" className="navbar" variant="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "40px", height: "auto" }}
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="navbar-toggler"
        />
        <Navbar.Collapse id="navbarScroll" className="navbar-collapse">
          <Nav className="navbar-nav ms-auto" navbarScroll>
            <ScrollLink to="hero-section" smooth className="nav-link">
              Home
            </ScrollLink>
            <ScrollLink to="about-us" smooth className="nav-link">
              About Us
            </ScrollLink>
            <ScrollLink to="view-collection" smooth className="nav-link">
              View Collection
            </ScrollLink>
            <ScrollLink to="find-us" smooth className="nav-link">
              Find Us
            </ScrollLink>
            <NavDropdown
              title="Products"
              id="basic-nav-dropdown"
              show={showDropdown}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <NavDropdown.Item as={Link} to="/news2024">
                NEWS 2024
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/kitchen">
                KITCHEN
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/systems">
                SYSTEMS
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sofas">
                SOFAS
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/day-complements">
                DAY COMPLEMENTS
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/night-complements">
                NIGHT COMPLEMENTS
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/outdoor">
                OUTDOOR
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/favorites" className="nav-link">
              Favorites
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" className="nav-link">
              Contact Us
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="nav-link">
              Login
            </Nav.Link>
            <Nav.Link as={Link} to="/signup" className="nav-link">
              Signup
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" className="nav-link">
              <FontAwesomeIcon icon={faCartShopping} />
              <span className="count">0</span>
            </Nav.Link>
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
