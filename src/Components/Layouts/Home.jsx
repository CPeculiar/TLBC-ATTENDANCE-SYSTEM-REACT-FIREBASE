import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from "react-bootstrap";
import {  Book } from "lucide-react";
import CustomNavbar from "../Layouts/CustomNavbar";
import "../Styles/Home.css";
import HeroSection from "../../assets/Images/TLBCSlider2.png";
import '../../App.css'

function Home() {

  const [buttonsVisible, setButtonsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);


  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

 
  const handleFirstTimersClick = () => {
    navigate('/firsttimers');
  };
  

  return (
    <>
<CustomNavbar />

<div
        className="hero-section position-relative text-white d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(${HeroSection})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >

<Container fluid >
          <Row className="justify-content-center align-items-center h-100">
            <Col xs={12} md={8} lg={6}>
              <div className="hero-content text-center">
                
                      <div className="mb-4">
                        <Book size={0} className="text-warning" />
                      </div>
                      <h1 className="display-4 fw-bold mb-3" style={{color: "#ffc107"}}>
                        Welcome to
                        <br />
                        TLBC Data Center
                      </h1>
                      <p
                        className="lead mb-4"
                        style={{ color: "white", fontStyle: "italic" }}
                      >
                        This is for the members of TLBC International
                        <br />
                        Register with your correct information to be able to
                        login to the portal.
                      </p>
                      
                      <div
                        className={`button-container ${
                          buttonsVisible ? "fade-in" : ""
                        }`}
                        style={{ zIndex: 1, marginBottom: "2rem" }}
                      >
                        <Button
                          variant="warning"
                          size="lg"
                          className="w-50 custom-button me-2 mb-2"
                          style={{
                            fontWeight: "bolder",
                            fontSize: "1.5em",
                            color: "black",
                          }}
                          onClick={handleLoginClick}
                        >
                          Login
                        </Button>
                        <Button
                          variant="warning"
                          size="lg"
                          className="w-50 custom-button mb-2"
                          style={{
                            fontWeight: "bolder",
                            fontSize: "1.5em",
                            color: "black",
                          }}
                          onClick={handleRegisterClick}
                        >
                          Register
                        </Button>
                        <Button
                          variant="warning"
                          size="lg"
                          className="w-50 custom-button mb-2"
                          style={{
                            fontWeight: "bolder",
                            fontSize: "1.5em",
                            color: "black",
                          }}
                          onClick={handleFirstTimersClick}
                        >
                          First-Timer
                        </Button>
                      </div>


                
              
              </div>
            </Col>
          </Row>
        </Container>


        

      </div>

      
    </>
  );
};

export default Home;