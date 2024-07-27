import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Menu, X, BarChart2, Users, FileText, Settings, HelpCircle } from 'lucide-react';
import AdDashboardComponents from './AdDashboardComponents';
import '../../App.css';

const Sidebar = ({ isOpen, toggleSidebar, activeItem, setActiveItem }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src="/api/placeholder/50/50" alt="Admin" className="rounded-circle" />
        <div className="admin-info">
          <p className="admin-name">John Doe</p>
          <p className="admin-role">Admin</p>
        </div>
      </div>
      <ul className="sidebar-menu">
        <li className={activeItem === 'dashboard' ? 'active' : ''} onClick={() => { setActiveItem('dashboard'); toggleSidebar(); }}>
          <BarChart2 size={20} />
          <span>Dashboard</span>
        </li>
        <li className={activeItem === 'attendance' ? 'active' : ''} onClick={() => { setActiveItem('attendance'); toggleSidebar(); }}>
          <Users size={20} />
          <span>Attendance</span>
        </li>
        <li className={activeItem === 'reports' ? 'active' : ''} onClick={() => { setActiveItem('reports'); toggleSidebar(); }}>
          <FileText size={20} />
          <span>Reports</span>
        </li>
        <li className={activeItem === 'settings' ? 'active' : ''} onClick={() => { setActiveItem('settings'); toggleSidebar(); }}>
          <Settings size={20} />
          <span>Settings</span>
        </li>
        <li className={activeItem === 'help' ? 'active' : ''} onClick={() => { setActiveItem('help'); toggleSidebar(); }}>
          <HelpCircle size={20} />
          <span>Help</span>
        </li>
      </ul>
    </div>
  );
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="main-content">
        <div className="top-bar">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1>Admin Dashboard</h1>
        </div>
        <Container fluid>
          {activeItem === 'dashboard' && <AdDashboardComponents />}
          {/* Add other content components for different menu items */}
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;