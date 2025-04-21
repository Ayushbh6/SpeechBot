import { useRef, useState } from 'react';
import BlobVisualizer from './BlobVisualizer';

export default function RealtimeWidget({ tokenUrl }) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0);
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const meterAnimRef = useRef(null);

  async function startSession() {
    setError(null);
    try {
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      const EPHEMERAL_KEY = tokenData.client_secret.value;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      audioRef.current = document.createElement('audio');
      audioRef.current.autoplay = true;
      pc.ontrack = (e) => { audioRef.current.srcObject = e.streams[0]; };

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(mediaStream.getTracks()[0], mediaStream);
      // setup volume metering
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const sourceNode = audioCtx.createMediaStreamSource(mediaStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayRef.current = dataArray;
      // start meter loop
      function updateMeter() {
        const arr = dataArrayRef.current;
        analyserRef.current.getByteTimeDomainData(arr);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
          const x = (arr[i] - 128) / 128;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / arr.length);
        setVolume(rms);
        meterAnimRef.current = requestAnimationFrame(updateMeter);
      }
      updateMeter();

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onopen = () => setIsActive(true);
      dc.onmessage = (e) => console.log('Server event:', JSON.parse(e.data));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp'
        }
      });
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (err) {
      console.error(err);
      setError('Failed to start session');
    }
  }

  function stopSession() {
    setIsActive(false);
    setVolume(0);
    if (dcRef.current) dcRef.current.close();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => sender.track?.stop());
      pcRef.current.close();
    }
    pcRef.current = null;
    dcRef.current = null;
    // stop meter
    cancelAnimationFrame(meterAnimRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    meterAnimRef.current = null;
  }

  const toggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '16px' }}>
        <BlobVisualizer
          isActive={isActive}
          volume={volume}
          onClick={toggleSession}
          size={120}
        />
      </div>
      
      <button 
        onClick={toggleSession}
        style={{
          background: 'white',
          border: 'none',
          borderRadius: '9999px',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          cursor: 'pointer',
          transition: 'box-shadow 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}
      >
        <svg 
          style={{ marginRight: '8px' }} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={isActive ? "#10b981" : "#8b5cf6"} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
        <span style={{ color: '#8b5cf6', fontWeight: '500' }}>Talk to Our AI Assistant</span>
      </button>
      
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '12px' }}>{error}</div>}
    </div>
  );
}