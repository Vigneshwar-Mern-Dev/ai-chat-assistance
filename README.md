# WhatsApp AI Dashboard

Simple personal WhatsApp assistant dashboard built with `Next.js`, `Tailwind CSS`, `Express`, `Socket.io`, `whatsapp-web.js`, and an AI provider (`OpenAI`, `OpenRouter`, `Groq`, or `Gemini`).

## What It Does

- Connects WhatsApp through QR login
- Shows realtime connection state
- Tracks recent private chats and messages
- Sends simple AI auto replies for personal chats
- Lets you reconnect, logout, regenerate QR, or reset the saved session

## Stack

- Frontend: `Next.js`, `Tailwind CSS`, `socket.io-client`
- Backend: `Node.js`, `Express`, `Socket.io`, `whatsapp-web.js`, `OpenAI`, `OpenRouter`, `Groq`, or `Gemini`

## Project Structure

```text
app/
components/
lib/
server/
  ai/
  bot/
  routes/
  services/
  socket/
  utils/
```

## Environment

Copy `.env.example` to `.env` and fill in one AI provider:

```env
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
DASHBOARD_API_TOKEN=change_this_local_token
NEXT_PUBLIC_DASHBOARD_API_TOKEN=change_this_local_token
CORS_ORIGINS=
AI_PROVIDER=groq
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Personal Chat
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant
GROQ_BASE_URL=https://api.groq.com/openai/v1
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

## Run

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.
Backend runs on `http://localhost:3001`.

## Important Notes

- AI replies only run for private chats.
- Group chats are ignored.
- Messages from yourself are ignored.
- Empty messages are ignored.
- Dashboard API routes require `DASHBOARD_API_TOKEN` when it is set.
- By default, CORS allows only localhost/127.0.0.1 browser origins. Set `CORS_ORIGINS` to a comma-separated list if you need stricter origins.
- Default reply delay is randomized between `5` and `15` seconds.

## Future Ready

The backend is separated enough to add later:

- CRM features
- memory
- analytics
- anti-ban logic
- voice notes
- image analysis
- multi-device improvements
