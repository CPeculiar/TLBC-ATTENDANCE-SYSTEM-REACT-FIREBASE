import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "../Services/firebaseConfig";
import '../../App.css'


function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileVisible, setProfileVisible] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editDetails, setEditDetails] = useState({
    phone: '',
    city: '',
    state: '',
    country: '',
    church: '',
    zone: ''
  });

  useEffect(() => {
    if (currentUser) {
      const fetchUserDetails = async () => {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setEditDetails({
            phone: docSnap.data().phone,
            city: docSnap.data().address.city,
            state: docSnap.data().address.state,
            country: docSnap.data().address.country,
            church: docSnap.data().church,
            zone: docSnap.data().zone
          });
        } else {
          console.log("No such document!");
        }
      };

      fetchUserDetails();
    }
  }, [currentUser]);

  const handleTakeAttendance = () => {
    navigate('/attendance');
  };

  const toggleProfile = () => {
    setProfileVisible(!profileVisible);
  };
  
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  const handleEditChange = (e) => {
    setEditDetails({ ...editDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        phone: editDetails.phone,
        address: {
          city: editDetails.city,
          state: editDetails.state,
          country: editDetails.country
        },
        church: editDetails.church,
        zone: editDetails.zone
      });
      setUserDetails(prevDetails => ({
        ...prevDetails,
        phone: editDetails.phone,
        address: {
          city: editDetails.city,
          state: editDetails.state,
          country: editDetails.country
        },
        church: editDetails.church,
        zone: editDetails.zone
      }));
      setEditMode(false);
      toggleProfile();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  if (profileVisible) {
    return (
      <div className="profile-container">
        <button className="close-button" onClick={toggleProfile}>X</button>
        <h3>Profile Details</h3>
        {editMode ? (
          <div>
            <div className="form-group">
              <label>Phone:</label>
              <input type="text" name="phone" value={editDetails.phone} onChange={handleEditChange} className="form-control"/>
            </div>
            <div className="form-group">
              <label>City:</label>
              <input type="text" name="city" value={editDetails.city} onChange={handleEditChange} className="form-control"/>
            </div>
            <div className="form-group">
              <label>State:</label>
              <input type="text" name="state" value={editDetails.state} onChange={handleEditChange} className="form-control"/>
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input type="text" name="country" value={editDetails.country} onChange={handleEditChange} className="form-control"/>
            </div>
            <div className="form-group">
              <label>Church:</label>
              <input type="text" name="church" value={editDetails.church} onChange={handleEditChange} className="form-control"/>
            </div>
            <div className="form-group">
              <label>Zone:</label>
              <input type="text" name="zone" value={editDetails.zone} onChange={handleEditChange} className="form-control"/>
            </div>
            <button onClick={handleSave} className="btn btn-success">Save</button>
          </div>
        ) : (
          <div>
            <p><strong>First Name:</strong> {userDetails.firstName}</p>
            <p><strong>Last Name:</strong> {userDetails.lastName}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Phone:</strong> {userDetails.phone}</p>
            <p><strong>Date of Birth:</strong> {userDetails.dateOfBirth}</p>
            <p><strong>City:</strong> {userDetails.address.city}</p>
            <p><strong>State:</strong> {userDetails.address.state}</p>
            <p><strong>Country:</strong> {userDetails.address.country}</p>
            <p><strong>Church:</strong> {userDetails.church}</p>
            <p><strong>Zone:</strong> {userDetails.zone}</p>
            <button onClick={() => setEditMode(true)} className="btn btn-primary">Edit</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-end">
        <div className="col-md-1">
          <div className="profile-icon" onClick={toggleProfile} style={{ cursor: 'pointer' }}>
            <img src="https://via.placeholder.com/40" alt="Profile" className="rounded-circle" />
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Dashboard</h2>
              <p>Welcome, {userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : ''}</p>
              <div className="d-flex flex-column align-items-center">
                <button onClick={handleTakeAttendance} className="btn btn-primary mb-4 w-50">
                  Take Attendance for Today's Service
                </button>
                <button onClick={handleLogout} className="btn btn-danger w-50">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
