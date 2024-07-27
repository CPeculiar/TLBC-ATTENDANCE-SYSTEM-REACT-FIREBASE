import React, { useState, useEffect } from 'react';
import { Button, Form, Table, Container, Row, Col, Alert } from 'react-bootstrap';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [churchId, setChurchId] = useState('');
  const [showAttendance, setShowAttendance] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');

  const db = getFirestore();

  useEffect(() => {
    fetchAnalyticsData();
  }, [analyticsPeriod]);

  const fetchTodayAttendance = async () => {
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
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAttendanceRecords(records);
    setShowAttendance(true);
    if (records.length > 0) {
      setChurchId(records[0].churchId);
      setNoResultsMessage('');
    } else {
      setNoResultsMessage('No attendance records found for today.');
    }
  };

  const handleDateFilter = async () => {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'attendance'),
      where('attendanceTime', '>=', startDateTime),
      where('attendanceTime', '<=', endDateTime)
    );

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAttendanceRecords(records);
    setShowAttendance(true);
    if (records.length === 0) {
      setNoResultsMessage('No attendance records found for the selected date range.');
    } else {
      setNoResultsMessage('');
    }
  };

  const handleSearch = async () => {
    const q = query(
      collection(db, 'attendance'),
      where('fullName', '>=', searchTerm),
      where('fullName', '<=', searchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAttendanceRecords(records);
    setShowAttendance(true);
    if (records.length === 0) {
      setNoResultsMessage('No results found for the searched name.');
    } else {
      setNoResultsMessage('');
    }
  };

  const fetchAnalyticsData = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12); // Get data for the last 12 months
    
    const q = query(
      collection(db, 'attendance'),
      where('attendanceTime', '>=', startDate)
    );

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => doc.data());

    const groupedData = records.reduce((acc, record) => {
      const date = record.attendanceTime.toDate();
      let key;
      
      switch(analyticsPeriod) {
        case 'week':
          key = `${date.getFullYear()}-W${getWeekNumber(date)}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case 'year':
          key = `${date.getFullYear()}`;
          break;
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    }, {});

    const sortedData = Object.entries(groupedData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    setAnalyticsData(sortedData);
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <h2 className="mb-3">Attendance Analytics</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Form.Select 
            value={analyticsPeriod} 
            onChange={(e) => setAnalyticsPeriod(e.target.value)}
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </Form.Select>
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={analyticsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-5 mb-3">Attendance Records</h2>
      <Row className="mb-4">
        <Col md={3}>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="form-control"
          />
        </Col>
        <Col md={3}>
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
        <Col md={2}>
          <Button onClick={handleDateFilter}>Filter by Date</Button>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={1}>
          <Button onClick={handleSearch}>Search</Button>
        </Col>
      </Row>
      <Button onClick={fetchTodayAttendance} className="mb-4">Get Today's Attendance</Button>
      
      {noResultsMessage && <Alert variant="info">{noResultsMessage}</Alert>}
      
      {showAttendance && attendanceRecords.length > 0 && (
        <>
          <h3>{churchId ? `Attendance for ${churchId}` : 'Attendance Records'}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Attendance Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.fullName}</td>
                  <td>{record.email}</td>
                  <td>{record.attendanceTime.toDate().toLocaleString()}</td>
                  <td>
                    <Button variant="info" size="sm" className="mr-2">Edit</Button>
                    <Button variant="danger" size="sm">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;