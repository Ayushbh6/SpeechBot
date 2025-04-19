# Ticket 7: System-Prompt Injection

**Objective**
Send a Memphis AI system prompt as the first message on the data channel.

**Steps**
1. In `VoiceAgent.jsx`, add:
   ```js
   function sendSystemPrompt(sendEvent) {
     sendEvent({
       type: 'conversation.item.create',
       item: {
         type: 'message',
         role: 'system',
         content: [{
           type: 'input_text',
           text: `You are Memphis AI, a helpful assistant on memphis-ai.com.\n\nOnly answer questions related to Memphis AI or its services.`
         }]
       }
     })
   }
   ```
2. In your data channel `open` handler, invoke:
   ```js
   dataChannel.addEventListener('open', () => {
     sendSystemPrompt(sendClientEvent)
     // ...then proceed
   })
   ```
3. Verify in console the system prompt is the first event.

**Acceptance Criteria**
- `sendSystemPrompt` helper exists.
- First event on a new session is the system message.
