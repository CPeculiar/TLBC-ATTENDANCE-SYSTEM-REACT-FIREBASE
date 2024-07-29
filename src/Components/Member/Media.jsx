import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import ReactPlayer from 'react-player';
import { Container, Row, Col, Form, Button, ListGroup, Card } from 'react-bootstrap';      

const Media = () => {
    const [youtubeVideos, setYoutubeVideos] = useState([]);
    const [telegramAudios, setTelegramAudios] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
  
    const YOUTUBE_API_KEY = 'AIzaSyCRPxuqvfPeAZbBiZ6XenA_nInDthyQbMk';
    const YOUTUBE_CHANNEL_ID = 'UCI5ww0BUr7nh9TeFv9C1GOg';
    const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
    const TELEGRAM_CHANNEL_ID = 'YOUR_TELEGRAM_CHANNEL_ID';
  
    useEffect(() => {
      fetchYoutubeVideos();
      fetchTelegramAudios();
    }, []);
  
    const fetchYoutubeVideos = async () => {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            channelId: 'UCI5ww0BUr7nh9TeFv9C1GOg',
            maxResults: 10,
            order: 'date',
            type: 'video',
            key: 'AIzaSyCRPxuqvfPeAZbBiZ6XenA_nInDthyQbMk',
          },
        });
        setYoutubeVideos(response.data.items);
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        console.error('Error fetching YouTube videos:', error.response ? error.response.data : error.message);
      }
    };
  
    const fetchTelegramAudios = async () => {
      console.log('Fetching Telegram audios...');
    };
  
    const handleSearch = () => {
      console.log('Searching for:', searchTerm);
    };
  
    const handleMediaSelect = (media) => {
      setSelectedMedia(media);
    };
  
    return (
      <Container className="my-4">
        <Row>
          <Col md={8}>
            <Card>
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
          </Col>
          <Col md={4}>
            <Form className="mb-3" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Search media" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" className="mt-2">Search</Button>
            </Form>
            <ListGroup>
              {youtubeVideos.map((video) => (
                <ListGroup.Item 
                  key={video.id.videoId} 
                  onClick={() => handleMediaSelect(video)}
                  action
                >
                  {video.snippet.title}
                </ListGroup.Item>
              ))}
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
          </Col>
        </Row>
      </Container>
    );
  };


export default Media;