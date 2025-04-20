import { useRef, useState } from 'react';
import { Mic, X } from 'react-feather';

export default function RealtimeWidget({ tokenUrl }) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);

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
  }

  return (
    <div style={{ display: 'inline-block' }}>
      {isActive ? (
        <button onClick={stopSession} title='Stop'><X color='red'/></button>
      ) : (
        <button onClick={startSession} title='Talk'><Mic color='green'/></button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
