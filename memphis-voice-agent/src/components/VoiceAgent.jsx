"use client"
import { useState, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { fetchSession } from '../lib/session'

/**
 * Convert a Float32Array buffer to an ArrayBuffer of 16-bit PCM little-endian.
 */
function float32ToInt16(buffer) {
  const l = buffer.length
  const int16 = new Int16Array(l)
  for (let i = 0; i < l; i++) {
    let s = Math.max(-1, Math.min(1, buffer[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16.buffer
}

export default function VoiceAgent() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  // Track if user has interacted to unmute audio
  const [userInteracted, setUserInteracted] = useState(false)

  // Ref to hold the WebSocket instance across renders
  const socketRef = useRef(null)
  // Ref to audio element for TTS playback
  const audioRef = useRef(null)

  /**
   * Send the Memphis AI system prompt as the first message.
   */
  function sendSystemPrompt() {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send system prompt, socket not open')
      return
    }
    const systemEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: `You are **Memphis AI**, a helpful assistant on memphis-ai.com.\n\nOnly answer questions related to Memphis AI or its services. If asked about something else, politely redirect.\n\n**Memphis AI Services**\n• AI Information Retrieval Systems – find & surface the right data at the right time.\n• Agentic AI Workflows – autonomous agents that streamline business processes.\n• Conversational AI Assistants – 24/7 virtual support that learns from each interaction.\n\nFocus on practical benefits and measurable results. When relevant, suggest which service best matches the visitor’s problem.`
          }
        ]
      }
    }
    console.log('Sending system prompt:', systemEvent)
    socket.send(JSON.stringify(systemEvent))
  }

  async function startSession() {
    try {
      // Mark that the user has interacted (for audio unmute)
      setUserInteracted(true)
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Mic stream obtained', stream)
      // Analyze audio input for logging
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0)
        console.log('Audio chunk', data)
        // Send PCM data as 16-bit to WebSocket
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const int16 = float32ToInt16(data)
          socketRef.current.send(int16)
        }
      }
      source.connect(processor)
      // Do not connect processor to destination to avoid feedback
      // processor.connect(audioContext.destination)
      
      // Proceed to establish session
      const session = await fetchSession()
      console.log('Session info:', session)
      // Open WebSocket connection to the realtime session
      // Determine WebSocket endpoint: prefer ws_url, then url, else construct manually
      let wsEndpoint = session.ws_url || session.url
      if (!wsEndpoint) {
        // Fallback: use session.id and session.client_secret.value (session_token)
        const token = session.client_secret?.value || session.session_token
        wsEndpoint = `wss://api.openai.com/v1/realtime/sessions/${session.id}?session_token=${token}`
        console.warn('Using fallback wsEndpoint:', wsEndpoint)
      }
      const socket = new WebSocket(wsEndpoint)
      socketRef.current = socket
      socket.addEventListener('open', () => {
        console.log('WebSocket open')
        // Send the system prompt first
        sendSystemPrompt()
        // Signal start of audio stream
        const startEvent = {
          type: 'audio.start',
          audio: {
            encoding: 'linear16',
            sample_rate: audioContext.sampleRate,
            channels: 1
          }
        }
        console.log('Sending audio.start', startEvent)
        socket.send(JSON.stringify(startEvent))
      })
      socket.addEventListener('message', evt => {
        // Handle text vs. binary frames
        if (typeof evt.data === 'string') {
          console.log('WS message', evt.data)
        } else if (evt.data instanceof Blob) {
          console.log('WS binary message (Blob)', evt.data)
          // Play TTS audio blob
          const url = URL.createObjectURL(evt.data)
          if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.play().catch((err) => console.error('Audio play error', err))
          }
        } else if (evt.data instanceof ArrayBuffer) {
          console.log('WS binary message (ArrayBuffer)', evt.data)
          const blob = new Blob([evt.data], { type: 'audio/webm; codecs=opus' })
          const url = URL.createObjectURL(blob)
          if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.play().catch((err) => console.error('Audio play error', err))
          }
        }
      })
      setIsSessionActive(true)
    } catch (err) {
      console.error('Error starting session:', err)
    }
  }

  function stopSession() {
    // Close WebSocket connection if exists
    if (socketRef.current) {
      // Signal end of audio stream
      try {
        socketRef.current.send(JSON.stringify({ type: 'audio.stop' }))
        console.log('Sent audio.stop')
      } catch (e) {
        console.warn('Failed to send audio.stop', e)
      }
      socketRef.current.close()
      socketRef.current = null
      console.log('WebSocket closed')
    }
    setIsSessionActive(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={isSessionActive ? stopSession : startSession}
        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
        aria-label={isSessionActive ? 'Stop Voice Agent' : 'Start Voice Agent'}
      >
        {isSessionActive ? (
          <FaMicrophoneSlash size={24} />
        ) : (
          <FaMicrophone size={24} />
        )}
      </button>
      {/* Hidden audio element for model TTS playback */}
      <audio ref={audioRef} autoPlay muted={!userInteracted} className="hidden" />
    </div>
  )
}