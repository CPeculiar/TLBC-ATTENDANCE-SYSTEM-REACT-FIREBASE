/// <reference path="./global.d.ts" />

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3001;  // Make sure this doesn't conflict with your React app's port

app.use(cors());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

app.get('/telegram-audios', async (req, res) => {
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

    res.json(audios);
  } catch (error) {
    console.error('Error fetching Telegram audios:', error);
    res.status(500).json({ error: 'Error fetching Telegram audios' });
  }
});

app.get('/telegram-audio-url', async (req, res) => {
  const fileId = req.query.file_id;
  if (!fileId) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const fileResponse = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`, {
      params: { file_id: fileId },
    });
    const filePath = fileResponse.data.result.file_path;
    const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    res.json({ url: audioUrl });
  } catch (error) {
    console.error('Error fetching Telegram audio file:', error);
    res.status(500).json({ error: 'Error fetching Telegram audio file' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});