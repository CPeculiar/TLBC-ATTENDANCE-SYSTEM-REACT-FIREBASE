import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import ReactPlayer from 'react-player';
import { Container, Row, Col, Form, Button, ListGroup, Card, Alert } from 'react-bootstrap';

const Media = () => {
    const [youtubeVideos, setYoutubeVideos] = useState([]);
    const [telegramAudios, setTelegramAudios] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(""); 
  
    const YOUTUBE_API_KEY = 'AIzaSyCHtLyB2revPlmom2N88Ps5Gs3q46MqRlw';
    const YOUTUBE_CHANNEL_ID = 'UCI5ww0BUr7nh9TeFv9C1GOg';
    const TELEGRAM_BOT_TOKEN = '7283674290:AAGVJ_H5ghtdomiZHuSYpadVeURu73bi5WA';
    const TELEGRAM_CHANNEL_ID = '@tlbcprojecttestchannel';
  
    useEffect(() => {
      fetchYoutubeVideos();
      fetchTelegramAudios();
    }, []);
  
    const fetchYoutubeVideos = async () => {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            channelId: YOUTUBE_CHANNEL_ID,
            maxResults: 10,
            order: 'date',
            type: 'video',
            key: YOUTUBE_API_KEY,
          },
        });
        setYoutubeVideos(response.data.items);
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        console.error('Error fetching YouTube videos:', error.response ? error.response.data : error.message);
      }
    };
  
    const fetchTelegramAudios = async () => {
      try {
        const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
          params: {
            chat_id: TELEGRAM_CHANNEL_ID,
            allowed_updates: ['channel_post'],
          },
        });
        
        const audios = response.data.result
          .filter(update => update.channel_post && update.channel_post.audio)
          .map(update => ({
            file_id: update.channel_post.audio.file_id,
            title: update.channel_post.audio.title || 'Untitled Audio',
            duration: update.channel_post.audio.duration,
          }));
        
        setTelegramAudios(audios);
      } catch (error) {
        console.error('Error fetching Telegram audios:', error);
      }
    };
  
    const handleSearch = () => {
      // Implement search functionality for both YouTube videos and Telegram audios
      const filteredYoutubeVideos = youtubeVideos.filter(video => 
        video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredTelegramAudios = telegramAudios.filter(audio => 
        audio.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredYoutubeVideos.length === 0 && filteredTelegramAudios.length === 0) {
        setError("No results found.");
      } else {
        setError(""); // Clear error message
        setYoutubeVideos(filteredYoutubeVideos);
        setTelegramAudios(filteredTelegramAudios);
      }
    };

    const handleClearSearch = () => {
      setSearchTerm('');
      fetchYoutubeVideos();
      fetchTelegramAudios();
      setError(""); // Clear error message  
    };
  
    const handleMediaSelect = async (media) => {
      if (media.kind === 'youtube#searchResult') {
        setSelectedMedia(media);
      } else {
        try {
          const fileResponse = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`, {
            params: { file_id: media.file_id },
          });
          const filePath = fileResponse.data.result.file_path;
          const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
          setSelectedMedia({ ...media, url: audioUrl });
        } catch (error) {
          console.error('Error fetching Telegram audio file:', error);
        }
      }
    };
  
    return (
      <Container className="my-4">
      <h1 className="mb-4" style={{ textAlign: "center" }}>Messages by Reverend Elochukwu Udegbunam</h1>
        <p style={{ textAlign: "center" }}>Click to listen to any of the messages below by <br/>Reverend Elochukwu Udegbunam.</p>

        <Form className="mb-3" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Search media" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                   className="mr-2 mb-2"
                />
              </Form.Group>
              <Button type="submit" className="mt-2">Search</Button>
              <Button variant="secondary" onClick={handleClearSearch}>Clear</Button>
            </Form>
            {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

        <Row>
          <Col md={8} style={{textAlign: 'center', marginTop: '1.3em'}}>
            {/* <Card> */}
            <Card className="mb-4">
              <Card.Header>
                <Card.Title>Media Player</Card.Title>
              </Card.Header>

              <Card.Body>
                {selectedMedia && (
                  selectedMedia.kind === 'youtube#searchResult' ? (
                    <YouTube videoId={selectedMedia.id.videoId} opts={{ width: '100%' }} />
                  ) : (
                    <ReactPlayer url={selectedMedia.url} controls width="100%" />
                  )
                )}
              </Card.Body>
              </Card>
            {/* </Card> */}
          </Col>

          <Col md={8} style={{textAlign: 'center'}}>
          <Card className="mb-4">
              <Card.Header>
                <Card.Title>YouTube Videos</Card.Title>
              </Card.Header>
            <ListGroup variant="flush">
              {youtubeVideos.map((video) => (
                <ListGroup.Item 
                  key={video.id.videoId} 
                  onClick={() => handleMediaSelect(video)}
                  action
                >
                  {video.snippet.title}
                </ListGroup.Item>
              ))}
              </ListGroup>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Telegram Audios</Card.Title>
              </Card.Header>
              <ListGroup variant="flush">
              {telegramAudios.map((audio, index) => (
                <ListGroup.Item 
                  key={index} 
                  onClick={() => handleMediaSelect(audio)}
                  action
                >
                  {audio.title}
                </ListGroup.Item>
              ))}
            </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };

export default Media;