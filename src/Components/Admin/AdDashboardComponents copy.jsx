import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
// import { getDatabase, ref, get } from 'firebase/database';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, getFirestore, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Card, Row, Col, Navbar, Container, Nav, Button, Alert, Modal, Form, Table, Pagination,  Image } from 'react-bootstrap';
import { Bell, List, Calendar, Search as SearchIcon, Person, Gear, BoxArrowRight, Speedometer2 } from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Eye } from 'lucide-react';
import '../Styles/AdminDashboard.css'
import TLBCAttendanceReport from '../TLBC-Attendance/TLBCAttendanceReport';



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
  const [firstTimers, setFirstTimers] = useState(0);

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
              <Nav.Link onClick={() => setActiveComponent('firstTimers')}><Calendar /> First Timers</Nav.Link>
              {/* <Nav.Link onClick={() => setActiveComponent('search')}><SearchIcon /> Search</Nav.Link> */}
              <Nav.Link onClick={() => setActiveComponent('tlbcattendance')}><List /> TLBC'24 Attendance Report</Nav.Link>
              {/* <Nav.Link onClick={() => setActiveComponent('profile')}><Person /> Profile</Nav.Link> */}
              {/* <Nav.Link onClick={() => setActiveComponent('settings')}><Gear /> Settings</Nav.Link> */}
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
        {activeComponent === 'tlbcattendance' && <TLBCAttendanceReport />}
        {activeComponent === 'firstTimers' && <FirstTimers />}
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
    
    try {
      // Query the most recent attendance date
      const attendanceRef = collection(db, 'tlbc2024');
      const mostRecentAttendanceQuery = query(
        attendanceRef,
        orderBy('attendanceTime', 'desc'),
        limit(1)
      );

      const mostRecentAttendanceSnapshot = await getDocs(mostRecentAttendanceQuery);
      if (mostRecentAttendanceSnapshot.empty) {
        setError('No attendance records found.');
        return;
      }

      // Get the most recent date
      const mostRecentDoc = mostRecentAttendanceSnapshot.docs[0];
      const mostRecentDate = new Date(mostRecentDoc.data().attendanceTime.seconds * 1000);
      mostRecentDate.setHours(0, 0, 0, 0);

      // Query for all attendance on the most recent date
      const attendanceQuery = query(
        attendanceRef,
        where('attendanceTime', '>=', mostRecentDate),
        where('attendanceTime', '<', new Date(mostRecentDate.getTime() + 86400000))
      );

      const firstTimersQuery = query(
        collection(db, 'firsttimers'),
        where('visitDate', '>=', mostRecentDate),
        where('visitDate', '<', new Date(mostRecentDate.getTime() + 86400000))
      );

      const [attendanceSnapshot, firstTimersSnapshot] = await Promise.all([
        getDocs(attendanceQuery),
        getDocs(firstTimersQuery)
      ]);  

      const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data());
      const firstTimerRecords = firstTimersSnapshot.docs.map(doc => doc.data());
  
      const regularMembers = attendanceRecords.filter(r => !r.isChild).length;
      const children = attendanceRecords.filter(r => r.isChild).length;
      const firstTimersCount = firstTimerRecords.length;

      setTotalAttendance(regularMembers + children );
      setFirstTimers(firstTimersCount);
      setTotalChildren(children);

      setChurchId(attendanceRecords[0]?.churchId || '');
      processAttendanceData(attendanceRecords);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error fetching dashboard data: ' + error.message);
    }
  };

 
  const fetchAttendanceData = async (start, end) => {
    setLoading(true);
    setError('');
   
    try {
      const attendanceRef = collection(db, 'tlbc2024');
      const dateQuery = query(
        attendanceRef,
        where('attendanceTime', '>=', start),
        where('attendanceTime', '<=', end),
        orderBy('attendanceTime', 'asc')
      );
  
      const querySnapshot = await getDocs(dateQuery);
    const records = querySnapshot.docs.map(doc => doc.data());

    if (records.length > 0) {
      processAttendanceData(records);
    } else {
      setError('No attendance record found for the selected period.');
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

  const processAttendanceData = (records) => {
    // const sortedRecords = records.sort((a, b) => a.attendanceTime.seconds - b.attendanceTime.seconds);
    // const chartData = sortedRecords.map(record => ({
    //   date: new Date(record.attendanceTime.seconds * 1000).toLocaleDateString(),
    //   total: record.total,
    // }));

    const chartData = [];
    const weekColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    records.forEach(record => {
      const date = new Date(record.attendanceTime.seconds * 1000);
      const weekNumber = getWeekNumber(date);
      const existingDataPoint = chartData.find(d => d.date === date.toLocaleDateString());

      if (existingDataPoint) {
        existingDataPoint.total += 1; // Increment count instead of summing a 'total' field
      } else {
        chartData.push({
          date: date.toLocaleDateString(),
          total: 1, // Start count as 1 for each new date
          color: weekColors[weekNumber % weekColors.length]
        });
      }
    });

    setAttendanceData(chartData);
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };


  const processMonthlyData = (records) => {
    const monthlyData = {};
    records.forEach(record => {
      const date = new Date(record.attendanceTime.seconds * 1000);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { total: 0, firstTimers: 0, children: 0 };
      }
      monthlyData[monthYear].total += record.total;
      monthlyData[monthYear].firstTimers += record.isFirstTimer ? 1 : 0;
      monthlyData[monthYear].children += record.isChild ? 1 : 0;
    });
    return Object.entries(monthlyData).map(([date, data]) => ({ date, ...data }));
  };

  const processWeeklyData = (records) => {
    const weeklyData = {};
    records.forEach(record => {
      const date = new Date(record.attendanceTime.seconds * 1000);
      const weekYear = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      if (!weeklyData[weekYear]) {
        weeklyData[weekYear] = { total: 0, firstTimers: 0, children: 0 };
      }
      weeklyData[weekYear].total += record.total;
      weeklyData[weekYear].firstTimers += record.isFirstTimer ? 1 : 0;
      weeklyData[weekYear].children += record.isChild ? 1 : 0;
    });
    return Object.entries(weeklyData).map(([date, data]) => ({ date, ...data }));
  };

  const processYearlyData = (records) => {
    const yearlyData = {};
    records.forEach(record => {
      const date = new Date(record.attendanceTime.seconds * 1000);
      const year = date.getFullYear().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = { total: 0, firstTimers: 0, children: 0 };
      }
      yearlyData[year].total += record.total;
      yearlyData[year].firstTimers += record.isFirstTimer ? 1 : 0;
      yearlyData[year].children += record.isChild ? 1 : 0;
    });
    return Object.entries(yearlyData).map(([date, data]) => ({ date, ...data }));
  };

  


  const fetchBirthdays = async () => {
    try {
      const usersRef = collection(db, 'users');
      const firstTimersRef = collection(db, 'firsttimers');
      const [usersSnapshot, firstTimersSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(firstTimersRef)
      ]);

      const usersBirthdays = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        role: 'User'
      }));
  
      const firstTimersBirthdays = firstTimersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        role: 'First Timer'
      }));

      const allBirthdays = [...usersBirthdays, ...firstTimersBirthdays];

      const filteredBirthdays = allBirthdays.filter(birthday => {
        const birthDate = new Date(birthday.dateOfBirth);
        return birthDate.getMonth() === selectedMonth;
      });
  
      const sortedBirthdays = filteredBirthdays.sort((a, b) => {
        const dateA = new Date(a.dateOfBirth);
        const dateB = new Date(b.dateOfBirth);
        return dateA.getDate() - dateB.getDate();
      });
  
      setBirthdays(sortedBirthdays);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      setError('Error fetching birthdays: ' + error.message);
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
const AttendanceChart = ({ attendanceData, startDate, endDate, setStartDate, setEndDate, analyticsPeriod, setAnalyticsPeriod, fetchAttendanceData }) => {
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setAnalyticsPeriod(newPeriod);
    
    const today = new Date();
    let newStartDate, newEndDate;

    switch (newPeriod) {
      case 'week':
        newStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        newEndDate = today;
        break;
      case 'month':
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'year':
        newStartDate = new Date(today.getFullYear(), 0, 1);
        newEndDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        newStartDate = startDate;
        newEndDate = endDate;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchAttendanceData(newStartDate, newEndDate);
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Attendance Chart</Card.Title>
        <Form.Group className="mb-3">
          <Form.Select 
            value={analyticsPeriod} 
            onChange={handlePeriodChange}
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </Form.Select>
        </Form.Group>
        <Row className="mb-3">
          <Col xs={12} md={4} className="mb-2">
          <div>Start Date</div>
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
          <div>End Date</div>
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
            <Button onClick={() => fetchAttendanceData(startDate, endDate)} className="w-100">Update Chart</Button>
          </Col>
        </Row>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};


// BirthdayTable Component
const BirthdayTable = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [filteredBirthdays, setFilteredBirthdays] = useState([]);
  const [birthdayFilter, setBirthdayFilter] = useState('current');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const db = getFirestore();

  useEffect(() => {
    fetchAllBirthdays();
  }, []);

  useEffect(() => {
    filterBirthdays();
  }, [birthdays, birthdayFilter, selectedMonth]);

  const fetchAllBirthdays = async () => {
    setLoading(true);
    setError('');

    try {
      const usersRef = collection(db, 'users');
      const firstTimersRef = collection(db, 'firsttimers');

      const [usersSnapshot, firstTimersSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(firstTimersRef)
      ]);

      const usersBirthdays = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'Member'
      }));

      const firstTimersBirthdays = firstTimersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'First Timer'
      }));

      const allBirthdays = [...usersBirthdays, ...firstTimersBirthdays];
      setBirthdays(allBirthdays);
    } catch (error) {
      setError('Error fetching birthdays: ' + error.message);
    }

    setLoading(false);
  };

  const filterBirthdays = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();

    let filtered = [];

    switch (birthdayFilter) {
      case 'current':
        filtered = birthdays.filter(birthday => {
          const birthDate = new Date(birthday.dateOfBirth);
          return birthDate.getMonth() === currentMonth;
        });
        break;
      case 'past':
        filtered = birthdays.filter(birthday => {
          const birthDate = new Date(birthday.dateOfBirth);
          const birthDateThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
          return (birthDateThisYear < currentDate && birthDateThisYear >= new Date(currentYear, 0, 1)) ||
                 (birthDate.getMonth() === currentMonth && birthDate.getDate() < currentDay);
        });
        filtered.sort((a, b) => {
          const dateA = new Date(a.dateOfBirth);
          const dateB = new Date(b.dateOfBirth);
          return new Date(currentYear, dateB.getMonth(), dateB.getDate()) - new Date(currentYear, dateA.getMonth(), dateA.getDate());
        });
        break;
      case 'select':
        filtered = birthdays.filter(birthday => {
          const birthDate = new Date(birthday.dateOfBirth);
          return birthDate.getMonth() === parseInt(selectedMonth);
        });
        break;
      default:
        filtered = birthdays;
    }

    setFilteredBirthdays(filtered);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleSearch = () => {
    setBirthdayFilter('select');
    filterBirthdays();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Birthday Report', 10, 10);
    doc.text(`Filter: ${birthdayFilter === 'select' ? new Date(0, parseInt(selectedMonth)).toLocaleString('default', { month: 'long' }) : birthdayFilter}`, 10, 20);
    doc.autoTable({
      startY: 30,
      head: [['#', 'Name', 'Birthday', 'Phone', 'Cell', 'Role']],
      body: filteredBirthdays.map((birthday, index) => [
        index + 1,
        `${birthday.firstName} ${birthday.lastName}`,
        new Date(birthday.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
        birthday.phone,
        birthday.cell,
        birthday.role
      ])
    });
    doc.save(`Birthday_Report_${birthdayFilter}.pdf`);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Birthdays</Card.Title>
        <Form.Group className="mb-3">
          <Form.Select value={birthdayFilter} onChange={(e) => setBirthdayFilter(e.target.value)}>
            <option value="current">Current Month</option>
            <option value="past">Past Birthdays</option>
            <option value="select">Select Month</option>
          </Form.Select>
          {birthdayFilter === 'select' && (
            <div className="mt-2">
              <Form.Select value={selectedMonth} onChange={handleMonthChange}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </Form.Select>
              <Button onClick={handleSearch} className="mt-2">Search</Button>
            </div>
          )}
        </Form.Group>
        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Birthday</th>
                <th>Phone</th>
                <th>Cell</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredBirthdays.map((birthday, index) => (
                <tr key={birthday.id}>
                  <td>{index + 1}</td>
                  <td>{`${birthday.firstName} ${birthday.lastName}`}</td>
                  <td>{new Date(birthday.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</td>
                  <td>{birthday.phone}</td>
                  <td>{birthday.cell}</td>
                  <td>{birthday.role}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Button onClick={downloadPDF} className="mt-3">Download PDF</Button>
      </Card.Body>
    </Card>
  );
};



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
  const [firstTimers, setFirstTimers] = useState(0);

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
        
        // Check in users collection first
        const userRef = doc(db, 'users', attendanceData.userId);
        let userDoc = await getDoc(userRef);
        
        // If not found in users, check in firsttimers
        if (!userDoc.exists()) {
          const firstTimerRef = doc(db, 'firsttimers', attendanceData.userId);
          userDoc = await getDoc(firstTimerRef);
        }
        
        userData = userDoc.data();
        
        return {
          id: attendanceDoc.id,
          ...attendanceData,
          fullName: attendanceData.fullName || `${userData?.firstName} ${userData?.lastName}`,
          phone: userData?.phone,
          cell: userData?.cell,
          role: userDoc.ref.parent.id === 'users' ? 'User' : 'First Timer'
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
      head: [['#', 'Full Name', 'Phone', 'Attendance Time', 'Cell', 'Role']],
      body: attendanceData.map((record, index) => [
        index + 1,
        record.fullName,
        record.phone,
        record.attendanceTime.toDate().toLocaleString(),
        record.cell,
        record.role
      ])
    });
    doc.save(`Attendance Report for ${selectedDate.toDateString()}.pdf`);
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
          <p style={{fontWeight: 'bold'}}>First Timers: {firstTimers}</p>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Attendance Time</th>
                <th>Cell</th>
                <th>Role</th>
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
                  <td>{record.role}</td>
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


  //FirstTimers Component (placeholder) 
  const FirstTimers = () => {
    const [firstTimers, setFirstTimers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFirstTimer, setSelectedFirstTimer] = useState(null);
  
    const db = getFirestore();
  
    useEffect(() => {
      fetchFirstTimers(selectedDate);
    }, []);
  
    const fetchFirstTimers = async (date) => {
      setLoading(true);
      setError('');
  
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
  
      try {
        const firstTimersRef = collection(db, 'firsttimers');
        const q = query(
          firstTimersRef,
          where('visitDate', '>=', Timestamp.fromDate(startOfDay)),
          where('visitDate', '<=', Timestamp.fromDate(endOfDay))
        );
  
        const querySnapshot = await getDocs(q);
        const firstTimersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        setFirstTimers(firstTimersData);
        if (firstTimersData.length === 0) {
          setError('No data found for the selected date.');
        }
      } catch (error) {
        setError('Error fetching first timers data: ' + error.message);
      }
  
      setLoading(false);
    };
  
    const handleDateChange = (date) => {
      setSelectedDate(date);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      fetchFirstTimers(selectedDate);
    };
  
    const downloadPDF = () => {
      const doc = new jsPDF();
      doc.text('First Timers Report', 10, 10);
      doc.text(`Visit Date: ${selectedDate.toDateString()}`, 10, 20);
      doc.autoTable({
        startY: 30,
        head: [['#', 'Name', 'Phone', 'Email', 'Cell', 'Invited By', 'Department', 'Be A Member']],
        body: firstTimers.map((firstTimer, index) => [
          index + 1,
          `${firstTimer.firstName} ${firstTimer.lastName}`,
          firstTimer.phone,
          firstTimer.email,
          firstTimer.cell,
          firstTimer.invitedBy,
          firstTimer.department,
          firstTimer.beAMember
        ])
      });
      doc.save(`First_Timers_Report_${selectedDate.toDateString()}.pdf`);
    };
  
    const handleShowProfile = (firstTimer) => {
      setSelectedFirstTimer(firstTimer);
      setShowModal(true);
    };
  
    const ProfileModal = ({ show, onHide, firstTimer }) => {
      if (!firstTimer) return null;
  
      return (
        <Modal show={show} onHide={onHide} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>First Timer Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={4}>
                <Image src={firstTimer.profilePictureUrl} alt="Profile Picture" fluid />
              </Col>
              <Col md={8}>
                <h4>{`${firstTimer.firstName} ${firstTimer.lastName}`}</h4>
                <p><strong>Email:</strong> {firstTimer.email}</p>
                <p><strong>Phone:</strong> {firstTimer.phone}</p>
                <p><strong>Cell:</strong> {firstTimer.cell}</p>
                <p><strong>Date of Birth:</strong> {firstTimer.dateOfBirth}</p>
                <p><strong>Gender:</strong> {firstTimer.gender}</p>
                <p><strong>Marital Status:</strong> {firstTimer.maritalStatus}</p>
                <p><strong>Occupation:</strong> {firstTimer.occupation}</p>
                <p><strong>Department:</strong> {firstTimer.department}</p>
                <p><strong>Invited By:</strong> {firstTimer.invitedBy}</p>
                <p><strong>Be A Member:</strong> {firstTimer.beAMember}</p>
                <p><strong>Church:</strong> {firstTimer.church}</p>
                <p><strong>Zone:</strong> {firstTimer.zone}</p>
                <p><strong>Visit Date:</strong> {firstTimer.visitDate.toDate().toLocaleString()}</p>
                <p><strong>Address:</strong> {`${firstTimer.address.city}, ${firstTimer.address.state}, ${firstTimer.address.country}`}</p>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      );
    };
  
    return (
      <Card>
        <Card.Body>
          <Card.Title>First Timers for {selectedDate.toDateString()}</Card.Title>
          <Form onSubmit={handleSubmit} className="mb-3">
            <Form.Group>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
              />
            </Form.Group>
            <Button type="submit" className="mt-2">Fetch First Timers</Button>
          </Form>
          {loading && <p>Loading...</p>}
          {error && <Alert variant="danger">{error}</Alert>}
          {firstTimers.length > 0 && (
            <>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Cell</th>
                      <th>Invited By</th>
                      <th>Department</th>
                      <th>Be A Member</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstTimers.map((firstTimer, index) => (
                      <tr key={firstTimer.id}>
                        <td>{index + 1}</td>
                        <td>{`${firstTimer.firstName} ${firstTimer.lastName}`}</td>
                        <td>{firstTimer.phone}</td>
                        <td>{firstTimer.email}</td>
                        <td>{firstTimer.cell}</td>
                        <td>{firstTimer.invitedBy}</td>
                        <td>{firstTimer.department}</td>
                        <td>{firstTimer.beAMember}</td>
                        <td>
                          <Button variant="link" onClick={() => handleShowProfile(firstTimer)}>
                            <Eye size={20} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Button onClick={downloadPDF} className="mt-3">Download PDF</Button>
            </>
          )}
        </Card.Body>
        <ProfileModal show={showModal} onHide={() => setShowModal(false)} firstTimer={selectedFirstTimer} />
      </Card>
    );
  };
  
  
  
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
