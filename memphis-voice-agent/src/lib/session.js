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
  const res = await fetch('/api/token', { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Token API error: ${res.statusText}`);
  }
  /** @type {SessionResponse} */
  const data = await res.json();
  return data;
}