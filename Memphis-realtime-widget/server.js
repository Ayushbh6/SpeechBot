import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
// Configuration from environment
const MODEL = process.env.MODEL || 'gpt-4o-mini-realtime-preview-2024-12-17';
const VOICE = process.env.VOICE || 'verse';
const TOKEN_PATH = process.env.TOKEN_PATH || '/token';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

// Restrict CORS to the allowed origin
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Token endpoint path configurable via TOKEN_PATH
app.get(TOKEN_PATH, async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, voice: VOICE })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Token generation error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(port, () => {
  console.log(`Token service listening at http://localhost:${port}${TOKEN_PATH}`);
});
