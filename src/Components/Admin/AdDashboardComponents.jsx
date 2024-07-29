import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
// import { getDatabase, ref, get } from 'firebase/database';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, getFirestore, orderBy, limit } from 'firebase/firestore';
import { Card, Row, Col, Navbar, Container, Nav, Button, Alert, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { Bell, List, Calendar, Search as SearchIcon, Person, Gear, BoxArrowRight, Speedometer2 } from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import '../Styles/AdminDashboard.css'



// Main Dashboard Component
const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [churchId, setChurchId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const fetchAttendanceData = async (date) => {
    setError('');
    const formattedDate = formatDate(date);
      const db = getFirestore();
    const attendanceRef = ref(db, `attendance/${formattedDate}`);

    try {
      const snapshot = await get(attendanceRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const attendanceArray = Object.values(data);
        setAttendanceData(attendanceArray);
        setChurchId(attendanceArray[0].churchId);
      } else {
        setError('No attendance record found for the selected date.');
        setAttendanceData([]);
        setChurchId('');
      }
    } catch (error) {
      setError('Error fetching attendance data: ' + error.message);
      setAttendanceData([]);
      setChurchId('');
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  
  return (
    <div className="admin-dashboard">
      <Navbar bg="light" expand="lg" className="admin-dashboard-navbar">
        <Container fluid>
          <Navbar.Brand className="admin-dashboard-title">Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" style={{fontWeight: 'bold'}}>
              <Nav.Link onClick={() => setActiveComponent('dashboard')}><Speedometer2 /> Dashboard</Nav.Link>
              <Nav.Link onClick={() => setActiveComponent('attendance')}><List /> Attendance Report</Nav.Link>
              <Nav.Link onClick={() => setActiveComponent('events')}><Calendar /> Events</Nav.Link>
              <Nav.Link onClick={() => setActiveComponent('search')}><SearchIcon /> Search</Nav.Link>
              <Nav.Link onClick={() => setActiveComponent('profile')}><Person /> Profile</Nav.Link>
              <Nav.Link onClick={() => setActiveComponent('settings')}><Gear /> Settings</Nav.Link>
              <Nav.Link onClick={() => setShowLogoutModal(true)}><BoxArrowRight /> Logout</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={toggleNotifications} className="notification-icon" style={{fontWeight: 'bold'}}>
                <Bell />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="main-content">
        {activeComponent === 'dashboard' && <DashboardContent />}
        {activeComponent === 'attendance' && <AttendanceReport />}
        {activeComponent === 'events' && <Events />}
        {activeComponent === 'search' && <SearchComponent />}
        {activeComponent === 'profile' && <Profile />}
        {activeComponent === 'settings' && <Settings />}
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

      {showNotifications && (
        <div ref={dropdownRef} className="notifications-dropdown">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                {notification.message}
              </div>
            ))
          ) : (
            <div className="notification-item">No new notifications</div>
          )}
        </div>
      )}
    </div>
  );
};


