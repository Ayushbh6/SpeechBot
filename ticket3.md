# Ticket 3: Token API Route

**Objective**
Implement a serverless API route at `/api/token` to create a realtime session with OpenAI.

**Steps**
1. Create file `app/api/token/route.js` (Next.js App Router):
   ```js
   export async function POST() {
     const res = await fetch(
       'https://api.openai.com/v1/realtime/sessions',
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           model: 'gpt-4o-mini-realtime',
           voice: 'verse'
         })
       }
     )
     const text = await res.text()
     if (!res.ok) {
       return new Response(text, { status: 500 })
     }
     return new Response(text, { status: 200 })
   }
   ```
2. Test it locally:
   ```bash
   curl -X POST http://localhost:3000/api/token
   ```
3. Verify you receive JSON with `session_token` and `ws_url`.

**Acceptance Criteria**
- POST `/api/token` returns valid session JSON.
- Errors return status 500 with the error body.
