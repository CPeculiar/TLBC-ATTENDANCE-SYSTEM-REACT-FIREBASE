import React, { useState } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "react-bootstrap";
import CustomNavbar from "../Layouts/CustomNavbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import HeroSection from "../../assets/Images/TLBCSlider2.png";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      const errorMessage = extractErrorCode(error.message);
      alert('Failed to log in: ' + errorMessage);
    }
  }

  function extractErrorCode(errorMessage) {
    const match = errorMessage.match(/\(auth\/([^\)]+)\)/);
    return match ? match[1] : errorMessage;
  }

  return (

    <>

<CustomNavbar />

    <div 
   className="login d-flex flex-column align-items-center justify-content-center min-vh-100 text-white" 
    style={{ 
      backgroundImage: `url(${HeroSection})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      position: 'relative',
      padding: '1rem'
    }}
  >
    <div 
      className="overlay" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 1 
      }} 
    />

      {/* <div className="row justify-content-center w-100" style={{ zIndex: 2 }}> */}
      <div className="container" style={{ zIndex: 2, maxWidth: '100%' }}>
        {/* <div className="col-md-6"> */}
        <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="login-card p-4" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
            {/* <div className="card-body mt-5"> */}

            <form onSubmit={handleSubmit}>
            <h2 className="card-title text-primary fs-2 text-center mb-4">Login</h2>
              <div className="mb-3">
                <input 
                  type="email" 
                  className="form-control input-lg" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Email" 
                  required 
                />
              </div>
              <div className="mb-3">
              <div className="input-group">
                <input 
                  type={passwordVisible ? "text" : "password"}
                  className="form-control input-lg" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                  required 
                  style={{ paddingRight: '40px' }} // Add padding to prevent text overlap with the icon
                />
                <div className="input-group-append position-absolute end-0 top-50 translate-middle-y" style={{ zIndex: 10, paddingRight: '10px' }}>
                <button
                        type="button"
                        className="btn btn-link"
                        onClick={togglePasswordVisibility}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible ? faEyeSlash : faEye}
                          style={{ color: '#6c757d' }}
                        />
                      </button>
              </div>
              </div>
              </div>
              <div className="mb-3 d-flex justify-content-end">
                <a href="/forgotpassword" className="link-primary font-weight-bold" style={{fontSize: '1rem', textDecoration: 'none'}}>Forgot Password</a>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Login</button>
            </form>
          </div>
          <div className="text-container mt-3">
                    <Button
                      variant="link"
                      className="text-white fs-5 font-weight-bold back-to-home"
                      onClick={handleBackToHome}
                    >
                      Back to Home
                    </Button>
                  </div>
        </div>

        
      </div>
    </div>
  </div>


  </>
);
}

export default Login;