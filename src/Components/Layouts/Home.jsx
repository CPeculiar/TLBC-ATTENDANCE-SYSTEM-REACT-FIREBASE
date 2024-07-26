import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/Images/TLBC_LOGO_removebg.png'
import HeroImage from '../../assets/Images/Herosection.jpg'
import '../../App.css'

function Home() {

  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
      <div className="text-center mt-2">
        <img src={Logo} alt="Logo" className="mb-2" style={{ width: '150px', height: 'auto' }} />
        <h1 className="font-weight-bold">Welcome to our Data Management System</h1>
      </div>
      <div 
        className="d-flex flex-column align-items-center justify-content-center w-100" 
        style={{ 
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(70%)',
          height: '60vh',
          width: '60vh',
          position: 'relative',
          margin: '20px auto',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <div className={`d-flex gap-3 ${buttonsVisible ? 'fade-in' : ''}`} style={{ zIndex: 1, position: 'absolute' }}>
          <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
          <Link to="/register" className="btn btn-secondary btn-lg">Register</Link>
        </div>
      </div>
      <p className="text-center mt-4" style={{ fontSize: '20px' }}>TLBC....calling men by the gospel into the Glory of God.</p>
      <p className="text-center mt-4" style={{ fontSize: '20px' }}>Powered by the Welcoming Team.</p>
    </div>
  );
}

export default Home;