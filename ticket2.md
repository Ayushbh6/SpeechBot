# Ticket 2: Env & Config

**Objective**
Add environment variable setup and expose `OPENAI_API_KEY` to the Next.js app.

**Steps**
1. Create a file `.env.local` at project root containing:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```
2. Ensure `.env.local` is listed in `.gitignore`.
3. Open `next.config.js` and add to the export:
   ```js
   module.exports = {
     reactStrictMode: true,
     env: {
       OPENAI_API_KEY: process.env.OPENAI_API_KEY
     }
   }
   ```
4. Restart the dev server if it’s running.

**Acceptance Criteria**
- `.env.local` exists and is git‑ignored.
- `next.config.js` maps `OPENAI_API_KEY` correctly.
- `process.env.OPENAI_API_KEY` is defined in dev.
