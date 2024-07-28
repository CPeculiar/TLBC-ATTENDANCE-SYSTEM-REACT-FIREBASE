import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../Services/firebaseConfig";
import { Users, Book, DollarSign, User, HelpCircle, LogOut } from 'lucide-react';
import '../Styles/MemberDashboard.css';

const Sidebar = ({ isOpen, toggleSidebar, activeItem, setActiveItem }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();  
  const [userDetails, setUserDetails] = useState(null);
  
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


  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img 
        src="https://firebasestorage.googleapis.com/v0/b/tlbc-attendance-and-data-systm.appspot.com/o/profilePictures%2FEUXBfE973eW34zdVwRkMfB1hmz82.jpg?alt=media&token=78ee2a52-1a1a-4d8a-89fa-9596cfde65da" 
        alt="Members" className="rounded-circle" />
        <div className="admin-info">
        <p>Welcome, {userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : ''}</p>
          <p className="admin-name">User Name</p>
          <p className="admin-role">Member</p>
        </div>
      </div>
      <ul className="sidebar-menu">
        <li className={activeItem === 'attendance' ? 'active' : ''} onClick={() => { setActiveItem('attendance'); toggleSidebar(); }}>
          <Users size={20} />
          <span>Attendance</span>
        </li>
        <li className={activeItem === 'devotional' ? 'active' : ''} onClick={() => { setActiveItem('devotional'); toggleSidebar(); }}>
          <Book size={20} />
          <span>Light of Life Devotional</span>
        </li>
        <li className={activeItem === 'giving' ? 'active' : ''} onClick={() => { setActiveItem('giving'); toggleSidebar(); }}>
          <DollarSign size={20} />
          <span>Givings</span>
        </li>
        <li className={activeItem === 'profile' ? 'active' : ''} onClick={() => { setActiveItem('profile'); toggleSidebar(); }}>
          <User size={20} />
          <span>Profile</span>
        </li>
        <li className={activeItem === 'support' ? 'active' : ''} onClick={() => { setActiveItem('support'); toggleSidebar(); }}>
          <HelpCircle size={20} />
          <span>Support</span>
        </li>
        <li className={activeItem === 'logout' ? 'active' : ''} onClick={() => { setActiveItem('logout'); toggleSidebar(); }}>
          <LogOut size={20} />
          <span>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
