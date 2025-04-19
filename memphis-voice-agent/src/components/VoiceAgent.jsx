"use client"
import { useState } from 'react'
import { fetchSession } from '../lib/session'

export default function VoiceAgent() {
  const [isSessionActive, setIsSessionActive] = useState(false)

  async function startSession() {
    try {
      const session = await fetchSession()
      console.log('Session info:', session)
      // TODO: initialize WebRTC/data channel
      setIsSessionActive(true)
    } catch (err) {
      console.error(err)
    }
  }

  function stopSession() {
    // TODO: clean up connection
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