// DashboardContent Component
const DashboardContent = () => {
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [firstTimers, setFirstTimers] = useState(0);
  const [totalChildren, setTotalChildren] = useState(0);
  const [churchId, setChurchId] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [birthdayFilter, setBirthdayFilter] = useState('current');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const db = getFirestore();

  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceData();
    fetchBirthdays();
  }, []);


  const fetchDashboardData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, 'attendance'),
      where('attendanceTime', '>=', today),
      where('attendanceTime', '<', tomorrow)
    );

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => doc.data());

    const members = records.filter(r => !r.isFirstTimer && !r.isChild).length;
    const firstTimers = records.filter(r => r.isFirstTimer).length;
    const children = records.filter(r => r.isChild).length;

    setTotalAttendance(members + firstTimers + children);
    setFirstTimers(firstTimers);
    setTotalChildren(children);
    if (records.length > 0) {
      setChurchId(records[0].churchId);
    }
  };


 
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError('');

    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const attendanceRef = collection(db, 'attendance');
      const dateQuery = query(
        attendanceRef,
        where('attendanceTime', '>=', startOfDay),
        where('attendanceTime', '<=', endOfDay)
      );

      const querySnapshot = await getDocs(dateQuery);
      const records = querySnapshot.docs.map(doc => doc.data());

      if (records.length > 0) {
        processAttendanceData(records);
      } else {
        setError('No attendance record found for the selected date.');
        setAttendanceData([]);
        setChurchId('');
      }
    } catch (error) {
      setError('Error fetching attendance data: ' + error.message);
      setAttendanceData([]);
      setChurchId('');
    }
    setLoading(false);
  };




  const fetchBirthdays = async () => {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const usersBirthdays = querySnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        birthday: userData.dateOfBirth,
        phone: userData.phone,
        cell: userData.cell, // Using zone as cell
        church: userData.church,
        zone: userData.zone,
        email: userData.email,
        gender: userData.gender,
      };
    });

    // Sort birthdays based on the current month
    const currentMonth = new Date().getMonth();
    const sortedBirthdays = usersBirthdays.sort((a, b) => {
      const dateA = new Date(a.birthday);
      const dateB = new Date(b.birthday);
      if (dateA.getMonth() === dateB.getMonth()) {
        return dateA.getDate() - dateB.getDate();
      }
      return ((dateA.getMonth() - currentMonth + 12) % 12) - ((dateB.getMonth() - currentMonth + 12) % 12);
    });

    setBirthdays(sortedBirthdays);
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const processAttendanceData = (records) => {
    const sortedRecords = records.sort((a, b) => a.attendanceTime.seconds - b.attendanceTime.seconds);
    const chartData = sortedRecords.map(record => ({
      date: new Date(record.attendanceTime.seconds * 1000).toLocaleDateString(),
      total: record.total,
    }));

    setAttendanceData(chartData);

    if (records.length > 0) {
      setChurchId(records[0].churchId);
    } else {
      setChurchId('');
    }
  };


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];


  return (
    <div className="dashboard-content">
      <StatisticsCards 
        totalAttendance={totalAttendance}
        firstTimers={firstTimers}
        totalChildren={totalChildren}
        churchId={churchId}
      />
      <AttendanceChart 
        attendanceData={attendanceData}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        analyticsPeriod={analyticsPeriod}
        setAnalyticsPeriod={setAnalyticsPeriod}
        fetchAttendanceData={fetchAttendanceData}
      />
      <BirthdayTable 
        birthdays={birthdays}
        birthdayFilter={birthdayFilter}
        setBirthdayFilter={setBirthdayFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
    </div>
  );
};

// StatisticsCards Component
const StatisticsCards = ({ totalAttendance, firstTimers, totalChildren, churchId }) => (
  <Row className="mb-4">
    <Col xs={12} md={4} className="mb-3">
      <Card>
        <Card.Body>
          <Card.Title>Total Attendance</Card.Title>
          <h2>{totalAttendance}</h2>
          <p>{churchId}</p>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} md={4} className="mb-3">
      <Card>
        <Card.Body>
          <Card.Title>First Timers</Card.Title>
          <h2>{firstTimers}</h2>
          <p>{churchId}</p>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} md={4} className="mb-3">
      <Card>
        <Card.Body>
          <Card.Title>Total Children</Card.Title>
          <h2>{totalChildren}</h2>
          <p>{churchId}</p>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);


