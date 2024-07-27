import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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


// ServiceAttendancePieChart Component
// const ServiceAttendancePieChart = ({ serviceAttendance }) => {
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

//   return (
//     <Card>
//       <Card.Body>
//         <Card.Title>Service Attendance Ratio</Card.Title>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart>
//             <Pie
//               data={serviceAttendance}
//               cx="50%"
//               cy="50%"
//               labelLine={false}
//               outerRadius={80}
//               fill="#8884d8"
//               dataKey="value"
//               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//             >
//               {serviceAttendance.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </Card.Body>
//     </Card>
//   );
// };

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
              </tr>
            </thead>
            <tbody>
              {birthdays.map((birthday, index) => (
                <tr key={birthday.id}>
                  <td>{index + 1}</td>
                  <td>{`${birthday.firstName} ${birthday.lastName}`}</td>
                  <td>{new Date(birthday.birthday).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</td>
                  <td>{birthday.phone}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
  
  // Main Dashboard Component
  const DashboardComponents = () => {
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

    setAttendanceData(sortedData);
  };

//   const fetchServiceAttendance = async () => {
    // Fetch and calculate service attendance for the pie chart
    // This is a placeholder implementation
    // setServiceAttendance([
    //     { name: 'Week 1 Sunday', value: 30 },
    //     { name: 'Week 1 Midweek', value: 20 },
    //     { name: 'Week 2 Sunday', value: 35 },
    //     { name: 'Week 2 Midweek', value: 25 },
    //     { name: 'Week 3 Sunday', value: 40 },
    //     { name: 'Week 3 Midweek', value: 30 },
    //     { name: 'Week 4 Sunday', value: 45 },
    //     { name: 'Week 4 Midweek', value: 35 },
    //   ]);
    // };

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
        cell: userData.zone, // Using zone as cell
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

  return (
    <div className="dashboard">
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


export default DashboardComponents;