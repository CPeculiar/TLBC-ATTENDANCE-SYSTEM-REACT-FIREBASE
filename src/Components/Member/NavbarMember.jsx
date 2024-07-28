
import React, { useState, useEffect, useRef } from 'react';
import '../Styles/DashNavbar.css';


const DashNavbar = ({ onSignOut, isSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSignOutConfirm, setShowProfileSignOutConfirm] = useState(false);
  const [showSignOutConfirmModal, setShowSignOutConfirmModal] = useState(false);
  // const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  // const signOutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
        setShowProfileSignOutConfirm(false);
      }
      // if (signOutRef.current && !signOutRef.current.contains(event.target)) {
      //   setShowSignOutConfirm(false);
      // }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  }

  const handleSignOutClick = () => {
    setShowSignOutConfirmModal(true);
    l// setShowSignOutConfirm(!showSignOutConfirm);
    // setShowSignOutConfirm(true);
  };

  const handleProfileSignOutClick = () => {
    setShowProfileSignOutConfirm(!showProfileSignOutConfirm);
  };

  const handleConfirmSignOut = (confirm) => {
    if (confirm) {
      onSignOut();
    }
    setShowSignOutConfirmModal(false);
    setShowProfileSignOutConfirm(false);
  };

  return (
    <div className={`navbar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
      <div className="navbar-content">
        <div className="navbar-item" ref={notificationRef}>
          <button className="notification-icon" onClick={toggleNotifications}>
            🔔
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <ul>
                <li>A new Job was posted</li>
                <li>You have an unread message</li>
                <li>Three new applications were submitted</li>
              </ul>
            </div>
          )}
        </div>
        <div className='navbar-item' ref={profileRef}>
          <button className='profile-icon' onClick={toggleProfileMenu}>
            👤
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <ul>
                <li>View Profile</li>
                <li>Edit Profile</li>
                <li>Settings</li>
                <li>Help</li>
                <li onClick={handleSignOutClick}>Logout</li>
              </ul>
              {showProfileSignOutConfirm && (
                <div className="profile-sign-out-confirm">
                  <p>Are you sure you want to sign out?</p>
                  <button onClick={() => handleConfirmSignOut(true)}>Yes</button>
                  <button onClick={() => handleConfirmSignOut(false)}>No</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="navbar-item">
          <button className="sign-out-button" onClick={handleSignOutClick}>
            Sign Out
          </button>
        </div>
      </div>

      {showSignOutConfirmModal && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <button className='modal-close' onClick={() => setShowSignOutConfirmModal(false)}>X</button>
            <h3>Sign out</h3>
            <p>Are you sure you want to Sign out?</p>
            <div className='modal-btn'>
              <button className='btn1' onClick={() => handleConfirmSignOut(true)}>Yes</button>
              <button className='btn2' onClick={() => handleConfirmSignOut(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashNavbar;
