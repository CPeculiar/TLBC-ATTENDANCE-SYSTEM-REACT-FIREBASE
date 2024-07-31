import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Layouts/Home";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Dashboard from "./Components/Member/Dashboard";
import AttendanceMarker from "./Components/Attendance/AttendanceMarker";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import QRCodeGenerator from "./Components/Attendance/QRCodeGenerator";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import Navbar from "./Components/Layouts/Navbar";
import Media from "./Components/Member/Media";
import NotFound from "./Components/Layouts/NotFound";
import Telegram from "./Components/Member/Telegram";

const App = () => {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
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
    </Routes>
    </>
  );
};

export default App;
