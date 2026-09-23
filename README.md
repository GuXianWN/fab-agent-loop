# Recovery Assistant

复机助手的聊天基础设施：Vue 3 SPA、NestJS API、Mastra Agent 与 PostgreSQL Memory、Vercel AI SDK UI-message SSE。

## Structure

- `new-ui/`: 当前 Vue 3 + Vite 前端。
- `backend/`: NestJS API，统一前缀为 `/api`；负责会话、投票和基于 Mastra Agent 的 DeepSeek 流式聊天。
- `shared/`: 本地 Node 类型包 `@recovery-assistant/shared`，导出 HTTP DTO、聊天、会话和 `R<T>` 响应类型；不得依赖 Nuxt、Nest、TypeORM 或 AI SDK。

会话标题保存在 `recovery_assistant.ra_chats`；消息历史和投票状态由 `@mastra/memory` + `@mastra/pg` 保存在 `recovery_assistant_mastra` schema。开发期的固定演示用户 ID 为 `demo_user`。

## Development

后端需要 `backend/.env` 中的 DeepSeek 与 PostgreSQL 配置；不要提交该文件。

```powershell
cd backend
pnpm migration:run
pnpm start:dev
```

```powershell
cd new-ui
pnpm dev -- --port 5173
```

前端通过 `VITE_API_BASE_URL` 连接后端；本地默认值为 `http://localhost:3001/api`。

除 `POST /api/ai/chat` 的 AI SDK SSE 外，所有 API 仅使用 `GET` 或 `POST`，并返回 `R<T>`：

```json
{ "code": 0, "data": {}, "msg": "success" }
```

后端使用 `R.success().data(value)` 构造成功响应；`code === 0` 表示成功。前端仅在 `new-ui/src/api/use-api.ts` 解包该响应。

前后端统一使用 Node 风格的类型导入：

```ts
import type { Chat, R } from '@recovery-assistant/shared';
```

## Validation

```powershell
cd backend
pnpm run build
cd ..\new-ui
pnpm typecheck
pnpm build
```
