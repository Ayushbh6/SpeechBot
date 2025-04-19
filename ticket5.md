# Ticket 5: VoiceAgent Scaffolding

**Objective**
Add a React component `VoiceAgent.jsx` with basic UI and state placeholders.

**Steps**
1. Create `components/VoiceAgent.jsx`:
   ```jsx
   'use client'
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
   ```
2. In `app/page.jsx`, import and render `<VoiceAgent />`.

**Acceptance Criteria**
- `VoiceAgent.jsx` exists and renders a toggle button.
- Clicking “Start” logs the session payload.
