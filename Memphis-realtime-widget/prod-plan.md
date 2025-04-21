 # Production Readiness Plan

 This document lays out a simple, minimal plan to get the Memphis Realtime Widget and its token server into production.

 ## 1) Secure & Parameterize Token Server
 - Update `server.js` to read model/voice from environment:
   ```js
   const MODEL = process.env.MODEL || 'gpt-4o-mini-realtime-preview-2024-12-17';
   const VOICE = process.env.VOICE || 'verse';
   
   // in fetch body:
   body: JSON.stringify({ model: MODEL, voice: VOICE })
   ```
 - Lock down CORS to only your site:
   ```js
   import cors from 'cors';
   app.use(
     cors({ origin: process.env.ALLOWED_ORIGIN })
   );
   ```
 - In `.env.example`, add:
   ```dotenv
   OPENAI_API_KEY=your-openai-api-key
   PORT=3001
   TOKEN_PATH=/token
   MODEL=gpt-4o-mini-realtime-preview-2024-12-17
   VOICE=verse
   ALLOWED_ORIGIN=https://your-company-domain.com
   ```
 - Deploy this server to a Node.js host (e.g., Vercel, Heroku, Render). Configure real `OPENAI_API_KEY`, `ALLOWED_ORIGIN`, etc., in the host’s env settings.

 ## 2) Build Static Widget for Production
 - Configure Vite’s `base` in `vite.config.js`:
   ```js
   export default defineConfig({
     root: 'src',
     base: '/widget/',            // where it will be served
     plugins: [react()],
     build: {
       outDir: '../dist',
       emptyOutDir: true,
     },
     server: { proxy: { '/token': /* unused in prod */ } }
   });
   ```
 - Create `.env.production`:
   ```dotenv
   VITE_TOKEN_URL=https://realtime-token.your-app.com/token
   ```
 - Run the build:
   ```bash
   npm install
   npm run build      # picks up .env.production, outputs dist/
   ```

 ## 3) Host on GoDaddy
 - Upload the entire `dist/` folder under `public_html/widget/` via FTP or cPanel.
 - Verify static assets by visiting:
   `https://your-company-domain.com/widget/index.html`

 ## 4) Embed on Your Home Page
 **Option A: iFrame** (fastest):
 ```html
 <iframe
   src="/widget/index.html"
   style="width:350px;height:400px;border:none;"
   title="AI Chat Widget">
 </iframe>
 ```
 **Option B: Direct Script Embed** (next step):
 - Later, convert to a library build (`vite build --lib`) for:
   ```html
   <script type="module" src="/widget/realtime-widget.js"></script>
   <div id="realtime-widget"></div>
   ```

 ## 5) Future Hardening (optional)
 - Add retry and user‑facing error handling in the widget UI.
 - Instrument token server with logs/metrics for monitoring.
 - Automate builds and deployment via CI/CD (GitHub → host).
 - Ensure both widget and token server run on HTTPS in production.