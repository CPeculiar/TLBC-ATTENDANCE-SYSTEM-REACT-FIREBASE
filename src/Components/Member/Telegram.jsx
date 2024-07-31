import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, ListGroup, Alert } from 'react-bootstrap';

const TelegramAudios = () => {
  const [audios, setAudios] = useState([]);
  const [error, setError] = useState("");

  const TELEGRAM_BOT_TOKEN = "7283674290:AAGVJ_H5ghtdomiZHuSYpadVeURu73bi5WA"; // Replace with your actual bot token
  const TELEGRAM_CHANNEL_ID = "-1002183626161"; // Replace with your actual channel ID

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      const updatesResponse = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const audiosData = updatesResponse.data.result
        .filter(update => update.channel_post && update.channel_post.audio)
        .map(async (update) => {
          const audio = update.channel_post.audio;
          const filePathResponse = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${audio.file_id}`);
          const filePath = filePathResponse.data.result.file_path;
          const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

          return {
            title: audio.title || "Untitled",
            performer: audio.performer || "Unknown",
            duration: audio.duration,
            fileUrl: audioUrl
          };
        });

      const audiosWithUrls = await Promise.all(audiosData);

      if (audiosWithUrls.length === 0) {
        setError("No audios found.");
      } else {
        setError("");
      }

      setAudios(audiosWithUrls);
    } catch (error) {
      console.error("Error fetching Telegram audios:", error);
      setError("Error fetching Telegram audios.");
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Container className="my-4">
      <h1 className="mb-4" style={{ textAlign: 'center' }}>Telegram Audios</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header>Available Audios</Card.Header>
            <ListGroup variant="flush">
              {audios.map((audio, index) => (
                <ListGroup.Item key={index}>
                  <div><strong>Title:</strong> {audio.title}</div>
                  <div><strong>Performer:</strong> {audio.performer}</div>
                  <div><strong>Duration:</strong> {formatDuration(audio.duration)}</div>
                  <audio controls>
                    <source src={audio.fileUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TelegramAudios;
