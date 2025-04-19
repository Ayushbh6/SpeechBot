# Ticket 6: Token Integration

**Objective**
Use the fetched session to open a WebSocket and log events.

**Steps**
1. In `VoiceAgent.jsx`, after `fetchSession()`:
   ```js
   const socket = new WebSocket(session.ws_url)
   socket.addEventListener('open', () => {
     console.log('WebSocket open')
     // TODO: attach RTC/data channel
   })
   socket.addEventListener('message', evt => {
     console.log('WS message', evt.data)
   })
   ```
2. Store the socket in a `ref` for later cleanup.
3. Update `stopSession()` to call `socket.close()`.

**Acceptance Criteria**
- WebSocket connects to `ws_url`.
- “open” and “message” events appear in console.
- Stopping the session closes the socket.
