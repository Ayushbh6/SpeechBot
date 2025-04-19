# Ticket 10: End-to-End Testing

**Objective**
Confirm the full speech‑to‑speech cycle works locally.

**Steps**
1. Run the dev server:
   ```bash
   npm run dev
   ```
2. Open `https://localhost:3000` (or `http://localhost:3000`).
3. Click the widget, grant mic access, and speak.
4. Watch for:
   - System prompt event.
   - User audio events.
   - Response deltas logged.
   - Response audio playback.
5. Separately test `/api/token` with:
   ```bash
   curl -X POST http://localhost:3000/api/token
   ```
6. Inspect console for CORS/fetch/WebRTC errors.

**Acceptance Criteria**
- Everything runs without uncaught errors.
- Events flow correctly.
- Audio playback is audible.
