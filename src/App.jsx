import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Layouts/Home";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import FirstTimersForm from "./Components/Auth/FirstTimersForm";
import Dashboard from "./Components/Member/Dashboard";
import AttendanceMarker from "./Components/Attendance/AttendanceMarker";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import QRCodeGenerator from "./Components/Attendance/QRCodeGenerator";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import Media from "./Components/Member/Media";
import NotFound from "./Components/Layouts/NotFound";
import Telegram from "./Components/Member/Telegram";
import Footer from "./Components/Layouts/Footer";
import TLBCAttendancePage from "./Components/TLBC-Attendance/AttendancePage";
import TLBCQRCodeGenerator from "./Components/TLBC-Attendance/TLBCQRCodeGenerator";


const App = () => {
  return (
    <>
    

    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/firsttimers" element={<FirstTimersForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/media" element={<Media />} />
      <Route path="*" element={<NotFound />} /> 
      <Route path="/telegram" element={<Telegram />} /> 
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <AttendanceMarker />
          </PrivateRoute>
        }
      />
      <Route
        path="/qrcode"
        element={
          <PrivateRoute>
            <QRCodeGenerator />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
       <Route
        path="/tlbc"
        element={
          <PrivateRoute>
            <TLBCAttendancePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tlbcqrcode"
        element={
          <PrivateRoute>
            <TLBCQRCodeGenerator />
          </PrivateRoute>
        }
      />
    </Routes>

    
    </>
  );
};

export default App;
