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
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayOfWeek = now.getDay();
    const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    let serviceType;
    // if (dayOfWeek === 0) { // Sunday
    //   serviceType = "Sunday Service";
    // } else if (dayOfWeek === 3) { // Wednesday
    //   serviceType = "Midweek Service";
    // } else {
      // Time-based service types
      const time = hours * 60 + minutes;
      if (time >= 7 * 60 && time <= 13 * 60) {
        serviceType = "Morning Session";
      } else if (time >= 13 * 60 + 20 && time <= 17 * 60 + 30) {
        serviceType = "Afternoon Session";
      } else {
        serviceType = "Night Session";
      }


    const churchId = `${serviceType} ${dateString}`;

    const value = JSON.stringify({
      type: 'tlbc_attendance',
      churchId: churchId,
      date: dateString,
      serviceType: serviceType
    });
    setQrValue(value);
  };

  return (
    <Container className="text-center">
      <h1>TLBC Attendance QR Code</h1>
      <div className="my-4">
        <QRCode value={qrValue} size={256} />
      </div>
      <p>Display this QR code for members to scan.</p>
      <Button onClick={generateQRCode}>Generate New QR Code</Button>
    </Container>
  );
};

export default QRCodeGenerator;