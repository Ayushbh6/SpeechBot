"use client"
import { useState, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { fetchSession } from '../lib/session'

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
      }
      source.connect(processor)
      processor.connect(audioContext.destination)
      
      // Proceed to establish session
      const session = await fetchSession()
      console.log('Session info:', session)
      // Open WebSocket connection to the realtime session
      const socket = new WebSocket(session.ws_url)
      socketRef.current = socket
      socket.addEventListener('open', () => {
        console.log('WebSocket open')
        // Send the system prompt first
        sendSystemPrompt()
        // TODO: attach RTC/data channel
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