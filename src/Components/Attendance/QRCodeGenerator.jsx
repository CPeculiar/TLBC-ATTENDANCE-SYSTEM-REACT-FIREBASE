import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import QRCode from 'qrcode.react';

const QRCodeGenerator = () => {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    let serviceType;
    if (dayOfWeek === 0) { // Sunday
      serviceType = "Sunday Service";
    } else if (dayOfWeek === 3) { // Wednesday
      serviceType = "Midweek Service";
    } else {
      serviceType = "Other Service";
    }

    const churchId = `${serviceType} ${dateString}`;

    const value = JSON.stringify({
      type: 'church_attendance',
      churchId: churchId
    });
    setQrValue(value);
  };

  return (
    <Container className="text-center">
      <h1>Today's Attendance QR Code</h1>
      <div className="my-4">
        <QRCode value={qrValue} size={256} />
      </div>
      <p>Display this QR code for church members to scan.</p>
      <Button onClick={generateQRCode}>Scan this QR Code</Button>
    </Container>
  );
};

export default QRCodeGenerator;