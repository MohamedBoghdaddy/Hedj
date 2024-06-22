import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  NavDropdown,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCartShopping,
  faUser,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import logo from "../../Assets/Images/eco-logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/Navbar.css";
import Login from "../Loginsystem/Login"; // Adjust the import path
import SearchResultsList from "../Homepage/SearchResult";
const NavBar = () => {
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) =>
          user.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchResults(results);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  const handleLoginModalOpen = () => {
    setShowLoginModal(true);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  return (
    <Navbar expand="lg" className="navbar" variant="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "80px", height: "auto", top: 0 }}
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
            <ScrollLink to="view-collection" smooth className="nav-link">
              View Collection
            </ScrollLink>
            <NavDropdown
              title="Products"
              id="basic-nav-dropdown"
              show={showDropdown}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <NavDropdown.Item as={Link} to="/news2024" className="nav-link">
                NEWS 2024
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/kitchen" className="nav-link">
                KITCHEN
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/systems" className="nav-link">
                SYSTEMS
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sofas" className="nav-link">
                SOFAS
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/day-complements"
                className="nav-link"
              >
                DAY COMPLEMENTS
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/night-complements"
                className="nav-link"
              >
                NIGHT COMPLEMENTS
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/outdoor" className="nav-link">
                OUTDOOR
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/contact" className="nav-link">
              Contact Us
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard" className="nav-link">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/wishlist" className="nav-link">
              <FontAwesomeIcon icon={faHeart} />
            </Nav.Link>
            <Nav.Link className="nav-link" onClick={handleLoginModalOpen}>
              <FontAwesomeIcon icon={faUser} />
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
          {searchText && <SearchResultsList results={searchResults} />}
        </Navbar.Collapse>
      </Container>

      <Modal show={showLoginModal} onHide={handleLoginModalClose} centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Login /> {/* Render your existing login component here */}
        </Modal.Body>
      </Modal>
    </Navbar>
  );
};

export default NavBar;
