# Ticket 1: Project Bootstrap

**Objective**
Initialize a new Next.js project named `memphis-voice-agent`, install dependencies, set up git, and verify the development server runs locally.

**Steps**
1. Open a terminal and navigate to your development folder.
2. Scaffold a Next.js app:
   ```bash
   npx create-next-app@latest memphis-voice-agent --use-npm --app
   ```
   - Choose JavaScript (not TypeScript).
   - Accept default options.
3. Enter the directory:
   ```bash
   cd memphis-voice-agent
   ```
4. If needed, install dependencies:
   ```bash
   npm install
   ```
5. Initialize Git (if not auto‐initialized):
   ```bash
   git init
   git add .
   git commit -m 'chore: initial Next.js scaffold'
   ```
6. Run the dev server:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:3000` and confirm the Next.js welcome page appears.

**Acceptance Criteria**
- Directory `memphis-voice-agent/` contains a Next.js scaffold.
- Git repo initialized with one commit.
- `npm run dev` runs without errors.
- Welcome page is visible at port 3000.
