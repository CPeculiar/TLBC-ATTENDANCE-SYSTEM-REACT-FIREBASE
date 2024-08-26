import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { Container, Form, Button, Alert, Table, Pagination, Modal, Col, Image  } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const TLBCAttendanceReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [churchId, setChurchId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMode, setFilterMode] = useState(false);
  const [firstTimers, setFirstTimers] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const db = getFirestore();
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMostRecentAttendance();
  }, []);

  const fetchMostRecentAttendance = async () => {
    setLoading(true);
    setError('');
    
    try {
      const attendanceRef = collection(db, 'tlbc2024');
      const recentQuery = query(attendanceRef, orderBy('attendanceTime', 'desc'), limit(1));
      const querySnapshot = await getDocs(recentQuery);
      
      if (!querySnapshot.empty) {
        const mostRecentDoc = querySnapshot.docs[0];
        const mostRecentData = mostRecentDoc.data();
        setSelectedDate(mostRecentData.attendanceTime.toDate());
        await fetchAttendanceData(mostRecentData.attendanceTime.toDate());
      } else {
        setError('No attendance records found.');
        setAttendanceData([]);
        setChurchId('');
      }
    } catch (error) {
      setError('Error fetching recent attendance data: ' + error.message);
      setAttendanceData([]);
      setChurchId('');
    }
    setLoading(false);
  };

  const fetchAttendanceData = async (date) => {
    setLoading(true);
    setError('');
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const attendanceRef = collection(db, 'tlbc2024');
      const usersRef = collection(db, 'users');
      const firstTimersRef = collection(db, 'firsttimers');

      const dateQuery = query(
        attendanceRef,
        where('attendanceTime', '>=', startOfDay),
        where('attendanceTime', '<=', endOfDay),
        orderBy('attendanceTime', 'asc')
      );

      const firstTimersQuery = query(
        firstTimersRef,
        where('visitDate', '>=', startOfDay),
        where('visitDate', '<=', endOfDay)
      );
      
      const [attendanceSnapshot, firstTimersSnapshot] = await Promise.all([
        getDocs(dateQuery),
        getDocs(firstTimersQuery)
      ]);
      
      const attendanceRecords = await Promise.all(attendanceSnapshot.docs.map(async (attendanceDoc) => {
        const attendanceData = attendanceDoc.data();
        let userData;
        let isFirstTimer = false;
        
        // Check in users collection first
        const userRef = doc(db, 'users', attendanceData.userId);
      let userDoc = await getDoc(userRef);

        // If not found in users, check in firsttimers
        if (!userDoc.exists()) {
        const firstTimerRef = doc(db, 'firsttimers', attendanceData.userId);
        userDoc = await getDoc(firstTimerRef);
        isFirstTimer = true;
      }
      
      userData = userDoc.data();
        
      return {
        id: attendanceDoc.id,
        ...attendanceData,
        fullName: attendanceData.fullName || `${userData?.firstName} ${userData?.lastName}`,
        phone: userData?.phone,
        zone: userData?.zone,
        church: attendanceData.church,
        role: isFirstTimer ? 'First Timer' : 'User',
        userId: attendanceData.userId,
        isFirstTimer
      };
    }));

      const firstTimerCount = firstTimersSnapshot.size;

      if (attendanceRecords.length > 0) {
        setAttendanceData(attendanceRecords);
        setChurchId(attendanceRecords[0]?.churchId || '');
        setTotalPages(Math.ceil(attendanceRecords.length / itemsPerPage));
        setFirstTimers(firstTimerCount);
      } else {
        setError('No attendance records found for the selected date.');
        setAttendanceData([]);
        setChurchId('');
        setFirstTimers(firstTimerCount);
      }
    } catch (error) {
      setError('Error fetching attendance data: ' + error.message);
      setAttendanceData([]);
      setChurchId('');
      setFirstTimers(0);
    }
    setLoading(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFilterMode(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAttendanceData(selectedDate);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>,
      );
    }
    return (
      <Pagination>
        <Pagination.Prev 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Pagination.Prev>
        {items}
        <Pagination.Next 
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </Pagination.Next>
      </Pagination>
    );
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 10, 10);
    doc.text(`Date: ${selectedDate.toDateString()}`, 10, 20);
    doc.text(`Total Attendance: ${attendanceData.length}`, 10, 30);
    doc.text(`First Timers: ${firstTimers}`, 10, 40);
    doc.autoTable({
      startY: 50,
      head: [['#', 'Full Name', 'Church', 'Attendance Time', 'Zone', 'Phone']],
      body: attendanceData.map((record, index) => [
        index + 1,
        record.fullName,
        record.church,
        record.attendanceTime.toDate().toLocaleString(),
        record.zone,
        record.phone,
        record.role
      ])
    });
    doc.save(`Attendance Report for ${selectedDate.toDateString()}.pdf`);
  };

  const currentAttendanceData = attendanceData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleShowProfile = async (userId, isFirstTimer) => {
    try {
      const userRef = doc(db, isFirstTimer ? 'firsttimers' : 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setSelectedProfile(userDoc.data());
        setShowProfile(true);
      } else {
        setError('User profile not found.');
      }
    } catch (error) {
      setError('Error fetching user profile: ' + error.message);
    }
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedProfile(null);
  };

  return (
    <Container fluid>
      <h2>View Attendance Record</h2>
      <Form onSubmit={handleSubmit} className='mb-2'>
        <div style={{textAlign: 'center'}}>
          <Form.Group>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
            />
          </Form.Group>
        </div>
        <Button type="submit" className='mt-3'>Fetch Attendance</Button>
      </Form>
      {loading && <p>Loading...</p>}
      {error && <Alert variant="danger">{error}</Alert>}
      {attendanceData.length > 0 && (
        <>
          <h3>{churchId}</h3>
          <p style={{fontWeight: 'bold'}}>Date: {selectedDate.toDateString()}</p>
          <p style={{fontWeight: 'bold'}}>Total attendance: {attendanceData.length}</p>
          <p style={{fontWeight: 'bold'}}>First Timers: {firstTimers}</p>
          <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Church</th>
            <th>Attendance Time</th>
            <th>Zone</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {currentAttendanceData.map((record, index) => (
            <tr key={record.id}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{record.fullName}</td>
              <td>{record.church}</td>
              <td>{record.attendanceTime.toDate().toLocaleString()}</td>
              <td>{record.zone}</td>
              <td>{record.phone}</td>
              <td>{record.role}</td>
              <td>
                <Eye
                  size={20}
                  onClick={() => handleShowProfile(record.userId, record.isFirstTimer)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {renderPagination()}
          <div style={{textAlign: 'center'}}>
            <Button onClick={downloadPDF} className='mt-3 ml-2' style={{width: '180px'}}>Download PDF</Button>   
          </div>
        </>
      )}

      <Modal show={showProfile} onHide={() => setShowProfile(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProfile && (
            
            <div>
            {selectedProfile.profilePictureUrl && (
                <div className="text-center mb-3">
                  <img
                    src={selectedProfile.profilePictureUrl}
                    alt="Profile"
                    style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                  />
                </div>
              )}

              {Object.entries(selectedProfile).map(([key, value]) => {
                // Skip displaying complex objects or functions
                if (key !== 'profilePictureUrl' && typeof value !== 'object' && typeof value !== 'function') {
                  return (
                    <p key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value.toString()}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>

  );
};

export default TLBCAttendanceReport;