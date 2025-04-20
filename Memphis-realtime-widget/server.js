import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get(process.env.TOKEN_PATH || '/token', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-realtime-preview-2024-12-17', voice: 'verse' })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Token generation error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(port, () => {
  console.log(`Token service listening at http://localhost:${port}${process.env.TOKEN_PATH || '/token'}`);
});
