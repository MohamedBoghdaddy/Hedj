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
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto" navbarScroll>
            <Nav.Item>
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/dashboard">
                Dashboard
              </Nav.Link>
            </Nav.Item>
            <NavDropdown title="Products" id="navbarScrollingDropdown">
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
            <Nav.Item>
              <Nav.Link as={Link} to="/cart">
                <FontAwesomeIcon icon={faCartShopping} />
                <span className="count">0</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/favorites">
                Favorites
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/contact">
                Contact Us
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/signup">
                Signup
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="text"
              placeholder="Search"
              className="form-control"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button className="search-button" onClick={handleSearch}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
