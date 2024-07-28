import React, { useState, useEffect } from 'react';
import { Navbar, Container, Button, Modal } from 'react-bootstrap';
import { List, Bell } from 'lucide-react';
import SidebarMembersDashboard from './CompMembersDashboard';
import MainMembComponent from './MainMembComponent';
import { useAuth } from '../../Contexts/AuthContext';
import { db, doc, getDoc } from '../../Components/Services/firebaseConfig'; // Adjust according to your firebase setup

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [userDetails, setUserDetails] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchUserDetails = async () => {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("No such document!");
        }
      };

      fetchUserDetails();
    }
  }, [currentUser]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
    <div className={`dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand className="mx-auto">Dashboard</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Button onClick={toggleSidebar} className="sidebar-toggle">
              <List size={20} />
            </Button>
            <Button className="notification-toggle">
              <Bell size={20} />
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} activeItem={activeItem} setActiveItem={setActiveItem} />

      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <MainContent activeItem={activeItem} navigate={navigate} userDetails={userDetails} setUserDetails={setUserDetails} />
      </main>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            No
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
