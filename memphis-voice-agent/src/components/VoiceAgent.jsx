"use client"
import { useState, useRef } from 'react'
import { fetchSession } from '../lib/session'

export default function VoiceAgent() {
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Ref to hold the WebSocket instance across renders
  const socketRef = useRef(null)

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