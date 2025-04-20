import React from 'react';
import ReactDOM from 'react-dom/client';
import RealtimeWidget from './components/RealtimeWidget';

const mountSelector = '#realtime-widget';
const tokenUrl = import.meta.env.VITE_TOKEN_URL || `${location.origin}${import.meta.env.VITE_TOKEN_PATH || '/token'}`;

function initWidget() {
  const mountPoint = document.querySelector(mountSelector);
  if (mountPoint) {
    ReactDOM.createRoot(mountPoint).render(<RealtimeWidget tokenUrl={tokenUrl} />);
  } else {
    console.error(`Mount point '${mountSelector}' not found`);
  }
}

initWidget();
