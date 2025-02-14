import { useState } from "react";
import { Navbar, Nav, Container, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Navbar.css";
import logo from "../../Assets/Images/eco-logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useLogout.js";

const MiniNavbar = () => {
  const [searchText, setSearchText] = useState("");
  const { state } = useAuthContext();
  const { logout } = useLogout();
  const { user, isAuthenticated } = state;

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      console.log(`Searching for: ${searchText}`);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleSearch();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Navbar expand="lg" className="mini-navbar navbar-light">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "80px", height: "57px", top: 0 }}
          />{" "}
        </Navbar.Brand>

        {/* Navbar Toggle */}
        <Navbar.Toggle
          aria-controls="navbarScroll"
          className="navbar-toggler"
        />

        {/* Navbar Links */}
        <Navbar.Collapse id="navbarScroll">
          <Nav className="ms-auto mini-navbar-nav">
            <Link to="/" className="nav-link">
              HOME
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/contact" className="nav-link">
              Contact Us
            </Link>

            {isAuthenticated && user ? (
              <Link to="/" className="nav-link" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <FontAwesomeIcon icon={faUser} /> Login
                </Link>
                <Link to="/signup" className="nav-link">
                  Signup
                </Link>
              </>
            )}
          </Nav>

          {/* Search Bar */}
          <Form className="d-flex mini-navbar-search">
            <Form.Control
              type="text"
              placeholder="Search"
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="search-button"
              onClick={handleSearch}
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MiniNavbar;
