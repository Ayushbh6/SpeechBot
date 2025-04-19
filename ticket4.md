# Ticket 4: Session Helper & Types

**Objective**
Create a helper function in `lib/session.js` to fetch and validate session data, with JSDoc types.

**Steps**
1. Create `lib/session.js`:
   ```js
   /**
    * @typedef {Object} SessionResponse
    * @property {string} session_token
    * @property {string} ws_url
    * @property {string} url
    */

   /**
    * Fetches a realtime session from the token API.
    * @returns {Promise<SessionResponse>}
    */
   export async function fetchSession() {
     const res = await fetch('/api/token', { method: 'POST' })
     if (!res.ok) {
       throw new Error(`Token API error: ${res.statusText}`)
     }
     /** @type {SessionResponse} */
     const data = await res.json()
     return data
   }
   ```
2. Import and log `fetchSession()` in a component to verify behavior.

**Acceptance Criteria**
- `lib/session.js` exports `fetchSession`.
- JSDoc typedef present.
- Errors throw on non‑OK responses.
