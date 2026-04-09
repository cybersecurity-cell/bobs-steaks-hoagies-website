# Call Transfer Strategy — Bob's Voice AI

## Problem
A customer gets frustrated with the AI or explicitly asks for a human.

---

## Detection: When to Transfer

Trigger a transfer when ANY of these occur:

### 1. Explicit keywords
```javascript
const ESCALATION_TRIGGERS = [
  "speak to someone", "real person", "human", "agent", "manager",
  "operator", "representative", "this isn't working", "forget it",
  "cancel", "just forget", "never mind", "this is stupid",
  "i give up", "not what i wanted"
];

function shouldTransfer(transcript) {
  const lower = transcript.toLowerCase();
  return ESCALATION_TRIGGERS.some(phrase => lower.includes(phrase));
}
```

### 2. Repeated failures (3+ misunderstood orders)
```javascript
if (session.failedAttempts >= 3) {
  triggerTransfer(session);
}
```

### 3. Negative sentiment (Gemini tool call)
```javascript
// Add to your Gemini function declarations:
{
  name: "escalate_to_human",
  description: "Transfer to human staff when customer is frustrated or needs help",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Why the transfer is needed" }
    }
  }
}
```

---

## Transfer Method 1: Warm Transfer via TwiML (RECOMMENDED)

When escalation triggers, your Cloud Run server returns TwiML to Twilio:

```javascript
// In your WebSocket handler (Cloud Run / Node.js)
async function triggerWarmTransfer(callSid, reason) {
  // 1. Gemini speaks a warm handoff message
  await sendGeminiAudio(
    "I completely understand. Let me connect you with our team right now " +
    "so they can personally take care of you. One moment please!"
  );

  // Wait for audio to finish playing (approx 3 seconds)
  await sleep(3000);

  // 2. Use Twilio REST API to redirect the call
  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.calls(callSid).update({
    twiml: `
      <Response>
        <Dial timeout="30" callerId="${TWILIO_PHONE_NUMBER}">
          <Number>${RESTAURANT_DIRECT_LINE}</Number>
        </Dial>
        <Say>We're sorry we couldn't connect you. Please call us back at
        4 4 5, 2 2 3, 4 8 9 1. Thank you for your patience!</Say>
      </Response>
    `
  });

  // 3. Log the escalation
  await db.run(
    `INSERT INTO escalations (call_sid, reason, timestamp) VALUES (?, ?, ?)`,
    [callSid, reason, new Date().toISOString()]
  );
}
```

---

## Transfer Method 2: SMS + Callback (When No Staff Available)

If after-hours or no one picks up:

```javascript
async function scheduleCallback(callerPhone, orderSummary) {
  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // Notify the customer
  await client.messages.create({
    body: `Hi! This is Bob's Steaks & Hoagies. We saw you had trouble ordering.
           A team member will call you back within 10 minutes.
           Your order attempt: ${orderSummary}`,
    from: TWILIO_PHONE_NUMBER,
    to: callerPhone
  });

  // Alert the restaurant owner/manager
  await client.messages.create({
    body: `⚠️ AI ESCALATION: Customer ${callerPhone} needs help.
           Order attempted: ${orderSummary}. Please call back ASAP.`,
    from: TWILIO_PHONE_NUMBER,
    to: OWNER_PHONE_NUMBER
  });
}
```

---

## Transfer Method 3: Voicemail Fallback

```javascript
// If restaurant line is busy or no answer after 20 seconds:
const twiml = `
  <Response>
    <Dial timeout="20" callerId="${TWILIO_PHONE_NUMBER}" action="/api/twilio/dial-status">
      <Number>${RESTAURANT_DIRECT_LINE}</Number>
    </Dial>
  </Response>
`;

// /api/twilio/dial-status — handles no-answer:
app.post('/api/twilio/dial-status', (req, res) => {
  const { DialCallStatus } = req.body;
  if (DialCallStatus === 'no-answer' || DialCallStatus === 'busy') {
    res.type('text/xml').send(`
      <Response>
        <Say>I'm sorry, our team is currently busy. Please leave a message
        after the tone and we'll call you right back.</Say>
        <Record maxLength="120" transcribe="true"
                transcribeCallback="/api/twilio/transcription" />
      </Response>
    `);
  }
});
```

---

## Environment Variables Needed in Cloud Run

```bash
RESTAURANT_DIRECT_LINE=+14452234891  # The actual restaurant phone
OWNER_PHONE_NUMBER=+1XXXXXXXXXX      # Owner's personal number for alerts
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX     # Twilio AI number
```

---

## Decision Flow

```
Customer speaks
      ↓
Gemini detects frustration / escalation keyword
      ↓
      ├── Business hours (11am-10pm)?
      │         ↓ YES
      │   Warm transfer → Restaurant direct line
      │         ↓ No answer (20s)
      │   Voicemail recording
      │
      └── After hours?
                ↓
          SMS to customer: "We'll call you back"
          SMS to owner: "Escalation alert"
```

---

## Recommended Gemini System Prompt Addition

Add this to your existing system prompt in Cloud Run:

```
ESCALATION RULES:
- If user says: "agent", "human", "manager", "this isn't working",
  "forget it", "cancel", "never mind" — immediately call the
  escalate_to_human function.
- If user sounds frustrated after 2 failed order attempts —
  call escalate_to_human.
- When escalating, always say something warm like:
  "I completely understand, let me get our team for you right away!"
- Never make the customer feel bad for asking for help.
```
