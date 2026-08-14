# Recovery Assistant API

NestJS backend for the recovery assistant.

## AI chat

`POST /api/ai/chat` accepts Vercel AI SDK UI messages and streams the selected model's response as UI-message events.
Set `OPENAI_API_KEY` before starting the server; `OPENAI_BASE_URL` supports OpenAI-compatible providers and `OPENAI_MODEL` selects the model.

The endpoint intentionally has no domain prompt or tools yet. It exists solely to validate the model provider and Vercel AI SDK streaming integration.
