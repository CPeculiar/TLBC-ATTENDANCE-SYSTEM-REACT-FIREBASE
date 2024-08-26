import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Clock, PhoneCall, TrendingUp } from 'lucide-react';

const TLBCAttendancePage = () => {
  return (
    <Container fluid className="p-0 d-flex flex-column vh-100" style={{ backgroundColor: '#87CEEB' }}>
      {/* Header */}
      <Row className="m-0 p-2 bg-primary text-white">
        <Col className="d-flex justify-content-between align-items-center">
          <span>12:30</span>
          <h2 className="mb-0">FinClock</h2>
          <Button variant="link" className="text-white p-0">
            <i className="bi bi-power"></i>
          </Button>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="m-0 flex-grow-1 bg-light">
        <Col className="d-flex flex-column align-items-center justify-content-center">
          <Card className="text-center mb-3" style={{ width: '150px', height: '150px', borderRadius: '75px', overflow: 'hidden' }}>
            <Card.Img variant="top" src="/api/placeholder/150/150" alt="Profile" />
          </Card>
          <h3>Ann Keen</h3>
          <p className="text-muted">Post : Test</p>
          <Button variant="success" className="mb-2 w-75">
            <i className="bi bi-door-open me-2"></i> CHECK IN
          </Button>
          <Button variant="danger" className="mb-2 w-75">
            <i className="bi bi-door-closed me-2"></i> CHECK OUT
          </Button>
        </Col>
      </Row>

      {/* Footer */}
      <Row className="m-0 bg-primary text-white">
        <Col className="d-flex justify-content-around py-2">
          <Button variant="link" className="text-white d-flex flex-column align-items-center">
            <Clock size={24} />
            <small>Clocking</small>
          </Button>
          <Button variant="link" className="text-white d-flex flex-column align-items-center">
            <PhoneCall size={24} />
            <small>Leave Request</small>
          </Button>
          <Button variant="link" className="text-white d-flex flex-column align-items-center">
            <TrendingUp size={24} />
            <small>Pai Assistant</small>
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default TLBCAttendancePage;