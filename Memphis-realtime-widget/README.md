# Memphis Realtime Widget

The `memphis-realtime-widget` project provides a lightweight React component and accompanying token service to integrate OpenAI's real-time speech streaming (via WebRTC) into your applications.

## Features

- Start/stop real-time audio sessions with a single click
- Uses OpenAI's Real-Time API (e.g., `gpt-4o-mini-realtime-preview-2024-12-17`)
- Built with React, Vite, and Express
- Local token server to securely fetch ephemeral client tokens

## Prerequisites

- Node.js v18 or higher
- An OpenAI API key with access to the real-time preview

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/memphis-realtime-widget.git
cd memphis-realtime-widget

# Install dependencies
npm install
```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your values:
   ```dotenv
   OPENAI_API_KEY=your-openai-api-key
   PORT=3001
   TOKEN_PATH=/token
   ```

## Available Scripts

- `npm run dev`  
  Starts the Express token server (default port `3001`) and the Vite dev server (port `5173`, proxies `/token` to the token service).
- `npm run build`  
  Bundles the widget into the `dist/` directory for production.
- `npm run preview`  
  Serves the production build locally using Vite.

## Environment Variables

| Variable         | Description                                        | Default  |
| ---------------- | -------------------------------------------------- | -------- |
| `OPENAI_API_KEY` | OpenAI API key for generating real-time sessions   | _required_ |
| `PORT`           | Port for the token service                         | `3001`   |
| `TOKEN_PATH`     | HTTP path to fetch a new token                     | `/token` |

## Usage

Import and render the `RealtimeWidget` component in your React application:

```jsx
import React from 'react';
import RealtimeWidget from './components/RealtimeWidget';

function App() {
  return (
    <div>
      <h1>Realtime Speech Widget Demo</h1>
      <RealtimeWidget tokenUrl="http://localhost:3001/token" />
    </div>
  );
}

export default App;
```

Be sure the token server (via `npm run dev`) is running before interacting with the widget.

## Project Structure

```plaintext
.
├── src/
│   ├── components/
│   │   └── RealtimeWidget.jsx    # Main React widget
│   ├── entry-client.jsx         # Vite entry point
│   └── index.html               # Vite HTML template
├── server.js                    # Express token server
├── vite.config.js               # Vite configuration and proxy setup
├── .env.example                 # Sample environment variables
├── README.md                    # Project documentation
├── package.json                 # Project metadata and scripts
└── .gitignore                   # Ignored files and directories
```

## Server Details

The Express server in `server.js` exposes a single endpoint (`TOKEN_PATH`) that:

1. Receives incoming GET requests
2. Calls OpenAI's `/v1/realtime/sessions` endpoint with your API key
3. Returns a JSON payload containing the ephemeral client token

This token is used by the frontend widget to establish a secure WebRTC connection.

## License

This project is marked as `private` and is not published to npm. Use and adapt freely within your organization. 