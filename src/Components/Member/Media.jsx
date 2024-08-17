// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import YouTube from 'react-youtube';
// import ReactPlayer from 'react-player';
// import { Container, Row, Col, Form, Button, ListGroup, Card } from 'react-bootstrap';

// const Media = () => {
//   const [youtubeVideos, setYoutubeVideos] = useState([]);
//   const [telegramAudios, setTelegramAudios] = useState([]);
//   const [selectedMedia, setSelectedMedia] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const YOUTUBE_API_KEY = 'AIzaSyCRPxuqvfPeAZbBiZ6XenA_nInDthyQbMk';
//   const YOUTUBE_CHANNEL_ID = 'UCI5ww0BUr7nh9TeFv9C1GOg';
//   const BACKEND_URL = 'http://localhost:3001';

//   useEffect(() => {
//     fetchYoutubeVideos();
//     fetchTelegramAudios();
//   }, []);

//   const fetchYoutubeVideos = async () => {
//     try {
//       const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
//         params: {
//           part: 'snippet',
//           channelId: YOUTUBE_CHANNEL_ID,
//           maxResults: 10,
//           order: 'date',
//           type: 'video',
//           key: YOUTUBE_API_KEY,
//         },
//       });
//       setYoutubeVideos(response.data.items);
//     } catch (error) {
//       console.error('Error fetching YouTube videos:', error);
//     }
//   };

//   const fetchTelegramAudios = async () => {
//     try {
//       const response = await axios.get(`${BACKEND_URL}/telegram-audios`);
//       setTelegramAudios(response.data);
//     } catch (error) {
//       console.error('Error fetching Telegram audios:', error);
//     }
//   };

//   const handleSearch = () => {
//     const filteredYoutubeVideos = youtubeVideos.filter(video => 
//       video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     const filteredTelegramAudios = telegramAudios.filter(audio => 
//       audio.title.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     setYoutubeVideos(filteredYoutubeVideos);
//     setTelegramAudios(filteredTelegramAudios);
//   };

//   const handleMediaSelect = async (media) => {
//     if (media.kind === 'youtube#searchResult') {
//       setSelectedMedia(media);
//     } else {
//       try {
//         const response = await axios.get(`${BACKEND_URL}/telegram-audio-url`, {
//           params: { file_id: media.file_id },
//         });
//         setSelectedMedia({ ...media, url: response.data.url });
//       } catch (error) {
//         console.error('Error fetching Telegram audio file:', error);
//       }
//     }
//   };

//   return (
//     <Container className="my-4">
//       <Row>
//         <Col md={8}>
//           <Card>
//             <Card.Body>
//               {selectedMedia && (
//                 selectedMedia.kind === 'youtube#searchResult' ? (
//                   <YouTube videoId={selectedMedia.id.videoId} opts={{ width: '100%' }} />
//                 ) : (
//                   <ReactPlayer url={selectedMedia.url} controls width="100%" />
//                 )
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Form className="mb-3" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
//             <Form.Group>
//               <Form.Control 
//                 type="text" 
//                 placeholder="Search media" 
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </Form.Group>
//             <Button type="submit" className="mt-2">Search</Button>
//           </Form>
//           <ListGroup>
//             {youtubeVideos.map((video) => (
//               <ListGroup.Item 
//                 key={video.id.videoId} 
//                 onClick={() => handleMediaSelect(video)}
//                 action
//               >
//                 {video.snippet.title}
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//           <Card className="mb-4">
//             <Card.Header>Available Audios</Card.Header>
//             <ListGroup variant="flush">
//               {telegramAudios.map((audio, index) => (
//                 <ListGroup.Item 
//                   key={index} 
//                   onClick={() => handleMediaSelect(audio)}
//                   action
//                 >
//                   <div><strong>Title:</strong> {audio.title}</div>
//                   <div><strong>Duration:</strong> {audio.duration} seconds</div>
//                 </ListGroup.Item>
//               ))}
//             </ListGroup>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default Media;

























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
    const [audios, setAudios] = useState([]);
    
  
    const YOUTUBE_API_KEY = 'AIzaSyCHtLyB2revPlmom2N88Ps5Gs3q46MqRlw';
    const YOUTUBE_CHANNEL_ID = 'UCI5ww0BUr7nh9TeFv9C1GOg';
    const TELEGRAM_BOT_TOKEN = "7283674290:AAGVJ_H5ghtdomiZHuSYpadVeURu73bi5WA";
    const TELEGRAM_CHANNEL_ID = "-1002183626161";
  
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
      setTelegramAudios(audiosWithUrls);
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
        
  
    const handleSearch = () => {
      
      const filteredYoutubeVideos = youtubeVideos.filter(video => 
        video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredTelegramAudios = telegramAudios.filter(audio => 
        audio.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredYoutubeVideos.length === 0 && filteredTelegramAudios.length === 0) {
        setError("No results found.");
      } else {
        setError(""); 
        setYoutubeVideos(filteredYoutubeVideos);
        setTelegramAudios(filteredTelegramAudios);
      }
    };

    const handleClearSearch = () => {
      setSearchTerm('');
      fetchYoutubeVideos();
      fetchTelegramAudios();
      setError("");  
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
      <h1 className="mb-4" style={{ textAlign: "center" }}>Messages by <br/>Reverend Elochukwu Udegbunam</h1>
        <p style={{ textAlign: "center" }}>Below are messages by <br/>Reverend Elochukwu Udegbunam. <br/> Click on any to listen to it</p>

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
                {error && <Alert variant="danger">{error}</Alert>}
              </Card.Header>

             <Row>
        <Col md={12}>
          <Card className="mb-4 mt-2">
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
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };

export default Media;