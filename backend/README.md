# Recovery Assistant API

NestJS backend for the recovery assistant.

## AI chat

`POST /api/ai/chat` accepts Vercel AI SDK UI messages and streams a UI-message response.
Set `OPENAI_API_KEY` before starting the server; `OPENAI_BASE_URL` supports OpenAI-compatible providers and `OPENAI_MODEL` selects the model.

The current recovery tools are deliberately read-only mock adapters. They demonstrate the intended audited flow and cannot issue production commands.
