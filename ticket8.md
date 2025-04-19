# Ticket 8: Basic UI & Controls

**Objective**
Capture microphone audio, send it, and play back the model’s TTS response.

**Steps**
1. (Optional) Install OpenAI’s realtime SDK:
   ```bash
   npm install @openai/realtime-sdk
   ```
2. In `VoiceAgent.jsx`, request mic access:
   ```js
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
   ```
3. Pipe PCM chunks into your RTC/data channel via the SDK (`audio.start`, etc.).
4. Add an `<audio>` element for playback:
   ```jsx
   <audio ref={audioRef} autoPlay muted={!userInteracted} />
   ```
5. Track `userInteracted` so audio only unmutes after the first click.

**Acceptance Criteria**
- Mic permission prompt appears.
- Speaking logs audio events.
- Model’s audio response plays.