// AttendanceChart Component
const AttendanceChart = ({ attendanceData, startDate, endDate, setStartDate, setEndDate, analyticsPeriod, setAnalyticsPeriod, fetchAttendanceData }) => (
  <Card className="mb-4">
    <Card.Body>
      <Card.Title>Attendance Chart</Card.Title>
      <Form.Group className="mb-3">
        <Form.Select 
          value={analyticsPeriod} 
          onChange={(e) => setAnalyticsPeriod(e.target.value)}
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </Form.Select>
      </Form.Group>
      <Row className="mb-3">
        <Col xs={12} md={4} className="mb-2">
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="form-control"
          />
        </Col>
        <Col xs={12} md={4} className="mb-2">
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="form-control"
          />
        </Col>
        <Col xs={12} md={4}>
          <Button onClick={fetchAttendanceData} className="w-100">Update Chart</Button>
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={attendanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);



// BirthdayTable Component
const BirthdayTable = ({ birthdays, birthdayFilter, setBirthdayFilter, selectedMonth, setSelectedMonth }) => (
  <Card>
    <Card.Body>
      <Card.Title>Upcoming Birthdays</Card.Title>
      <Form.Group className="mb-3">
        <Form.Select value={birthdayFilter} onChange={(e) => setBirthdayFilter(e.target.value)}>
          <option value="current">Current Month</option>
          <option value="past">Past Birthdays</option>
          <option value="select">Select Month</option>
        </Form.Select>
        {birthdayFilter === 'select' && (
          <Form.Select className="mt-2" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </Form.Select>
        )}
      </Form.Group>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Birthday</th>
              <th>Phone</th>
              <th>Cell</th>
            </tr>
          </thead>
          <tbody>
            {birthdays.map((birthday, index) => (
              <tr key={birthday.id}>
                <td>{index + 1}</td>
                <td>{`${birthday.firstName} ${birthday.lastName}`}</td>
                <td>{new Date(birthday.birthday).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</td>
                <td>{birthday.phone}</td>
                <td>{birthday.cell}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card.Body>
  </Card>
);



// AttendanceReport Component
const AttendanceReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [churchId, setChurchId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMode, setFilterMode] = useState(false);

  const db = getFirestore();
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMostRecentAttendance();
  }, []);

  const fetchMostRecentAttendance = async () => {
    setLoading(true);
    setError('');
    
    try {
      const attendanceRef = collection(db, 'attendance');
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
      const attendanceRef = collection(db, 'attendance');
      const dateQuery = query(
        attendanceRef,
        where('attendanceTime', '>=', startOfDay),
        where('attendanceTime', '<=', endOfDay),
        orderBy('attendanceTime', 'asc')
      );
      const querySnapshot = await getDocs(dateQuery);
      
      if (!querySnapshot.empty) {
        const attendanceRecords = await Promise.all(querySnapshot.docs.map(async (attendanceDoc) => {
          const attendanceData = attendanceDoc.data();
          const userRef = doc(db, 'users', attendanceData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          return {
            id: attendanceDoc.id,
            ...attendanceData,
            fullName: attendanceData.fullName || `${userData?.firstName} ${userData?.lastName}`,
            phone: userData?.phone,
            cell: userData?.cell
          };
        }));
        setAttendanceData(attendanceRecords);
        setChurchId(attendanceRecords[0]?.churchId || '');
        setTotalPages(Math.ceil(attendanceRecords.length / itemsPerPage));
      } else {
        setError('No attendance records found for the selected date.');
        setAttendanceData([]);
        setChurchId('');
      }
    } catch (error) {
      setError('Error fetching attendance data: ' + error.message);
      setAttendanceData([]);
      setChurchId('');
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
    doc.autoTable({
      startY: 40,
      head: [['#', 'Full Name', 'Phone', 'Attendance Time', 'Cell']],
      body: attendanceData.map((record, index) => [
        index + 1,
        record.fullName,
        record.phone,
        record.attendanceTime.toDate().toLocaleString(),
        record.cell
      ])
    });
    // doc.save('attendance-report.pdf');
   doc.save(`Attendance Report for ${selectedDate.toDateString()}.pdf`)
  };

  const currentAttendanceData = attendanceData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Attendance Time</th>
                <th>Cell</th>
              </tr>
            </thead>
            <tbody>
              {currentAttendanceData.map((record, index) => (
                <tr key={record.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{record.fullName}</td>
                  <td>{record.phone}</td>
                  <td>{record.attendanceTime.toDate().toLocaleString()}</td>
                  <td>{record.cell}</td>
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
    </Container>
  );
};


  // Events Component (placeholder)
  const Events = () => (
    <div>
      <h2>Events</h2>
      <p>Events management functionality to be implemented.</p>
    </div>
  );
  
  // Search Component (placeholder)
  const SearchComponent = () => (
    <div>
      <h2>Search</h2>
      <p>Search functionality to be implemented.</p>
    </div>
  );

  
  // Profile Component (placeholder)
  const Profile = () => (
    <div>
      <h2>Admin Profile</h2>
      <p>Admin profile management to be implemented.</p>
    </div>
  );
  
  // Settings Component (placeholder)
  const Settings = () => (
    <div>
      <h2>Settings</h2>
      <p>Admin settings to be implemented.</p>
    </div>
  );
  
  export default AdminDashboard;









  // const fetchMostRecentAttendance = async () => {
  //   setLoading(true);
  //   setError('');
  //   const db = getFirestore();
  //   const attendanceRef = ref(db, 'attendance');
  //   const recentQuery = query(attendanceRef, orderBy('date'), limitToLast(1));

  //   try {
  //     const snapshot = await get(recentQuery);
  //     if (snapshot.exists()) {
  //       const data = snapshot.val();
  //       const mostRecentDate = Object.keys(data)[0];
  //       const mostRecentData = data[mostRecentDate];
  //       setSelectedDate(new Date(mostRecentDate));
  //       processAttendanceData(mostRecentData);
  //     } else {
  //       setError('No attendance records found.');
  //       setAttendanceData([]);
  //       setChurchId('');
  //     }
  //   } catch (error) {
  //     setError('Error fetching recent attendance data: ' + error.message);
  //     setAttendanceData([]);
  //     setChurchId('');
  //   }
  //   setLoading(false);
  // };

  
  
  

  // const fetchAttendanceData = async () => {
  //   setLoading(true);
  //   setError('');
    
  //   const startOfDay = new Date(selectedDate);
  //   startOfDay.setHours(0, 0, 0, 0);
  //   const endOfDay = new Date(selectedDate);
  //   endOfDay.setHours(23, 59, 59, 999);

  //   try {
  //     const attendanceRef = collection(db, 'attendance');
  //     const dateQuery = query(
  //       attendanceRef,
  //       where('attendanceTime', '>=', startOfDay),
  //       where('attendanceTime', '<=', endOfDay)
  //     );
      
  //     const querySnapshot = await getDocs(dateQuery);
  //     const records = querySnapshot.docs.map(doc => doc.data());
      
  //     if (records.length > 0) {
  //       processAttendanceData(records);
  //     } else {
  //       setError('No attendance record found for the selected date.');
  //       setAttendanceData([]);
  //       setChurchId('');
  //     }
  //   } catch (error) {
  //     setError('Error fetching attendance data: ' + error.message);
  //     setAttendanceData([]);
  //     setChurchId('');
  //   }
  //   setLoading(false);
  // };

  // const processAttendanceData = (data) => {
  //   setAttendanceData(data);
  //   setChurchId(data[0]?.churchId || '');
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   fetchAttendanceData();
  // };

  // return (
  //   <Container fluid>
  //     <h2>View Attendance Record</h2>
  //     <Form onSubmit={handleSubmit} className='mb-2'>
  //       <Form.Group>
  //         <DatePicker
  //           selected={selectedDate}
  //           onChange={(date) => setSelectedDate(date)}
  //           dateFormat="yyyy-MM-dd"
  //         />
  //       </Form.Group>
  //       <Button type="submit">Fetch Attendance</Button>
  //     </Form>
  //     {loading && <p>Loading...</p>}
  //     {error && <Alert variant="danger">{error}</Alert>}
  //     {attendanceData.length > 0 && (
  //       <>
  //         <h3>{churchId}</h3>
  //         <Table striped bordered hover>
  //           <thead>
  //             <tr>
  //               <th>#</th>
  //               <th>Name</th>
  //               <th>Email</th>
  //               <th>Attendance Time</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {attendanceData.map((record, index) => (
  //               <tr key={index}>
  //                 <td>{index + 1}</td>
  //                 <td>{record.fullName}</td>
  //                 <td>{record.email}</td>
  //                 <td>{record.attendanceTime.toDate().toLocaleString()}</td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </Table>
  //         <p>Total attendance: {attendanceData.length}</p>
  //       </>
  //     )}
  //   </Container>
  // );

















  