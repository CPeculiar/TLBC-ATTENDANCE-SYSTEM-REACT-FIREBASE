import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import QRCode from 'qrcode.react';

const QRCodeGenerator = () => {
  const [qrValue, setQrValue] = useState('');
  const [serviceType, setServiceType] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [serviceType]);

  const generateQRCode = () => {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    // let serviceType;
    //   const time = hours * 60 + minutes;
    //   if (time >= 7 * 60 && time <= 13 * 60) {
    //     serviceType = "Morning Session";
    //   } else if (time >= 13 * 60 + 20 && time <= 17 * 60 + 30) {
    //     serviceType = "Afternoon Session";
    //   } else {
    //     serviceType = "Night Session";
    //   }

    if (!serviceType) {
      const time = now.getHours() * 60 + now.getMinutes();
      if (time >= 7 * 60 && time <= 13 * 60) {
        setServiceType("Morning Session");
      } else if (time >= 13 * 60 + 20 && time <= 17 * 60 + 30) {
        setServiceType("Afternoon Session");
      } else {
        setServiceType("Evening Session");
      }
    }

    const churchId = `${serviceType}_${dateString}`;

    const value = JSON.stringify({
      type: 'tlbc_attendance',
      churchId: churchId,
      date: dateString,
      serviceType: serviceType
    });
    setQrValue(value);
  };

  const handleServiceTypeChange = (e) => {
    setServiceType(e.target.value);
  };

  return (
    <Container className="text-center">
      <h1>TLBC Attendance QR Code</h1>
      <Form.Group className="mb-3">
        <Form.Label>Select Session Type</Form.Label>
        <Form.Control as="select" value={serviceType} onChange={handleServiceTypeChange}>
          <option value="">Auto-detect</option>
          <option value="Morning Session">Morning Session</option>
          <option value="Afternoon Session">Afternoon Session</option>
          <option value="Evening Session">Evening Session</option>
        </Form.Control>
      </Form.Group>
      <div className="my-4">
        <QRCode value={qrValue} size={256} />
      </div>
      <p>Display this QR code for members to scan.</p>
      <Button onClick={generateQRCode}>Generate New QR Code</Button>
    </Container>
  );
};

export default QRCodeGenerator;