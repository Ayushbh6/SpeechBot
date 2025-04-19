# Deploying Memphis AI’s Realtime Voice Agent

> **Goal** – Embed a one‑button widget on your public site so visitors can talk to **Memphis AI** in real‑time (speech‑to‑speech) powered by ``.
>
> **Audience** – Solo developer, small budget, React/Next familiarity.

---

## 0 . 10‑second Quick‑Start

1. **Fork** the *openai‑realtime‑console* repo ➜ rename to `memphis‑voice‑agent`.
2. **Change model** in `/api/token` to `gpt‑4o‑mini‑realtime` (server code below).
3. **Add system‑prompt injector** in `App.jsx` (client code below).
4. **Deploy** to Vercel → free tier; set env var `OPENAI_API_KEY`.

That’s enough to go live. The rest of this doc explains every line.

---

## 1 . Prerequisites

| Item                   | Why                       | How                                                                          |
| ---------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| OpenAI API key         | serverless token endpoint | [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Realtime API access    | still in beta             | request in dashboard                                                         |
| Node ≥ 18              | local dev                 | `node -v`                                                                    |
| Modern browser (HTTPS) | WebRTC requires TLS       | Chrome / Safari                                                              |

---

## 2 . Repo Layout (Next .js example)

```
memphis-voice-agent/
  .env.local            # OPENAI_API_KEY=sk-…
  package.json
  next.config.js
  app/
    layout.jsx
    page.jsx            # homepage – mounts <VoiceAgent />
    api/
      token/route.js    # token endpoint (Next 14+)
  components/
    VoiceAgent.jsx      # adapted App.jsx
```

If your site is pure HTML, bundle the component with Vite and host the `/api/token` in a tiny Cloudflare Worker.

---

## 3 . Serverless **/api/token**

```js
export async function POST() {
  const resp = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-realtime",   // ← fast & cheap
      voice: "verse",                  // pick any OpenAI voice
    }),
  });

  if (!resp.ok) return new Response(await resp.text(), { status: 500 });
  return new Response(await resp.text(), { status: 200 });
}
```

**Why **``**?** ⇢ \~¼ the price and latency of full 4o; perfect for a public landing page.

---

## 4 . Client Widget (`VoiceAgent.jsx`)

### 4.1  Copy core logic

Grab `App.jsx`, `SessionControls`, and helpers from the sample repo.

### 4.2  Point to your token route

```diff
- const tokenResponse = await fetch("/token");
+ const tokenResponse = await fetch("/api/token");
```

### 4.3  Inject a **system prompt** once the data channel opens

```js
function sendSystemPrompt(sendEvent) {
  sendEvent({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "system",
      content: [{
        type: "input_text",
        text: `You are **Memphis AI**, a helpful assistant on memphis-ai.com.\n\nOnly answer questions related to Memphis AI or its services. If asked about something else, politely redirect.\n\n**Memphis AI Services**\n• AI Information Retrieval Systems – find & surface the right data at the right time.\n• Agentic AI Workflows – autonomous agents that streamline business processes.\n• Conversational AI Assistants – 24/7 virtual support that learns from each interaction.\n\nFocus on practical benefits and measurable results. When relevant, suggest which service best matches the visitor’s problem.`,
      }],
    },
  });
}

dataChannel.addEventListener("open", () => {
  setIsSessionActive(true);
  setEvents([]);
  sendSystemPrompt(sendClientEvent);   // NEW
});
```

That’s the entire “agent”. The rest of your send/receive code remains untouched.

### 4.4  (Optional) UI cleanup

- Hide raw JSON log ➜ comment `<EventLog>`.
- Replace the big start button with a mic icon for a floating widget.
- Add `muted` to the `<audio>` element until first user gesture (iOS autoplay rule).

---

## 5 . Event Flow Recap

| Step | Dir.           | Event                                    | Notes               |
| ---- | -------------- | ---------------------------------------- | ------------------- |
| 0    | client ⇒ model | **system prompt**                        | sets persona        |
| 1    | client ⇒ model | `conversation.item.create` (`role:user`) | from mic / STT      |
| 2    | client ⇒ model | `response.create`                        | cues answer         |
| 3    | model ⇒ client | `response.delta` + audio                 | stream text & voice |
| 4    | model ⇒ client | `response.done`                          | final chunk         |

Interrupt‑to‑barge: when user speaks, send `audio.stop` (coming soon) then new user item.

---

## 6 . Deployment (Vercel)

1. **Import GitHub repo → Vercel**.
2. Add env var `OPENAI_API_KEY` (Protect).
3. Build → Next .js auto.
4. Custom domain + SSL (free).
5. Share the link ✨.

**Cost model** (Apr 2025):\
`gpt-4o-mini-realtime` ≈ **\$0.0033 / min** (audio round‑trip).\
10 visitors × 3 min chat → **\$0.10** total.

Vercel Hobby = \$0 unless you exceed generous limits.

---

## 7 . Enhancements Roadmap

| Priority | Feature                       | Pointer                                              |
| -------- | ----------------------------- | ---------------------------------------------------- |
| ⭐        | Web‑Speech‑API STT in browser | lower latency vs server Whisper                      |
| ⭐        | Supabase persistence          | store conversation history for context continuity    |
| ☆        | Function calls                | surface *Book a Demo* or *Request Quote* actions     |
| ☆        | Voice cloning                 | switch to branded voice when OpenAI releases feature |

---

© 2025 Memphis AI – MIT licence.

