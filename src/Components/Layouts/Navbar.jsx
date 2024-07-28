import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import '../../App.css'

function CustomNavbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const getHomeLink = () => {
    if (currentUser) {
      // Replace `isAdmin` with your actual admin check
      return currentUser.isAdmin ? '/admindashboard' : '/dashboard';
    }
    return '/';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to={getHomeLink()} className="d-flex align-items-center">
         <h2 style={{color: 'white', textAlign: 'center'}}>TLBC MEMBERS PORTAL</h2>
        </Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to={getHomeLink()} className="nav-link-custom"></Nav.Link>
            {!currentUser && (
              <>
                <Nav.Link as={Link} to="/" className="nav-link-custom">Home</Nav.Link>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link-custom">Register</Nav.Link>
              </>
            )}
            {/* {currentUser && (
              <>            
              <Button onClick={handleLogout} variant="link" className="nav-link-custom">
                Logout
              </Button>
              </>
            )} */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
