
import React, { useEffect, useState } from "react";
import { Button, Container, Row, Col,   Alert, Image, Spinner  } from "react-bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import AttendanceImage from "../../assets/Images/attendance.jpeg";
import QrScanner from "react-qr-scanner";
// import { db } from '../../Components/Services/firebaseConfig';

import {  Book } from "lucide-react";
import Navbar from '../Layouts/CustomNavbar.jsx';
import Footer from './Footer.jsx';
import './Tlbc.css';

function HomePage() {

    const [buttonsVisible, setButtonsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraId, setCameraId] = useState("environment");
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Get available cameras
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        // Set the back camera as default
        const backCamera = videoDevices.find((device) =>
          device.label.toLowerCase().includes("back")
        );
        setCameraId(
          backCamera
            ? backCamera.deviceId
            : videoDevices[0]
            ? videoDevices[0].deviceId
            : null
        );
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
        setError("Unable to access camera. Please check your device settings.");
      });

    return () => unsubscribe();
  }, []);

  const getUserDetails = async (userId) => {
    const db = getFirestore();
    const userDocRef = doc(db, "users", userId);
    const firsttimerDocRef = doc(db, "firsttimers", userId);

    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }

    const firsttimerDoc = await getDoc(firsttimerDocRef);
    if (firsttimerDoc.exists()) {
      return firsttimerDoc.data();
    }

    return null;
  };

  const recordAttendance = async (userId, churchId) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const attendanceRef = doc(collection(db, "tlbc2024"), `${userId}_${churchId}`);
      const attendanceDoc = await getDoc(attendanceRef);

      if (attendanceDoc.exists()) {
        setMessage("You've already taken attendance for this session");
        setLoading(false);
        return false;
      }

      const userData = await getUserDetails(userId);

      if (!userData) {
        setError("User details not found. Please contact the Chairman of TLBC'24.");
        setLoading(false);
        return false;
      }

      const firstName = userData?.firstName || "";
      const lastName = userData?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();

      await setDoc(attendanceRef, {
        userId: userId,
        email: user.email,
        fullName: fullName,
        attendanceTime: Timestamp.now(),
        churchId: churchId,
        church: userData.church || "",
        zone: userData.zone || "",
        phone: userData.phone || "",
      });

      setMessage("Attendance recorded successfully!");
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error recording attendance:", err);
      if (err.code === "permission-denied") {
        setError("Permission denied. Please contact your administrator.");
      } else {
        setError("Failed to record attendance. Please try again.");
      }
      setLoading(false);
      return false;
    }
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const scannedData = JSON.parse(data.text);

        if (scannedData.type !== "tlbc_attendance") {
          setError(
            "Invalid QR code. Please scan the correct attendance QR code."
          );
          return;
        }

        setScanning(false);
        const success = await recordAttendance(user.uid, scannedData.churchId);
        if (success) {
          setScanned(true);
        }
      } catch (err) {
        console.error("Error processing QR code:", err);
        setError("Failed to process QR code. Please try again.");
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner error:", err);
    setError("Error scanning QR code. Please try again.");
  };

  const startScanning = () => {
    setScanning(true);
    setError("");
    setMessage("");
  };

  const goHome = () => {
      navigate('/dashboard');  
    }

  const stopScanning = () => {
    setScanning(false);
  };

  const toggleCamera = () => {
    const currentIndex = cameras.findIndex(
      (camera) => camera.deviceId === cameraId
    );
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCameraId(cameras[nextIndex].deviceId);
  };

  if (!user) {
    return <Container>Please log in to take attendance.</Container>;
  }






  return (
    <>
      
<Navbar />
      <section className="hero-sectionn" id="section_1">
      <div className="video-container">
        <video autoPlay loop muted className="hero-video">
          <source src="/images/TLBC24Animation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
        <div className="section-overlay"></div>

        <div className="container hero-content">
          <div className="row">











            <div className="col-12 mt-auto mb-5 text-center" id='homee'>
              <small className='text-white'>The Lord's Brethren Church International Presents</small>
              <h2 className="text-white mb-1">The Lord's Brethren Convocation '24</h2>
            </div>


<div className="col-12 mt-auto mb-5 text-center">


{!scanning && !scanned && !message && (
        <Button onClick={startScanning} className="d-block mx-auto mt-4 w-50 mb-4" 
        style={{backgroundColor: "#EE5007",  border: "none", fontWeight: "bolder", height: "3em"}}>
          Check-in for today's session
        </Button>
        
      )}
      {scanning && (
        <div>
          <QrScanner
            delay={180}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "100%" }}
            constraints={{
              video: { deviceId: cameraId },
            }}
          />
          <p style={{color: "white"}}>Please scan the QR code displayed in the church.</p>
          <Row className="mt-3">
            <Col>
              <Button onClick={toggleCamera} disabled={cameras.length <= 1} 
              style={{backgroundColor: "#EE5007",  border: "none", fontWeight: "bolder"}}>
                Switch Camera
              </Button>
            </Col>
            <Col>
              <Button variant="danger" onClick={stopScanning}
              style={{backgroundColor: "#EE5007",  border: "none", fontWeight: "bolder",}}>
                Stop Scanning
              </Button>
            </Col>
          </Row>
        </div>
      )}
      {loading && (
        <Spinner animation="border" role="status">
          <span className="sr-only"></span>
        </Spinner>
      )}
      {message && <Alert variant="info">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}


</div>


            
            <div className="col-lg-12 col-12 d-flex flex-column flex-lg-row text-center" id='homeee'>


           
              <div className="date-wrap">
                <h5 className="text-white">
                  <i className="custom-icon bi-clock me-2"></i>
                  31st Aug - 4th Sept<sup></sup>, 2024
                </h5>
              </div>

         

              <div className="location-wrap mx-auto py-3 py-lg-0">
                <h5 className="text-white">
                  <i className="custom-icon bi-geo-alt me-2"></i>
                  Kingdom City Prayer Camp, Awka.
                </h5>
              </div>
            </div>

            <div
                        className={`button-container ${
                          buttonsVisible ? "fade-in" : ""
                        }`}
                        style={{ zIndex: 2, marginTop: "1rem",  marginBottom: "2rem" }}
                      >

                      </div>



          </div>
        </div>
        
        <div className="video-wrap">
          <video autoPlay="" loop="" muted="" className="custom-video" poster="">
              <source src="public/images/" type="video/mp4/TLBC24Abimation.mp4"/>
              Your browser does not support the video tag.
          </video>
        </div>
      </section>

      

      

      

      <Footer />
    </>
  )
}

export default HomePage
