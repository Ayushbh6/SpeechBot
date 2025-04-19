"use client"
import { useState, useRef } from 'react'
import { fetchSession } from '../lib/session'

export default function VoiceAgent() {
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Ref to hold the WebSocket instance across renders
  const socketRef = useRef(null)

  async function startSession() {
    try {
      const session = await fetchSession()
      console.log('Session info:', session)
      // Open WebSocket connection to the realtime session
      const socket = new WebSocket(session.ws_url)
      socketRef.current = socket
      socket.addEventListener('open', () => {
        console.log('WebSocket open')
        // TODO: attach RTC/data channel
      })
      socket.addEventListener('message', evt => {
        console.log('WS message', evt.data)
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
    <div>
      <button onClick={isSessionActive ? stopSession : startSession}>
        {isSessionActive ? 'Stop' : 'Start'} Voice Agent
      </button>
    </div>
  )
}