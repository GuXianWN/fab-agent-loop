# Recovery Assistant API

NestJS backend for the recovery assistant.

## AI chat

`POST /api/ai/chat` accepts a chat ID and one Vercel AI SDK user message, then streams a Mastra Agent response as UI-message events.
Set `OPENAI_API_KEY` before starting the server; `OPENAI_BASE_URL` supports OpenAI-compatible providers and `OPENAI_MODEL` selects the model.

The Mastra agent runs a bounded tool loop (up to five steps) and uses PostgreSQL-backed Memory for conversation and tool history. Its `get-current-time` tool returns the current time in Beijing (`Asia/Shanghai`).
