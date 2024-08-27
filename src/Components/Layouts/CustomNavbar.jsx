import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import '../Styles/CustomNavbar.css';
import { useNavigate } from 'react-router-dom';

function CustomNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleHomeClick = () => {
    navigate('/');
    
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleFirstTimersClick = () => {
    navigate('/firsttimers');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
      <Container className="d-flex justify-content-between align-items-center custom-container">
        {/* <Navbar.Brand className="navbar-brand d-flex align-items-center" style={{color: "#ffc107 !important"}}> TLBC PORTAL
        </Navbar.Brand> */}
      <Navbar.Brand>  <h4 className="navbar-brands d-flex align-items-center"> TLBC </h4> </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto nav-links">
            <Nav.Link onClick={handleHomeClick}>Home</Nav.Link>
            <Nav.Link onClick={handleRegisterClick}>Register</Nav.Link>
            <Nav.Link onClick={handleFirstTimersClick}>First-Timers</Nav.Link>
            <Nav.Link onClick={handleLoginClick}>Login</Nav.Link>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default CustomNavbar;