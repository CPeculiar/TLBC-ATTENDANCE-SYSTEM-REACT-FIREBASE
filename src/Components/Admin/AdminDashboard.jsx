import React, { useState, useEffect } from 'react';
import { Container, Form, Table, Alert } from 'react-bootstrap';
import { getDatabase, ref, get } from 'firebase/database';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AdDashboardComponents from './AdDashboardComponents';
import '../../App.css';

const AdminDashboard = () => {
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
    const db = getDatabase();
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


  
  return (
        
        <Container fluid>
        <h1>Admin Dashboard</h1>
           <AdDashboardComponents />
           
    </Container>
  );
};


export default AdminDashboard;