import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import QrScanner from 'react-qr-scanner';

const UserAttendancePage = () => {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // Default to back camera
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const qrScannerRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const checkLastAttendance = async (userId, churchId) => {
    const db = getFirestore();
    const attendanceRef = doc(db, 'attendance', `${userId}_${churchId}`);
    const attendanceDoc = await getDoc(attendanceRef);
    return attendanceDoc.exists();
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const scannedData = JSON.parse(data.text);
        
        if (scannedData.type !== 'church_attendance') {
          setError('Invalid QR code. Please scan the correct attendance QR code.');
          return;
        }

        const hasAttended = await checkLastAttendance(user.uid, scannedData.churchId);
        if (hasAttended) {
          setMessage("You've already taken attendance for this service");
          setScanning(false);
          return;
        }

        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        const firstName = userData?.firstName || '';
        const lastName = userData?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        const attendanceRef = doc(db, 'attendance', `${user.uid}_${scannedData.churchId}`);
        await setDoc(attendanceRef, {
          userId: user.uid,
          email: user.email,
          fullName: fullName,
          attendanceTime: Timestamp.now(),
          churchId: scannedData.churchId
        });
        setScanned(true);
        setScanning(false);
        setMessage('Attendance recorded successfully!');
      } catch (err) {
        setError('Failed to record attendance. Please try again.');
        console.error('Error recording attendance:', err);
      }
    }
  };

  const handleError = (err) => {
    setError('Error scanning QR code. Please try again.');
    console.error(err);
  };

  const startScanning = () => {
    setScanning(true);
    setError('');
    setMessage('');
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };

  if (!user) {
    return <Container>Please log in to take attendance.</Container>;
  }

  return (
    <Container>
      <h1>Take Attendance</h1>
      {!scanning && !scanned && !message && (
        <Button onClick={startScanning}>Check-in for today's service</Button>
      )}
      {scanning && (
        <div>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            facingMode={facingMode}
          />
          <p>Please scan the QR code displayed in the church.</p>
          <Row className="mt-3">
            <Col>
              <Button onClick={toggleCamera}>
                Switch to {facingMode === "user" ? "Back" : "Front"} Camera
              </Button>
            </Col>
            <Col>
              <Button variant="danger" onClick={stopScanning}>
                Stop Scanning
              </Button>
            </Col>
          </Row>
        </div>
      )}
      {message && <Alert variant="info">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
    </Container>
  );
};

export default UserAttendancePage;